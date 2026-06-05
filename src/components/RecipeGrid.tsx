import type { LoadState } from "../types/load-state.ts";
import type { ParsedRecipe } from "../types/recipe.ts";
import { RecipeCard } from "./RecipeCard.tsx";

type RecipeGridProps = {
  parsedRecipes: ParsedRecipe[];
  selectedTitles: string[];
  onToggle: (id: string) => void;
  loadingState: LoadState<string>;
};
export function RecipeGrid({
  parsedRecipes,
  selectedTitles,
  onToggle,
  loadingState,
}: RecipeGridProps) {
  if (loadingState.status !== "ready") {
    return null;
  }

  return parsedRecipes.map((r) => {
    return (
      <RecipeCard
        key={r.title}
        recipe={r}
        selected={selectedTitles.includes(r.title)}
        onToggle={onToggle}
      />
    );
  });
}
