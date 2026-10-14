import type { LegalDocumentContent } from "./types";

/**
 * GTC 3.0 – effective from 1 January 2026.
 * Mirrors `aszf-hu.ts` section by section; the PDF is served from
 * `public/legal/gtc-v3.0-2026-01-01-en.pdf`.
 */
export const gtcEn: LegalDocumentContent = {
  language: "en",
  title: "General Terms and Conditions",
  subtitle: "relating to registered office services and service of process agent services",
  lead:
    "Service provider: E-Marketplace Szolgáltató Korlátolt Felelősségű Társaság. These GTC set out the general terms on which the registered office service, the service of process agent service and the related office use and mail handling services may be used.",
  translationNotice:
    "This is an English translation of the Hungarian General Terms and Conditions. In the event of any discrepancy between the Hungarian and the English text, the Hungarian text shall prevail.",
  sections: [
    {
      id: "introductory",
      number: "1.",
      title: "Introductory provisions",
      blocks: [
        {
          kind: "p",
          text:
            "1.1. These General Terms and Conditions (the GTC) set out the general terms on which the registered office service, the service of process agent service and the related office use and mail handling services provided by the Agent may be used.",
        },
        { kind: "p", text: "1.2. Details of the Agent:" },
        {
          kind: "table",
          head: ["Item", "Value"],
          rows: [
            ["Name", "E-Marketplace Szolgáltató Korlátolt Felelősségű Társaság"],
            ["Registered office", "1064 Budapest, Izabella utca 68/B., Hungary"],
            ["Company registration number", "01-09-296567"],
            ["Tax number", "25924916-2-42"],
            ["Representative", "Zoltán Kádár, managing director (sole right of representation)"],
            ["E-mail", "[emarketplacekft@gmail.com](mailto:emarketplacekft@gmail.com)"],
            ["Telephone", "[06 50 104 61 16](tel:+36501046116)"],
            ["Website", "[https://e-marketplace.hu](https://e-marketplace.hu)"],
          ],
        },
        {
          kind: "p",
          text:
            "1.3. The Agent’s registered office service activity falls within the scope of Decree 7/2017 (VI. 1.) IM on registered office services (the Decree). Under Section 1(1) of Act LIII of 2017 on the Prevention and Combating of Money Laundering and Terrorist Financing (the AML Act / Pmt.), the Agent qualifies as a service provider and is subject to the obligations set out in that Act.",
        },
      ],
    },
    {
      id: "definitions",
      number: "2.",
      title: "Definitions",
      blocks: [
        {
          kind: "p",
          text:
            "2.1. **Contract:** the individual agency agreement concluded between the Parties, of which these GTC and their annexes form an inseparable part.",
        },
        { kind: "p", text: "2.2. **Agent:** the company identified in Clause 1.2 and its legal successors." },
        {
          kind: "p",
          text:
            "2.3. **Principal:** the legal entity, other organisation, sole trader or natural person who uses the Agent’s service as a contracting party.",
        },
        { kind: "p", text: "2.4. **Parties:** the Agent and the Principal together." },
        {
          kind: "p",
          text:
            "2.5. **Property:** the property at 1064 Budapest, Izabella utca 68/B., which is in the lawful use of the Agent and which the Agent provides as the registered office, or as a site or branch office, of the Principal.",
        },
        {
          kind: "p",
          text:
            "2.6. **Registered office service:** the service under the Decree in the course of which the Agent provides the Property as the registered office of the Principal and performs the tasks set out in the Decree, in the Contract and in these GTC.",
        },
        {
          kind: "p",
          text:
            "2.7. **Service of process agent service:** the performance of the duties of a service of process agent under Act V of 2006 on Public Company Information, Company Registration and Winding-up Proceedings (the Company Act / Ctv.) for a foreign member, executive officer or other foreign person of the Principal registered in the company register.",
        },
        {
          kind: "p",
          text:
            "2.8. **Official item:** a letter or document addressed to the company name of the Principal and originating from an authority, a court, a financial institution, a public utility provider or another organisation or person.",
        },
        { kind: "p", text: "2.9. **Civil Code (Ptk.):** Act V of 2013 on the Civil Code." },
        { kind: "p", text: "2.10. **Taxation Rules Act (Art.):** Act CL of 2017 on the Rules of Taxation." },
        { kind: "p", text: "2.11. **Fee Schedule:** Annex 1 to these GTC." },
        {
          kind: "p",
          text:
            "2.12. **Business day:** a business day according to the Hungarian working calendar. Saturdays, Sundays, public holidays and other days declared rest days by law do not qualify as business days and are not counted in the time limits set out in these GTC. An item received after 16:00 on a business day is deemed to have been received on the following business day.",
        },
      ],
    },
    {
      id: "scope",
      number: "3.",
      title: "Scope of the GTC, formation of the Contract",
      blocks: [
        {
          kind: "p",
          text:
            "3.1. The Contract is formed by the written agreement of the Parties. Under Section 1(1) of the Decree, a written agency agreement must be concluded for the registered office service; the Contract is not formed orally or by implied conduct.",
        },
        {
          kind: "p",
          text:
            "3.2. The Agent publishes the GTC in force from time to time on its website and makes them available to the Principal before the Contract is concluded. By signing the Contract, the Principal acknowledges that it became acquainted with the content of the GTC before the Contract was concluded, that it understood its provisions and that it accepted them as binding upon itself.",
        },
        {
          kind: "note",
          text:
            "3.3. **Specific notice of unusual terms (Section 6:78(2)–(3) of the Civil Code).** The Agent expressly and separately draws the Principal’s attention to the following terms, which contain provisions departing, to the Principal’s detriment, from customary contractual practice. These terms become part of the Contract only if the Principal expressly accepts them:",
        },
        {
          kind: "lettered",
          items: [
            "payment of the fee annually and in advance, and the non-refundable nature of the fee paid (Clauses 7.2 and 7.6);",
            "the automatic renewal of the Contract and the automatic invoicing for the following year (Clause 12.2);",
            "the exclusion of the right of ordinary termination within one year of the conclusion of the Contract (Clause 12.4);",
            "the annual, inflation-linked adjustment of the fee (Clause 7.7);",
            "the right to amend the GTC unilaterally (Clause 8);",
            "the limitation of the Agent’s liability for damages (Clause 10);",
            "the contractual penalty stipulated for the case where the Principal does not move its registered office after the Contract has terminated (Clause 12.9);",
            "the presumption of delivery applying to declarations made by electronic means (Clause 14.3);",
            "the cases of termination with immediate effect under Clause 12.7.",
          ],
        },
        {
          kind: "p",
          text:
            "The Principal acknowledges its express acceptance of these terms by a separate signature placed in the Contract at the point designated for this purpose (or by signing the Contract, if the Contract expressly refers back to this Clause).",
        },
        {
          kind: "p",
          text:
            "3.4. The Contract and these GTC are governed by Hungarian law. The Hungarian courts have exclusive jurisdiction over disputes arising from the Contract or from these GTC; the Parties stipulate the proceedings of the Hungarian court having subject-matter and territorial competence for the resolution of any dispute.",
        },
        {
          kind: "p",
          text:
            "3.5. In the legal relationship between the Parties, the Principal’s own general terms and conditions, purchasing terms or other general terms do not apply, unless the Agent has expressly accepted them in writing.",
        },
      ],
    },
    {
      id: "registered-office",
      number: "4.",
      title: "Content of the registered office service",
      blocks: [
        {
          kind: "p",
          text:
            "4.1. The Agent provides the Property as the registered office of the Principal for the term of the Contract and consents to the Principal reporting and stating the Property as its registered office before the Court of Registration, the state tax and customs authority and every other authority. The Agent issues, simultaneously with the conclusion of the Contract, a consent statement on the use of the registered office, set out in a separate document and usable in company registration proceedings.",
        },
        {
          kind: "p",
          text:
            "4.2. The Agent arranges for the Principal’s company sign to be placed on the Property in a position clearly visible from the public area, in accordance with Section 2(2) of the Decree.",
        },
        {
          kind: "p",
          text:
            "4.3. The Agent’s office hours are: 10:00–16:00 on business days. Documents may be collected in person and the office may be used at a time agreed in advance.",
        },
        {
          kind: "p",
          text:
            "4.4. **Mail handling.** The Agent arranges for the receipt of postal items addressed to the company name of the Principal and sent to the address of the Property, and notifies the Principal of the receipt by electronic means at the e-mail address given in the Contract, within the time limit set out in Section 3 of the Decree, within 1 (one) business day of receipt.",
        },
        {
          kind: "p",
          text: "4.5. The Agent is entitled to accept only items addressed to the company name of the Principal. It does not accept:",
        },
        {
          kind: "lettered",
          items: [
            "items addressed solely to the name of a natural person addressee;",
            "goods parcels, items sent for commercial purposes, cash-on-delivery items and items that are not free of charge, unless the Principal has paid their full cost in advance;",
            "items requiring separate storage, refrigeration or a licence, or dangerous items.",
          ],
        },
        {
          kind: "p",
          text:
            "4.6. Simultaneously with the conclusion of the Contract, the Principal grants, in a separate document, a postal authorisation to the Agent and to the persons acting on behalf of the Agent for the receipt and opening of items and for becoming acquainted with their content. The handing over of the postal authorisation is a condition of the Contract entering into force. The Agent and the persons acting on behalf of the Agent are required to preserve the content of the items and the secrecy of correspondence and business secrets contained in them in accordance with Clause 11.",
        },
        {
          kind: "p",
          text:
            "4.7. On the basis of the postal authorisation, the Agent opens official items, scans them in PDF format and sends the scanned document to the e-mail address given by the Principal within 1–2 (one to two) business days of receipt. For reasons of volume, the Agent is required to scan no more than 20 pages within a single document; in the case of documents exceeding 20 pages, the Agent notifies the Principal of this fact and undertakes to scan the further pages for the separate fee set out in the Fee Schedule.",
        },
        {
          kind: "p",
          text:
            "4.8. The Agent notifies the Principal of the arrival of items – of the fact of arrival and of the identification of the sender and the item – within 1 (one) business day of receipt also where no scanning takes place under Clause 4.5, 4.7 or 7.5.",
        },
        {
          kind: "p",
          text:
            "4.9. **Registration of items and the system of electronic delivery.** The Agent records and registers incoming items in its own closed administrative system (app.smartszekhely.hu); the register contains the identifier of the item, the sender, the date of receipt and the time of scanning and forwarding. The electronic sending of scanned documents takes place through the Brevo mailing system, which logs the fact and time of dispatch, of delivery and – where this is technically available – of opening.",
        },
        {
          kind: "p",
          text:
            "4.9.1. The Parties record that the logs generated in the Agent’s system and in the Brevo system serve to evidence the processing and electronic sending of the item. At the Principal’s request, or in the event of a dispute, the Agent makes the log data available in the form of an extract. The Parties regard the log data as evidence suitable for proving performance; evidence to the contrary is admissible.",
        },
        {
          kind: "p",
          text:
            "4.9.2. The Principal acknowledges that delivery is completed by dispatch to the e-mail address given by it. The Principal is responsible for ensuring that the e-mail address given is operational and that items sent by the Agent are not placed in the spam folder or rejected; the Principal is required to permit (whitelist) the Agent’s sending address.",
        },
        {
          kind: "p",
          text:
            "4.10. **Document handling, document list.** The Agent handles the Principal’s documents and movable property separately from those of its other principals and from its own documents and movable property, and keeps an itemised, up-to-date list of documents and list of movable property in accordance with Section 2(3)–(4) of the Decree.",
        },
        {
          kind: "p",
          text:
            "4.11. The Principal is required to identify in the Contract those of its documents which it keeps at the Property or holds available there. Under Section 2(1) of the Decree, at least the Principal’s company documents, official licences, documents relating to its data reporting obligations towards the tax authority and its financial statements under the Accounting Act must be held available at the registered office.",
        },
        {
          kind: "p",
          text:
            "4.12. In the course of an official inspection held at the registered office, the Agent cooperates as required by law, does not obstruct the proceedings and notifies the Principal without delay of the inspection and of the documents handed over to it in the course of the inspection. Any official coercive measure may extend only to the documents and movable property of the Principal.",
        },
        {
          kind: "p",
          text:
            "4.13. The Agent keeps the items until they are handed over to the Principal in a documented manner, but no later than 30 (thirty) days after the termination of the Contract. The Agent is not required to forward items by post; it carries out forwarding at the written request of the Principal, where the postal charge and the handling fee set out in the Fee Schedule have been paid in advance.",
        },
        {
          kind: "p",
          text:
            "4.14. In view of Section 3 of the Decree, the Agent may not use, and the Principal may not request, any postal service (in particular redirection) that results in an item of the Principal being accepted at an address other than the registered office.",
        },
        {
          kind: "p",
          text:
            "4.15. **Tasks outside the content of the service.** The Agent’s service does not include bookkeeping, payroll, the preparation of tax returns, legal representation, legal or tax advice, representation in company registration proceedings, the monitoring of the Principal’s deadlines, nor the interpretation of the content of items or the provision of information to the Principal in that regard. The Agent does not examine or assess the content of items.",
        },
      ],
    },
    {
      id: "process-agent",
      number: "5.",
      title: "Service of process agent service",
      blocks: [
        {
          kind: "p",
          text:
            "5.1. In the case expressly recorded in the Contract, and for a separate fee, the Agent performs the duties of a service of process agent for the Principal’s foreign person (member, executive officer) registered in the company register. The service of process agency relationship is created by the signing of the document on the appointment and its acceptance, and becomes a matter of public authenticity in the company register upon registration.",
        },
        {
          kind: "p",
          text:
            "5.2. As service of process agent, the Agent accepts the official documents sent to the foreign person in connection with the operation of the company, documents the receipt in its register (recording of arrival) and forwards the document in the manner and within the time limit set out in Clause 4.7.",
        },
        {
          kind: "p",
          text:
            "5.3. The Agent declares that its acceptance of the position of service of process agent is not subject to any prohibitive or restrictive provision of law, and that it is not a member, executive officer or supervisory board member of the Principal company.",
        },
        {
          kind: "p",
          text:
            "5.4. The Principal and the foreign person acknowledge that, in respect of documents lawfully served on the service of process agent, the legal consequences of service take effect as provided by law, irrespective of when the foreign person received the document from its agent or became aware of it.",
        },
        {
          kind: "p",
          text:
            "5.5. If the service of process agency relationship terminates, the Agent follows the procedure set out in the Company Act: it informs the foreign person in writing of the termination of the appointment (its resignation) and simultaneously calls upon that person to appoint a new service of process agent. The Principal and the foreign person acknowledge that if, within 60 (sixty) days of that notice, no new service of process agent is appointed and reported to the Court of Registration, the Agent may initiate legality supervision proceedings before the Court of Registration, the legal consequences of which (a fine, the appointment of a supervisory commissioner, proceedings for the dissolution of a company with an unknown registered office) are borne by the Principal and its executive officer.",
        },
        {
          kind: "p",
          text:
            "5.6. The Agent performs the duties of a service of process agent until its resignation takes effect, or until the time specified by law, after which it is not entitled to accept documents sent to it.",
        },
      ],
    },
    {
      id: "office-use",
      number: "6.",
      title: "Office use, use of the meeting room",
      blocks: [
        {
          kind: "p",
          text:
            "6.1. The Principal is entitled to use the Eco-office co-working office in accordance with the package recorded in the Contract. The use of the office does not constitute exclusive possession of the Property and does not create a lease relationship.",
        },
        {
          kind: "p",
          text:
            "6.2. The meeting room may be used on the basis of a prior booking, in accordance with the Agent’s price list in force from time to time. The Principal uses the office and the meeting room in accordance with their intended purpose and with the house rules, and is liable for any damage it causes under the rules of the Civil Code.",
        },
      ],
    },
    {
      id: "fees",
      number: "7.",
      title: "Fees, payment terms",
      blocks: [
        {
          kind: "p",
          text:
            "7.1. The fees for the Agent’s services are set out in the Fee Schedule. The fees are net amounts, to which value added tax at the rate in force from time to time is added.",
        },
        {
          kind: "p",
          text:
            "7.2. The Principal pays the fee for a period of **12 (twelve) months, in advance and in a single amount**. The Agent issues the invoice for the fee before the start of the service period and sends it to the Principal by electronic means. The provision of the service, and the issue of the consent statement on the use of the registered office, are conditional on the full amount of the fee being credited to the Agent’s bank account.",
        },
        {
          kind: "p",
          text:
            "7.3. The date of payment is the date on which the fee is credited to the Agent’s bank account. The costs of the transfer are borne by the Party initiating the transfer.",
        },
        {
          kind: "p",
          text:
            "7.4. In the event of late payment, the Agent is entitled to default interest under Section 6:155 of the Civil Code and to the flat-rate collection cost of EUR 40 under Act IX of 2016 on flat-rate collection costs, and may further claim its documented costs incurred in connection with the collection of the claim.",
        },
        {
          kind: "p",
          text:
            "7.5. If the Principal is in arrears with the fee for more than 30 (thirty) days, the Agent is entitled to suspend the scanning and forwarding of items until the arrears are paid. In this case too, the Agent notifies the Principal of the arrival of the item in accordance with Clause 4.8 and keeps the item.",
        },
        {
          kind: "p",
          text:
            "7.6. If the Contract terminates before the expiry of its term – including termination by the Principal, termination with immediate effect on account of a breach by the Principal, and the case where the Principal moves its registered office before the expiry of the service period – the fee already paid is **non-refundable**, and the Agent retains it as consideration for the availability of the service. The Principal acknowledges this term by its express acceptance under Clause 3.3.",
        },
        {
          kind: "p",
          text:
            "7.7. **Fee adjustment.** The Agent adjusts the fee automatically once a year, by an amount equal to the consumer price index (inflation) published by the Hungarian Central Statistical Office for the preceding calendar year. The adjusted fee applies from the first day of the calendar month following the publication and takes effect for the next period invoiced in advance; the Agent informs the Principal of the adjustment in writing, simultaneously with the issue of the invoice. The extent of the adjustment may not exceed the level of the consumer price index. If the Agent does not exercise the right of adjustment within 90 (ninety) days of the publication, it waives that right for the year concerned.",
        },
        {
          kind: "p",
          text:
            "7.8. The Principal acknowledges that the Agent is also entitled to the separate fees set out in the Fee Schedule, in particular for parcel storage, letter storage, scanning in excess of 20 pages, the handling of postal forwarding, the expedited release of documents, participation in an official inspection and the administration associated with an amendment of the Contract.",
        },
      ],
    },
    {
      id: "amendment",
      number: "8.",
      title: "Unilateral amendment of the GTC",
      blocks: [
        {
          kind: "p",
          text: "8.1. The Agent is entitled to amend these GTC unilaterally, solely where one of the following grounds exists:",
        },
        {
          kind: "lettered",
          items: [
            "a change in the legislation, official requirements or a court or authority decision applicable to the service;",
            "a change in the contractual terms or fees of a third party used for the provision of the service (postal service provider, IT service provider, owner of the Property);",
            "the extension of the content of the service or the introduction of a new service element;",
            "a change in the Agent’s operation, organisation or data;",
            "the correction of an obvious drafting error or inconsistency that does not substantively affect the Principal’s rights and obligations.",
          ],
        },
        {
          kind: "p",
          text:
            "8.2. The Agent sends the amendment – identifying the clauses concerned, the reason for the amendment and the date on which it enters into force – to the Principal by electronic means at least 30 (thirty) days before it enters into force, and publishes it on its website.",
        },
        {
          kind: "p",
          text:
            "8.3. If the Principal does not accept the amendment, it is entitled, within 30 (thirty) days of the notice of the amendment, to terminate the Contract in writing with effect from the date on which the amendment enters into force; the prohibition on termination under Clause 12.4 does not preclude the exercise of this right of termination. In this case, the Agent refunds to the Principal the proportionate part of the fee already paid that relates to the unused period.",
        },
        {
          kind: "p",
          text:
            "8.4. If the Principal does not terminate the Contract within the time limit set out in Clause 8.3, the amendment becomes part of the Contract on the date on which it enters into force. The automatic fee adjustment under Clause 7.7 does not qualify as a unilateral amendment of the Contract.",
        },
        { kind: "p", text: "8.5. The Principal is not entitled to amend the Contract unilaterally." },
      ],
    },
    {
      id: "due-diligence",
      number: "9.",
      title: "Customer due diligence, prevention of money laundering",
      blocks: [
        {
          kind: "p",
          text:
            "9.1. Under the AML Act, the Agent is required to identify and carry out due diligence on the Principal, its representative, the person acting on its behalf and its beneficial owner. The Principal is required to make available in full the documents and declarations requested by the Agent, in particular copies of identity documents, the beneficial ownership declaration and the politically exposed person (PEP) declaration.",
        },
        {
          kind: "p",
          text:
            "9.2. The conclusion of the Contract and its entry into force are conditional on the successful completion of the customer due diligence. If the Principal does not consent to the due diligence, refuses to provide data, or if, on the basis of the result of the due diligence, the statutory conditions are not met, the Agent is required under the AML Act to refuse to establish the business relationship or to perform the engagement, or to terminate the existing business relationship. The Agent accepts no liability for the consequences arising from this, and the fee is non-refundable in accordance with Clause 7.6.",
        },
        {
          kind: "p",
          text:
            "9.3. The Principal is required to report to the Agent any change in the data provided in the course of the due diligence within 5 (five) business days of the change occurring.",
        },
        {
          kind: "p",
          text:
            "9.4. The Principal acknowledges that the Agent is subject to a statutory reporting obligation towards the authority acting as the financial intelligence unit, and further that the Agent may not – in accordance with the provisions of the AML Act – inform the Principal of the making of a report, of its content or of any enquiry by the authority. The performance of this obligation does not qualify as a breach of contract by the Agent or as a breach of its confidentiality obligation.",
        },
      ],
    },
    {
      id: "liability",
      number: "10.",
      title: "Liability",
      blocks: [
        {
          kind: "p",
          text:
            "10.1. The Agent performs the service within the framework of an agency relationship under Section 6:272 of the Civil Code, with the care that may be expected of it (an obligation of due care). The Agent is not liable for the outcome of the service or for the achievement of the Principal’s business objectives.",
        },
        { kind: "p", text: "10.2. The Agent is not liable for:" },
        {
          kind: "lettered",
          items: [
            "damage arising from a fault of the postal or another service provider, or from the late, incorrect or failed delivery of an item;",
            "damage arising from incorrect, incomplete or outdated data provided by the Principal, in particular from an invalid e-mail address or from being unreachable;",
            "the failure to meet, or the late performance of, the Principal’s statutory obligations (tax reporting, financial statements, deadlines);",
            "the consequences arising from the content of an item, including the missing of deadlines and the loss of rights of remedy;",
            "damage arising from a fault in electronic communications, IT or e-mail services, or from a server outage;",
            "damage arising from a force majeure event under Clause 13.",
          ],
        },
        {
          kind: "p",
          text:
            "10.3. The upper limit of the Agent’s liability for damages – save in the case of damage caused intentionally and damage caused by a breach of contract that harms human life, bodily integrity or health (Section 6:152 of the Civil Code) – is the net fee paid by the Principal to the Agent in the 12 (twelve) months preceding the breach of contract giving rise to the damage. The Agent is not liable for the Principal’s lost financial advantage, business losses, damage arising from harm to its good reputation or other indirect damage.",
        },
        {
          kind: "p",
          text:
            "10.4. Clauses 10.2 and 10.3 do not exclude or limit the Agent’s statutory obligations arising from Section 2 of the Decree; any term purporting to release the Agent from these obligations is invalid.",
        },
        {
          kind: "p",
          text:
            "10.5. The Principal is required to indemnify the Agent against every claim, fine, cost and damage arising from the Principal having used the Property otherwise than as provided by law, having breached its obligations to provide data, to make reports or to hand over documents, or having provided untrue data to the Agent.",
        },
      ],
    },
    {
      id: "confidentiality",
      number: "11.",
      title: "Confidentiality, secrecy of correspondence",
      blocks: [
        {
          kind: "p",
          text:
            "11.1. The Parties are required to treat as a business secret all non-public data, facts and information that come to their knowledge in the course of the performance of the Contract. The confidentiality obligation applies without limitation in time and continues after the termination of the Contract.",
        },
        {
          kind: "p",
          text:
            "11.2. The Agent and the persons acting on behalf of the Agent preserve the content, the secrecy of correspondence and the private secrets that come to their knowledge in the course of opening items, and do not make them accessible to third parties, unless required to do so by law or where the Principal has consented in writing.",
        },
        {
          kind: "p",
          text:
            "11.3. The provision of data on the basis of a statutory requirement does not qualify as a breach of the confidentiality obligation, in particular compliance with an official enquiry, a report under the AML Act, and the case where the Agent uses the secret to the extent necessary for the enforcement of its overdue claim against the Principal.",
        },
        {
          kind: "p",
          text:
            "11.4. The Agent also ensures compliance with the confidentiality obligation on the part of its employees, subcontractors and contributors.",
        },
      ],
    },
    {
      id: "term",
      number: "12.",
      title: "Term and termination of the Contract",
      blocks: [
        {
          kind: "p",
          text:
            "12.1. In view of Section 1(3) of the Decree, the Contract is concluded for an indefinite term. A fixed-term contract is concluded only where the company was also established for a fixed term.",
        },
        {
          kind: "p",
          text:
            "12.2. The accounting period of the service is 12 (twelve) months, calculated from the start date of the service, and – in the absence of termination – is automatically renewed for a further 12 (twelve) months. The Agent invoices the fee for the renewed period in advance in accordance with Clause 7.2.",
        },
        {
          kind: "p",
          text:
            "12.3. The Parties may terminate the Contract at any time by mutual agreement in writing; in this case they determine the date of termination jointly.",
        },
        {
          kind: "p",
          text:
            "12.4. **Ordinary termination.** Either Party may terminate the Contract in writing with 30 (thirty) days’ notice. Under Section 1(3) of the Decree, the Parties **may not exercise the right of ordinary termination within one year of the conclusion of the Contract**. This prohibition does not affect the right of termination under Clause 8.3.",
        },
        {
          kind: "p",
          text:
            "12.5. The Principal acknowledges that ordinary termination does not affect the application of Clause 7.6: termination does not give grounds for the refund of the fee already paid.",
        },
        {
          kind: "p",
          text:
            "12.6. **Termination with immediate effect.** In the event of a material breach of contract, the Party suffering the breach may terminate the Contract in writing with immediate effect, without setting an additional time limit. The notice of termination must identify the fact of the breach and the circumstances underlying it.",
        },
        { kind: "p", text: "12.7. The Parties regard as a material breach of contract in particular where" },
        {
          kind: "lettered",
          items: [
            "the Principal fails to pay the fee due – despite a written payment demand – within more than 30 (thirty) days of the due date;",
            "the Principal fails to make available the data, documents or declarations required for the customer due diligence, or provides untrue data;",
            "the Principal breaches its obligation to hand over documents under the Decree, or its obligations under the Contract to provide data and to keep documents;",
            "the Principal uses the Property for a purpose other than that set out in the Contract, carries out activities there without the Agent’s consent, or uses the address of the Property for a purpose outside the subject matter of the Contract (in particular for the receipt of commercial parcels);",
            "the Principal becomes unreachable at the contact details given – without prior notice to the Agent – for more than 30 (thirty) days, or electronic mail sent to it is returned;",
            "the Principal does not come forward for its items for a whole calendar quarter and fails to collect them despite a demand;",
            "liquidation or compulsory strike-off proceedings are commenced against either Party, or its strike-off is ordered by a final decision;",
            "either Party breaches its confidentiality obligation;",
            "the Agent becomes aware of a circumstance on the basis of which the performance of its obligations under the AML Act cannot be ensured while the legal relationship is maintained.",
          ],
        },
        {
          kind: "p",
          text:
            "12.8. **Legal consequences of termination.** On the date of termination of the Contract, the Principal is required to collect its documents and movable property kept by the Agent – in person or through an authorised representative – at the Agent’s registered office, on the basis of the list required by the Decree and against a receipt of collection. If the Principal fails to collect them, the Agent may send the documents by post at the Principal’s cost and risk, or keeps them until the expiry of the 30-day time limit set out in Clause 4.13.",
        },
        {
          kind: "p",
          text:
            "12.9. The Principal acknowledges that, if the Contract terminates, it is required to arrange without delay for the reporting of a new registered office and for the submission of the application for the registration of the change to the Court of Registration, and for the data report under the Taxation Rules Act to be made. If the Principal fails to provide credible evidence of the submission of the application for the registration of the change within 15 (fifteen) business days of the termination of the Contract, the Agent is entitled to the contractual penalty set out in the Fee Schedule, until the obligation is performed but for a period of no more than 12 (twelve) months.",
        },
        {
          kind: "p",
          text:
            "12.10. The Principal acknowledges that, if the Contract terminates, the Agent is entitled – and, to the extent necessary for the performance of its statutory obligations, required – to notify the state tax and customs authority and the Court of Registration of the fact and date of the termination of the Contract, and to initiate legality supervision proceedings before the Court of Registration under Section 74 of the Company Act, upon demonstrating the likelihood of its legal interest. The legal consequences of those proceedings – including a fine, the appointment of a supervisory commissioner and the declaration that the company has ceased to exist – are borne by the Principal and its executive officer.",
        },
        {
          kind: "p",
          text:
            "12.11. The Parties also send each other the legal declarations relating to the termination of the Contract by post, by registered letter with acknowledgement of receipt. The Agent sends such items to the Principal’s registered office as shown in the company register, and to the residence of its executive officer as shown in the company register. The item is **deemed delivered on the 5th (fifth) business day after posting** even if the addressee did not collect it or it could not be delivered to the addressee.",
        },
      ],
    },
    {
      id: "force-majeure",
      number: "13.",
      title: "Force majeure",
      blocks: [
        {
          kind: "p",
          text:
            "13.1. It does not qualify as a breach of contract if the performance of a Party’s obligation is delayed or prevented by an event outside its sphere of control which it could not have foreseen and could not have averted (force majeure), in particular war, an act of terrorism, civil unrest, a strike, an embargo, an epidemic, an official measure, a natural disaster, fire, flood, a power outage, or a prolonged failure of electronic communications or postal services.",
        },
        {
          kind: "p",
          text:
            "13.2. The Party concerned notifies the other Party of the force majeure event without delay and takes the measures that may be expected of it in the interests of performance. If the state of force majeure persists for more than 60 (sixty) days, either Party is entitled to terminate the Contract in writing with immediate effect.",
        },
      ],
    },
    {
      id: "notices",
      number: "14.",
      title: "Contact, notices",
      blocks: [
        {
          kind: "p",
          text:
            "14.1. Contact between the Parties takes place – with the exception set out in Clause 12.11 – by electronic means, at the e-mail addresses given in the Contract. The Principal is required to ensure that the e-mail address given is capable of receiving electronic mail.",
        },
        {
          kind: "p",
          text:
            "14.2. The Principal is entitled to name contact persons. Only the Principal’s representative registered in the company register, or a contact person authorised by that representative in writing, is entitled to give instructions. The Agent regards a declaration of the contact person as a declaration of the Principal until the Principal reports the withdrawal of the authorisation in writing. The Agent also performs the identification obligations under the AML Act in respect of the contact persons.",
        },
        {
          kind: "p",
          text:
            "14.3. A notice sent by e-mail is **deemed delivered on the day of dispatch**, irrespective of when the addressee opened it. The fact and time of dispatch are evidenced by the logs of the systems referred to in Clause 4.9. An invoice, notice or declaration sent by electronic means is equivalent to a paper-based document.",
        },
        {
          kind: "p",
          text:
            "14.4. The Principal is required to report any change in the data given in the Contract (in particular company data, representative, e-mail address, mailing address) without delay, but no later than within 5 (five) business days, in a verifiable manner. The Principal bears the consequences arising from a failure to make such a report.",
        },
        {
          kind: "p",
          text:
            "14.5. A member of the Principal business association who is not a contact person and does not hold a power of attorney may not act before the Agent in the affairs of the company; the Agent may provide such a member with information or access to documents only on the basis of a written power of attorney from the executive officer. The same applies to every further third party, with the exception of an official person acting within their statutory powers.",
        },
      ],
    },
    {
      id: "data-processing",
      number: "15.",
      title: "Data processing",
      blocks: [
        {
          kind: "p",
          text:
            "15.1. The Agent processes personal data in accordance with Regulation (EU) 2016/679 of the European Parliament and of the Council (GDPR) and the provisions of Act CXII of 2011 on the Right to Informational Self-Determination and Freedom of Information. The details of the data processing – the purposes, legal bases, retention periods and the rights of data subjects – are set out in the Agent’s [Privacy Notice](/en/privacy), which is available on the Agent’s website and which the Agent makes available to the Principal before the Contract is concluded.",
        },
        {
          kind: "p",
          text:
            "15.2. The Parties record that the items arriving for the Principal may also contain the personal data of third parties. In respect of such personal data the controller is the Principal, while the Agent acts as a processor under Article 28 of the GDPR in connection with the receipt, opening, scanning, forwarding and keeping of the items. The Parties – at the Principal’s request or where necessary – conclude a separate data processing agreement. The Principal is responsible for informing the data subjects of the data processing.",
        },
        {
          kind: "p",
          text:
            "15.3. The Principal’s representative and contact person become acquainted with the information on the data processing by signing the Contract; data processing based on a contractual or statutory obligation is not based on consent and therefore cannot be brought to an end by the withdrawal of consent.",
        },
      ],
    },
    {
      id: "miscellaneous",
      number: "16.",
      title: "Miscellaneous provisions",
      blocks: [
        {
          kind: "p",
          text:
            "16.1. The Principal may not transfer its rights and obligations arising from the Contract to a third party, and may not assign them, without the Agent’s prior written consent.",
        },
        {
          kind: "p",
          text:
            "16.2. The Agent is entitled to use a contributor for the performance of the service; the Agent is liable for the conduct of the contributor under the rules of the Civil Code.",
        },
        {
          kind: "p",
          text:
            "16.3. If any provision of the Contract or of these GTC is held to be invalid or unenforceable, this does not affect the validity of the remaining provisions. The Parties replace the invalid provision with a valid provision that comes as close as possible to the contractual objective of the parties.",
        },
        {
          kind: "p",
          text:
            "16.4. If the last day of a time limit set out in the Contract or in these GTC is not a business day, the time limit expires on the following business day.",
        },
        {
          kind: "p",
          text: "16.5. The non-exercise or late exercise of any right of the Agent does not constitute a waiver of that right.",
        },
        {
          kind: "p",
          text:
            "16.6. The language of contact between the Parties is Hungarian. If the Contract, these GTC or any notice is also prepared in a foreign language, then in the event of any discrepancy between the two versions the Hungarian-language version prevails.",
        },
        {
          kind: "p",
          text:
            "16.7. The Principal declares that the data it provided in the Contract and in the course of the due diligence are true and that it evidenced them by documents; and further that it received detailed information on the nature of the engagement as an obligation of due care, on the purpose and manner of the customer due diligence, and on the cases of refusal of performance and of statutory reporting.",
        },
        {
          kind: "p",
          text:
            "16.8. These GTC enter into force on 1 January 2026 and apply to contracts concluded after their entry into force, as well as – following the procedure set out in Clause 8 – to contracts already in existence. The previous GTC, which entered into force on 10 January 2018 (version 1.0), cease to have effect simultaneously with this entry into force.",
        },
      ],
    },
    {
      id: "annex-1",
      number: "Annex 1 –",
      title: "Fee Schedule",
      blocks: [
        {
          kind: "p",
          text: "Effective from 1 January 2026. The fees are net amounts and do not include value added tax.",
        },
        { kind: "h3", text: "Registered office service" },
        {
          kind: "table",
          head: ["Package", "Fee", "Content"],
          rows: [
            [
              "Registered office – client with a Hungarian address",
              "HUF 8,000 + VAT per month",
              "registered office address, company sign, mail handling, scanning and forwarding by e-mail, keeping of documents",
            ],
            [
              "Registered office – foreign client",
              "HUF 10,000 + VAT per month",
              "the content above, with an English-language contract and documentation",
            ],
            [
              "Registered office + office use",
              "HUF 18,000 + VAT per month",
              "registered office service + 4 occasions of office use per month at the Eco-office co-working office, discounted meeting room rental",
            ],
          ],
        },
        { kind: "h3", text: "Service of process agent service" },
        {
          kind: "table",
          head: ["Service", "Fee"],
          rows: [["Service of process agent (per company)", "HUF 5,000 + VAT per month"]],
        },
        { kind: "h3", text: "Separate fees" },
        {
          kind: "table",
          head: ["Item", "Fee"],
          rows: [
            ["Parcel storage after the 10th business day following arrival", "HUF 500 + VAT per day per parcel"],
            ["Letter storage beyond the time limit set out in Clause 4.13", "HUF 1,000 + VAT per month"],
            ["Scanning in excess of 20 pages", "HUF 50 + VAT per page"],
            ["Handling fee for postal forwarding", "HUF 2,000 + VAT per item, plus the postal charge"],
            ["Expedited release of documents, copy of documents", "HUF 5,000 + VAT per occasion"],
            ["Participation in an official inspection (after the first hour commenced)", "HUF 10,000 + VAT per hour"],
            ["Amendment of the Contract, issue of a new consent statement", "HUF 5,000 + VAT per occasion"],
            ["Contractual penalty in the case set out in Clause 12.9", "HUF 10,000 + VAT per month"],
          ],
        },
        {
          kind: "p",
          text:
            "**Payment term:** 12 months’ fee in advance, in a single amount. The fee is non-refundable in accordance with Clause 7.6.",
        },
      ],
    },
    {
      id: "annex-2",
      number: "Annex 2 –",
      title: "Postal authorisation (template)",
      blocks: [
        {
          kind: "p",
          text:
            "Simultaneously with the conclusion of the Contract, the Principal grants a postal authorisation, with the content and in the form required by the general terms and conditions of Magyar Posta Zrt. in force from time to time, to the Agent and to the persons designated by it who act on behalf of the Agent, for the receipt of postal items addressed to the company name of the Principal. The authorisation extends to the opening of the items and to becoming acquainted with their content.",
        },
      ],
    },
    {
      id: "annex-3",
      number: "Annex 3 –",
      title: "List of documents and movable property (template)",
      blocks: [
        {
          kind: "table",
          head: ["No.", "Name of document / movable property", "Date of handover", "Handed over by", "Signature of recipient"],
          rows: [
            ["", "", "", "", ""],
            ["", "", "", "", ""],
            ["", "", "", "", ""],
          ],
        },
      ],
    },
  ],
  closing: ["Budapest, 1 January 2026", "E-Marketplace Szolgáltató Kft."],
};
