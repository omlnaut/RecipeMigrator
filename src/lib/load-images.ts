import type { ImageInfo } from "./mealie/mealie-client";

export async function loadRecipeImage(
  imagePath?: string,
): Promise<ImageInfo | undefined> {
  if (!imagePath) return;

  const raw = imagePath?.trim();
  const filename = raw.split(/[\\/]/).pop();
  if (!filename) return;

  const response = await fetch(`/images/${encodeURIComponent(filename)}`);
  const blob = await response.blob();

  return { blob, filename };
}
