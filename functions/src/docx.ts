// The DOCX generation of the admin documents (contract, data sheet, declarations): the placeholders of a template, written as {NAME}, are
// filled from the data of the contract. Moved here from index.ts so that it can be tested without Firebase.

import PizZip from "pizzip";
import Docxtemplater from "docxtemplater";

export function cleanDocxXml(xmlContent: string): string {
  // Fix Word's tendency to split placeholders across multiple XML tags
  // Strategy: Find and merge split placeholders by processing w:r (run) elements
  
  let result = xmlContent;
  
  // Step 1: Find all w:r elements and merge adjacent ones that form a placeholder
  // Word often splits {PLACEHOLDER} into multiple runs like:
  // <w:r><w:t>{</w:t></w:r><w:r><w:t>PLACEHOLDER</w:t></w:r><w:r><w:t>}</w:t></w:r>
  
  // More aggressive approach: temporarily remove all XML tags between { and }
  // Then reconstruct with the full placeholder in a single text node
  
  // Find potential placeholder boundaries in the XML
  const openBracePattern = /<w:t[^>]*>\{<\/w:t>/g;
  const closeBracePattern = /<w:t[^>]*>\}<\/w:t>/g;
  
  // Get plain text to find all valid placeholders
  const plainText = result.replace(/<[^>]+>/g, "");
  const placeholderMatches = plainText.match(/\{[A-Z][A-Z0-9_]*\}/g) || [];
  
  console.log("Plain text placeholders found:", placeholderMatches);
  
  // For each placeholder, find it in the XML (even if split) and replace with unified version
  for (const placeholder of placeholderMatches) {
    const code = placeholder.slice(1, -1);
    
    // Build pattern that matches the placeholder split across any XML tags
    // This matches { followed by optional tags, then each char of the code with optional tags between
    let patternParts = ["\\{"];
    for (const char of code) {
      // Allow any XML tags (including </w:t>, </w:r>, <w:r>, <w:t>, etc.) between characters
      patternParts.push(`(?:</w:t>)?(?:</w:r>)?(?:<w:r[^>]*>)?(?:<w:rPr>.*?</w:rPr>)?(?:<w:t[^>]*>)?`);
      patternParts.push(char.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
    }
    patternParts.push(`(?:</w:t>)?(?:</w:r>)?(?:<w:r[^>]*>)?(?:<w:rPr>.*?</w:rPr>)?(?:<w:t[^>]*>)?`);
    patternParts.push("\\}");
    
    const fullPattern = patternParts.join("");
    
    try {
      const regex = new RegExp(fullPattern, "gs");
      const beforeReplace = result;
      result = result.replace(regex, `{${code}}`);
      if (beforeReplace !== result) {
        console.log(`Fixed split placeholder: {${code}}`);
      }
    } catch (e) {
      console.log(`Regex error for ${code}:`, e);
    }
  }
  
  return result;
}

export function generateDocxFromTemplate(docxBuffer: Buffer, data: Record<string, string>): Buffer {
  const zip = new PizZip(docxBuffer);
  
  // Pre-process XML files to fix split placeholders
  const xmlFiles = ["word/document.xml", "word/header1.xml", "word/header2.xml", "word/header3.xml", 
                    "word/footer1.xml", "word/footer2.xml", "word/footer3.xml"];
  
  for (const fileName of xmlFiles) {
    if (zip.files[fileName]) {
      const content = zip.files[fileName].asText();
      const cleanedContent = cleanDocxXml(content);
      zip.file(fileName, cleanedContent);
      
      // Debug: Log found placeholders before and after cleanup
      if (fileName === "word/document.xml") {
        const plainTextBefore = content.replace(/<[^>]+>/g, "");
        
        // Log sample of plain text to see content
        console.log("Plain text sample (first 500 chars):", plainTextBefore.substring(0, 500));
        
        // Try both regex patterns
        const placeholdersBefore1 = plainTextBefore.match(/\{[A-Z][A-Z0-9_]*\}/g) || [];
        const placeholdersBefore2 = plainTextBefore.match(/\{([A-Z0-9_]+)\}/g) || [];
        console.log("Placeholders BEFORE (pattern 1):", placeholdersBefore1);
        console.log("Placeholders BEFORE (pattern 2):", placeholdersBefore2);
        
        // Check for any curly brace patterns
        const anyBraces = plainTextBefore.match(/\{[^{}]+\}/g) || [];
        console.log("Any brace patterns found:", anyBraces.slice(0, 10));
      }
    }
  }
  
  const now = new Date();
  const fullData: Record<string, string> = {
    ...data,
    DATUM: data.DATUM || now.toLocaleDateString("hu-HU"),
    DATUM_SZO: data.DATUM_SZO || now.toLocaleDateString("hu-HU", { year: "numeric", month: "long", day: "numeric" }),
    EV: data.EV || now.getFullYear().toString(),
    HONAP: data.HONAP || now.toLocaleDateString("hu-HU", { month: "long" }),
    NAP: data.NAP || now.getDate().toString(),
  };

  console.log("Full data being applied:", JSON.stringify(Object.keys(fullData).slice(0, 15)));

  // A tag that has no value in the data is written as nothing, never as the text "undefined" (the default of docxtemplater). The names of such
  // tags go to the log (names only, no data), so a template that asks for a field the code does not give is noticed.
  const missingTags = new Set<string>();
  const doc = new Docxtemplater(zip, {
    paragraphLoop: true,
    linebreaks: true,
    delimiters: { start: "{", end: "}" },
    nullGetter: (part: { value?: string }) => {
      if (part.value) missingTags.add(part.value);
      return "";
    },
  });

  try {
    doc.render(fullData);
  } catch (error) {
    console.error("Docxtemplater render error:", error);
    throw error;
  }
  if (missingTags.size > 0) console.warn("Template tags without a value:", [...missingTags].join(", "));

  return doc.getZip().generate({ type: "nodebuffer" });
}
