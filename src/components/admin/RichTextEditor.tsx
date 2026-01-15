"use client";

import React, { useState, useCallback, useEffect } from "react";
import { useEditor, EditorContent, Editor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import LinkExtension from "@tiptap/extension-link";
import ImageExtension from "@tiptap/extension-image";
import TextAlign from "@tiptap/extension-text-align";
import Underline from "@tiptap/extension-underline";
import Placeholder from "@tiptap/extension-placeholder";
import { TextStyle } from "@tiptap/extension-text-style";
import { Color } from "@tiptap/extension-color";
import Highlight from "@tiptap/extension-highlight";
import { Table } from "@tiptap/extension-table";
import { TableRow } from "@tiptap/extension-table-row";
import { TableCell } from "@tiptap/extension-table-cell";
import { TableHeader } from "@tiptap/extension-table-header";
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  Strikethrough,
  List,
  ListOrdered,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Link as LinkIcon,
  Image as ImageIcon,
  Code,
  Heading1,
  Heading2,
  Heading3,
  Undo,
  Redo,
  Palette,
  Highlighter,
  FileCode,
  Eye,
  Braces,
  Table as TableIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type EditorMode = "visual" | "html";

type Shortcode = {
  code: string;
  label: string;
  category?: string;
};

type RichTextEditorProps = {
  content: string;
  onChange: (content: string) => void;
  placeholder?: string;
  shortcodes?: Shortcode[];
  className?: string;
  minHeight?: string;
};

const ToolbarButton = ({
  onClick,
  active = false,
  disabled = false,
  title,
  children,
}: {
  onClick: () => void;
  active?: boolean;
  disabled?: boolean;
  title: string;
  children: React.ReactNode;
}) => (
  <button
    type="button"
    onClick={onClick}
    disabled={disabled}
    title={title}
    className={cn(
      "p-1.5 rounded-md transition-colors",
      active
        ? "bg-[color:var(--primary)] text-[color:var(--primary-foreground)]"
        : "hover:bg-[color:var(--muted)] text-[color:var(--muted-foreground)]",
      disabled && "opacity-50 cursor-not-allowed"
    )}
  >
    {children}
  </button>
);

const ToolbarDivider = () => (
  <div className="w-px h-6 bg-[color:var(--border)] mx-1" />
);

function EditorToolbar({
  editor,
  shortcodes,
  onInsertShortcode,
}: {
  editor: Editor | null;
  shortcodes?: Shortcode[];
  onInsertShortcode?: (code: string) => void;
}) {
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [showShortcodes, setShowShortcodes] = useState(false);

  if (!editor) return null;

  const colors = [
    "#000000", "#374151", "#6B7280", "#EF4444", "#F97316", 
    "#EAB308", "#22C55E", "#3B82F6", "#8B5CF6", "#EC4899",
  ];

  const setLink = () => {
    const previousUrl = editor.getAttributes("link").href;
    const url = window.prompt("URL:", previousUrl);
    if (url === null) return;
    if (url === "") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
      return;
    }
    editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
  };

  const addImage = () => {
    const url = window.prompt("Kép URL:");
    if (url) {
      editor.chain().focus().setImage({ src: url }).run();
    }
  };

  // Group shortcodes by category
  const groupedShortcodes = shortcodes?.reduce((acc, sc) => {
    const cat = sc.category || "Egyéb";
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(sc);
    return acc;
  }, {} as Record<string, Shortcode[]>);

  return (
    <div className="flex flex-wrap items-center gap-0.5 p-2 border-b border-[color:var(--border)] bg-[color:var(--muted)]/30">
      {/* Undo/Redo */}
      <ToolbarButton
        onClick={() => editor.chain().focus().undo().run()}
        disabled={!editor.can().undo()}
        title="Visszavonás"
      >
        <Undo className="w-4 h-4" />
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().redo().run()}
        disabled={!editor.can().redo()}
        title="Újra"
      >
        <Redo className="w-4 h-4" />
      </ToolbarButton>

      <ToolbarDivider />

      {/* Headings */}
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
        active={editor.isActive("heading", { level: 1 })}
        title="Címsor 1"
      >
        <Heading1 className="w-4 h-4" />
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        active={editor.isActive("heading", { level: 2 })}
        title="Címsor 2"
      >
        <Heading2 className="w-4 h-4" />
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
        active={editor.isActive("heading", { level: 3 })}
        title="Címsor 3"
      >
        <Heading3 className="w-4 h-4" />
      </ToolbarButton>

      <ToolbarDivider />

      {/* Text formatting */}
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleBold().run()}
        active={editor.isActive("bold")}
        title="Félkövér"
      >
        <Bold className="w-4 h-4" />
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleItalic().run()}
        active={editor.isActive("italic")}
        title="Dőlt"
      >
        <Italic className="w-4 h-4" />
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleUnderline().run()}
        active={editor.isActive("underline")}
        title="Aláhúzott"
      >
        <UnderlineIcon className="w-4 h-4" />
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleStrike().run()}
        active={editor.isActive("strike")}
        title="Áthúzott"
      >
        <Strikethrough className="w-4 h-4" />
      </ToolbarButton>

      <ToolbarDivider />

      {/* Color */}
      <div className="relative">
        <ToolbarButton
          onClick={() => setShowColorPicker(!showColorPicker)}
          title="Szín"
        >
          <Palette className="w-4 h-4" />
        </ToolbarButton>
        {showColorPicker && (
          <div className="absolute top-full left-0 mt-1 p-2 bg-[color:var(--card)] border border-[color:var(--border)] rounded-lg shadow-lg z-50 grid grid-cols-5 gap-1">
            {colors.map((color) => (
              <button
                key={color}
                onClick={() => {
                  editor.chain().focus().setColor(color).run();
                  setShowColorPicker(false);
                }}
                className="w-6 h-6 rounded border border-[color:var(--border)]"
                style={{ backgroundColor: color }}
                title={color}
              />
            ))}
            <button
              onClick={() => {
                editor.chain().focus().unsetColor().run();
                setShowColorPicker(false);
              }}
              className="w-6 h-6 rounded border border-[color:var(--border)] text-xs"
              title="Alapértelmezett"
            >
              ✕
            </button>
          </div>
        )}
      </div>

      <ToolbarButton
        onClick={() => editor.chain().focus().toggleHighlight().run()}
        active={editor.isActive("highlight")}
        title="Kiemelés"
      >
        <Highlighter className="w-4 h-4" />
      </ToolbarButton>

      <ToolbarDivider />

      {/* Lists */}
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        active={editor.isActive("bulletList")}
        title="Felsorolás"
      >
        <List className="w-4 h-4" />
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        active={editor.isActive("orderedList")}
        title="Számozott lista"
      >
        <ListOrdered className="w-4 h-4" />
      </ToolbarButton>

      <ToolbarDivider />

      {/* Alignment */}
      <ToolbarButton
        onClick={() => editor.chain().focus().setTextAlign("left").run()}
        active={editor.isActive({ textAlign: "left" })}
        title="Balra"
      >
        <AlignLeft className="w-4 h-4" />
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().setTextAlign("center").run()}
        active={editor.isActive({ textAlign: "center" })}
        title="Középre"
      >
        <AlignCenter className="w-4 h-4" />
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().setTextAlign("right").run()}
        active={editor.isActive({ textAlign: "right" })}
        title="Jobbra"
      >
        <AlignRight className="w-4 h-4" />
      </ToolbarButton>

      <ToolbarDivider />

      {/* Link & Image */}
      <ToolbarButton
        onClick={setLink}
        active={editor.isActive("link")}
        title="Link"
      >
        <LinkIcon className="w-4 h-4" />
      </ToolbarButton>
      <ToolbarButton onClick={addImage} title="Kép">
        <ImageIcon className="w-4 h-4" />
      </ToolbarButton>

      <ToolbarDivider />

      {/* Code */}
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleCodeBlock().run()}
        active={editor.isActive("codeBlock")}
        title="Kód blokk"
      >
        <Code className="w-4 h-4" />
      </ToolbarButton>

      <ToolbarDivider />

      {/* Table */}
      <ToolbarButton
        onClick={() => editor.chain().focus().insertTable({ rows: 2, cols: 2, withHeaderRow: false }).run()}
        title="Táblázat beszúrása (2x2)"
      >
        <TableIcon className="w-4 h-4" />
      </ToolbarButton>

      {/* Shortcodes dropdown */}
      {shortcodes && shortcodes.length > 0 && onInsertShortcode && (
        <>
          <ToolbarDivider />
          <div className="relative">
            <ToolbarButton
              onClick={() => setShowShortcodes(!showShortcodes)}
              title="Shortcode beszúrása"
            >
              <Braces className="w-4 h-4" />
            </ToolbarButton>
            {showShortcodes && (
              <div className="absolute top-full left-0 mt-1 w-72 max-h-80 overflow-y-auto bg-[color:var(--card)] border border-[color:var(--border)] rounded-lg shadow-lg z-50">
                {groupedShortcodes &&
                  Object.entries(groupedShortcodes).map(([category, codes]) => (
                    <div key={category}>
                      <div className="px-3 py-1.5 text-xs font-semibold text-[color:var(--muted-foreground)] bg-[color:var(--muted)]/50 sticky top-0">
                        {category}
                      </div>
                      {codes.map((sc) => (
                        <button
                          key={sc.code}
                          onClick={() => {
                            onInsertShortcode(sc.code);
                            setShowShortcodes(false);
                          }}
                          className="w-full px-3 py-2 text-left text-sm hover:bg-[color:var(--muted)] transition-colors"
                        >
                          <span className="font-mono text-xs text-[color:var(--primary)]">
                            {sc.code}
                          </span>
                          <span className="ml-2 text-[color:var(--muted-foreground)]">
                            {sc.label}
                          </span>
                        </button>
                      ))}
                    </div>
                  ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}

export function RichTextEditor({
  content,
  onChange,
  placeholder = "Kezdj el írni...",
  shortcodes,
  className,
  minHeight = "300px",
}: RichTextEditorProps) {
  const [mode, setMode] = useState<EditorMode>("visual");
  const [htmlContent, setHtmlContent] = useState(content);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3],
        },
      }),
      LinkExtension.extend({ name: "customLink" }).configure({
        openOnClick: false,
        HTMLAttributes: {
          class: "text-[color:var(--primary)] underline",
        },
      }),
      ImageExtension.configure({
        HTMLAttributes: {
          class: "max-w-full rounded-lg",
        },
      }),
      TextAlign.configure({
        types: ["heading", "paragraph"],
      }),
      Underline.extend({ name: "customUnderline" }),
      Placeholder.configure({
        placeholder,
      }),
      TextStyle,
      Color,
      Highlight.configure({
        HTMLAttributes: {
          class: "bg-yellow-200 dark:bg-yellow-800",
        },
      }),
      Table.configure({
        resizable: true,
        HTMLAttributes: {
          class: "border-collapse border border-gray-300",
        },
      }),
      TableRow,
      TableHeader,
      TableCell,
    ],
    content,
    immediatelyRender: false, // Prevent SSR hydration mismatch and duplicate warnings
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      setHtmlContent(html);
      onChange(html);
    },
    editorProps: {
      attributes: {
        class: cn(
          "prose prose-sm dark:prose-invert max-w-none focus:outline-none p-4",
          "prose-headings:font-bold prose-h1:text-2xl prose-h2:text-xl prose-h3:text-lg",
          "prose-p:my-2 prose-ul:my-2 prose-ol:my-2",
          "prose-a:text-[color:var(--primary)]"
        ),
        style: `min-height: ${minHeight}`,
      },
    },
  });

  // Sync content when it changes externally
  useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      editor.commands.setContent(content);
      setHtmlContent(content);
    }
  }, [content, editor]);

  const handleHtmlChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      const newHtml = e.target.value;
      setHtmlContent(newHtml);
      onChange(newHtml);
      if (editor) {
        editor.commands.setContent(newHtml);
      }
    },
    [editor, onChange]
  );

  const insertShortcode = useCallback(
    (code: string) => {
      if (mode === "visual" && editor) {
        editor.chain().focus().insertContent(code).run();
      } else {
        // Insert at cursor in textarea (simplified - appends)
        setHtmlContent((prev) => prev + code);
        onChange(htmlContent + code);
      }
    },
    [mode, editor, htmlContent, onChange]
  );

  return (
    <div
      className={cn(
        "border border-[color:var(--border)] rounded-lg overflow-hidden bg-[color:var(--card)]",
        className
      )}
    >
      {/* Mode switcher */}
      <div className="flex items-center justify-between px-2 py-1.5 border-b border-[color:var(--border)] bg-[color:var(--muted)]/50">
        <div className="flex items-center gap-1">
          <Button
            type="button"
            size="sm"
            variant={mode === "visual" ? "default" : "ghost"}
            onClick={() => setMode("visual")}
            className="h-7 gap-1.5 text-xs"
          >
            <Eye className="w-3.5 h-3.5" />
            Vizuális
          </Button>
          <Button
            type="button"
            size="sm"
            variant={mode === "html" ? "default" : "ghost"}
            onClick={() => setMode("html")}
            className="h-7 gap-1.5 text-xs"
          >
            <FileCode className="w-3.5 h-3.5" />
            HTML
          </Button>
        </div>
      </div>

      {/* Toolbar (only in visual mode) */}
      {mode === "visual" && (
        <EditorToolbar
          editor={editor}
          shortcodes={shortcodes}
          onInsertShortcode={insertShortcode}
        />
      )}

      {/* Editor content */}
      {mode === "visual" ? (
        <EditorContent editor={editor} />
      ) : (
        <textarea
          value={htmlContent}
          onChange={handleHtmlChange}
          className="w-full font-mono text-sm p-4 bg-[color:var(--card)] text-[color:var(--foreground)] focus:outline-none resize-none"
          style={{ minHeight }}
          placeholder="<p>HTML tartalom...</p>"
        />
      )}
    </div>
  );
}

export default RichTextEditor;
