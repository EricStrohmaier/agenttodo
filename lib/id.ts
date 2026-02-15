import { nanoid } from "nanoid";

/** Generate a 12-char nanoid for database record IDs */
export function newId(): string {
  return nanoid(12);
}

/** Generate a short API key: at_ prefix + 24-char nanoid */
export function newApiKey(): string {
  return `at_${nanoid(24)}`;
}
