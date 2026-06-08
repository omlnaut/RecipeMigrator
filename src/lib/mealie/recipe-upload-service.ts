import type { ParsedRecipeProjection } from "../schemaOrgRecipe";
import type { ImageInfo, MealieClient } from "./mealie-client";

export type UploadResult =
  | { result: "success" }
  | { result: "error"; msg: string };

export async function uploadRecipe(
  recipe: ParsedRecipeProjection,
  client: MealieClient,
  image?: ImageInfo,
): Promise<UploadResult> {
  try {
    const slug = await client.uploadJsonRecipe(recipe);
    if (!image) return { result: "success" };

    await client.updateImage(slug, image);

    return { result: "success" };
  } catch (error) {
    if (error instanceof Error) {
      return { result: "error", msg: error.message };
    }
    return { result: "error", msg: String(error) };
  }
}
