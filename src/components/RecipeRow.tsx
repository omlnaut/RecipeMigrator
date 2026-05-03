import type { RecipeSummary } from "../types/recipe";
type RecipeRowProps = { recipe: RecipeSummary; selected: boolean };

export function RecipeRow({ recipe, selected }: RecipeRowProps) {
  return (
    <div>
      <span>{selected ? ">>" : ""}</span>
      <span>{recipe.name}</span>
      <span>{recipe.id}</span>
    </div>
  );
}
