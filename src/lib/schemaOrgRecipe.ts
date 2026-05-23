import type { ParsedRecipe } from "../types/recipe.ts";

export type SchemaOrgHowToStep = {
  "@type": "HowToStep";
  position: number;
  text: string;
};

export type SchemaOrgRecipe = {
  "@context": "https://schema.org";
  "@type": "Recipe";
  name: string;
  description?: string;
  recipeIngredient: string[];
  recipeInstructions: SchemaOrgHowToStep[];
  recipeYield?: string;
  prepTime?: string;
  cookTime?: string;
  totalTime?: string;
  recipeCategory?: string;
  image?: string[];
  url?: string;
};

export type ParsedRecipeProjection = Pick<
  ParsedRecipe,
  "title" | "description" | "ingredients" | "instructions"
>;
export function ToSchemaOrgRecipe(
  input: ParsedRecipeProjection,
): SchemaOrgRecipe {
  return {
    "@context": "https://schema.org",
    "@type": "Recipe",
    name: input.title,
    description: input.description,
    recipeIngredient: input.ingredients,
    recipeInstructions: ToHowToSteps(input.instructions),
  };
}

function ToHowToSteps(input: string[]): SchemaOrgHowToStep[] {
  return input
    .filter((step) => step.trim().length > 0)
    .map((text, index) => ({
      "@type": "HowToStep",
      position: index + 1,
      text: text,
    }));
}
