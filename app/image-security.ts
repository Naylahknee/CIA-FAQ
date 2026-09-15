const signatures: Record<string, (bytes: Uint8Array) => boolean> = {
  "image/jpeg": bytes => bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff,
  "image/png": bytes => [0x89,0x50,0x4e,0x47,0x0d,0x0a,0x1a,0x0a].every((value, index) => bytes[index] === value),
  "image/webp": bytes => String.fromCharCode(...bytes.slice(0,4)) === "RIFF" && String.fromCharCode(...bytes.slice(8,12)) === "WEBP",
  "image/gif": bytes => ["GIF87a","GIF89a"].includes(String.fromCharCode(...bytes.slice(0,6))),
};

export async function isSafeImage(file: File, allowedTypes: Set<string>, maxBytes: number) {
  if (!allowedTypes.has(file.type) || file.size < 12 || file.size > maxBytes) return false;
  const header = new Uint8Array(await file.slice(0, 16).arrayBuffer());
  return Boolean(signatures[file.type]?.(header));
}
