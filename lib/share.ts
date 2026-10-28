import LZString from "lz-string";
import type { Guide } from "./schema";

// Generated guides are not stored on a server: the whole guide is compressed
// into the URL fragment, so the link itself is the shareable artifact.
export const encodeGuide = (g: Guide) => LZString.compressToEncodedURIComponent(JSON.stringify(g));

export function decodeGuide(hash: string): Guide | null {
  try {
    const json = LZString.decompressFromEncodedURIComponent(hash.replace(/^#/, ""));
    return json ? (JSON.parse(json) as Guide) : null;
  } catch {
    return null;
  }
}
