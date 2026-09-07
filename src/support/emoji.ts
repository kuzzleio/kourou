/**
 * The glyphs kourou prints.
 *
 * These used to come from `node-emoji`, but every call site passed a string
 * literal, so the lookup resolved to a constant anyway: the package shipped a
 * full emoji database, and a `string | undefined` return type, for these seven
 * characters.
 */
export const emoji = {
  boom: "💥",
  fire: "🔥",
  okHand: "👌",
  rocket: "🚀",
  shrug: "🤷",
  thumbsDown: "👎",
  thumbsUp: "👍",
} as const;
