import { customAlphabet } from "nanoid";

const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
const genCode = customAlphabet(alphabet, 6);

export function generateCode() {
  return genCode();
}

export function now() {
  return Date.now();
}
