// What the contract wizard writes to Firestore: the application as the applicant left it, made safe to store and complete enough for the
// documents generated from it. Pure functions, so the wizard, the admin page and the tests use the same rules.
//
// Two of these guard real failures the wizard had:
//   - dropUndefined: the Firestore web SDK refuses a document that has a field whose value is `undefined`, and the upload step left exactly
//     that behind when an applicant removed an uploaded image (`onChange({ [key]: undefined })`). The whole submission failed with the SDK's
//     own English message, and the applicant could not get past it.
//   - resolveContact: "the contact is the owner" is the default of the form, and the name and address fields are hidden while it holds, so
//     `contact.fullName` and `contact.address` stayed empty for every applicant who left the default. Three readers patch it with a fallback
//     of their own and three do not, so the contact's name was missing from the data sheet PDF and from both e-mails.

// Only erasable TypeScript syntax is used here (no enums, no namespaces), so the tests can load this file with `node --test` as it is.

import type { ContactPersonData, ContractDocuments, OwnerData } from "./contract-types";

/** True for a plain object literal: the only thing worth walking into (a Date, a Firestore sentinel or a class instance is kept as it is). */
function isPlainObject(value: unknown): boolean {
  if (typeof value !== "object" || value === null) return false;
  const proto = Object.getPrototypeOf(value);
  return proto === Object.prototype || proto === null;
}

/**
 * A copy without any field whose value is `undefined`, at every depth. Firestore rejects such a field, so this runs on the whole application
 * before it is written: a key that is not there means "not given", which is what the admin page and the generators already read.
 */
export function dropUndefined<T>(value: T): T {
  if (Array.isArray(value)) return value.map((item) => dropUndefined(item)) as unknown as T;
  if (!isPlainObject(value)) return value;
  const result: Record<string, unknown> = {};
  for (const [key, item] of Object.entries(value as Record<string, unknown>)) {
    if (item === undefined) continue;
    result[key] = dropUndefined(item);
  }
  return result as unknown as T;
}

/**
 * The contact with the name and the address filled in from the first owner when the applicant left "the contact is the owner" checked. The
 * e-mail and the phone number are always the applicant's own, and a value the applicant did type is never overwritten.
 */
export function resolveContact(contact: ContactPersonData, firstOwner: OwnerData | undefined): ContactPersonData {
  if (!contact.isSameAsOwner) return contact;
  // a natural person is their own contact; for a company owner it is the person who represents it
  const source =
    firstOwner?.type === "legal"
      ? { fullName: firstOwner.legal?.representativeName, address: firstOwner.legal?.address }
      : { fullName: firstOwner?.natural?.fullName, address: firstOwner?.natural?.address };
  return {
    ...contact,
    fullName: contact.fullName?.trim() ? contact.fullName : source.fullName || "",
    address: contact.address?.trim() ? contact.address : source.address || "",
  };
}

/**
 * The documents that are marked with a star on the upload step and are not uploaded, named as the step names them. The specs are given by the
 * caller (the upload step already builds them from `idImagesFor`), so this file stays free of value imports and the tests can load it as it is.
 *
 * The submission is NOT blocked by this: an application with documents still missing is reviewed with the `documents_needed` status, which is
 * what that status is for. It is shown to the applicant so the star does not promise something nothing checks.
 */
export function missingRequiredDocuments(
  documents: ContractDocuments,
  specs: { key: string; label: { hu: string; en: string }; required: boolean }[],
  language: "hu" | "en" = "hu"
): string[] {
  const stored = documents as unknown as Record<string, unknown>;
  return specs.filter((spec) => spec.required && !stored[spec.key]).map((spec) => spec.label[language]);
}
