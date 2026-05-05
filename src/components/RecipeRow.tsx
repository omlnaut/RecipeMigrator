import type { RecipeSummary } from "../types/recipe";
type RecipeRowProps = {
  recipe: RecipeSummary;
  selected: boolean;
  onToggle: (id: string) => void;
};

export function RecipeRow({ recipe, selected, onToggle }: RecipeRowProps) {
  return (
    <div onClick={() => onToggle(recipe.id)}>
      <span>{selected ? ">>" : ""}</span>
      <span>{recipe.name}</span>
      <span>{recipe.id}</span>
    </div>
  );
}
