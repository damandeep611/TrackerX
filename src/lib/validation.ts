import "server-only";

import { z } from "zod";

/** Postgres uuid (lenient about version bits, like Postgres itself). */
export const zId = z.guid();

/** Trimmed, non-empty string with a max length. */
export const zText = (max: number) => z.string().trim().min(1).max(max);

/** Optional free text: trimmed, empty becomes null. */
export const zOptionalText = (max: number) =>
  z
    .string()
    .trim()
    .max(max)
    .nullish()
    .transform((v) => (v ? v : null));

/** A link the UI renders as an href: only http(s). */
export const zHttpUrl = z
  .string()
  .trim()
  .max(2048)
  .refine((value) => {
    try {
      const { protocol } = new URL(value);
      return protocol === "https:" || protocol === "http:";
    } catch {
      return false;
    }
  }, "Must be an http(s) URL");

export class ValidationError extends Error {
  constructor(message = "Invalid input") {
    super(message);
    this.name = "ValidationError";
  }
}

/** Parse Server Action input or throw a ValidationError (no internals leaked). */
export function parseInput<T extends z.ZodType>(schema: T, input: unknown): z.infer<T> {
  const result = schema.safeParse(input);
  if (!result.success) {
    throw new ValidationError(result.error.issues[0]?.message ?? "Invalid input");
  }
  return result.data;
}

/** Like parseInput, but returns null instead of throwing (for actions that return `{ success, error }`). */
export function tryParseInput<T extends z.ZodType>(schema: T, input: unknown): z.infer<T> | null {
  const result = schema.safeParse(input);
  return result.success ? result.data : null;
}
