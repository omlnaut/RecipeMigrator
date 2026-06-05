import type { LoadState } from "../types/load-state.ts";
import type { Recipe } from "../types/recipe.ts";
import { RecipeCard } from "./RecipeCard.tsx";

type RecipeGridProps = {
  parsedRecipes: Recipe[];
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
        key={r.parsed.title}
        recipe={r.parsed}
        selected={selectedTitles.includes(r.parsed.title)}
        onToggle={onToggle}
      />
    );
  });
}
