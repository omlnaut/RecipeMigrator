import type { LoadState } from "../types/load-state.ts";
import type { Recipe } from "../types/recipe.ts";
import { RecipeCard } from "./recipe-card/RecipeCard.tsx";

type RecipeGridProps = {
  parsedRecipes: Recipe[];
  onToggle: (id: string) => void;
  loadingState: LoadState<string>;
};
export function RecipeGrid({
  parsedRecipes,
  onToggle,
  loadingState,
}: RecipeGridProps) {
  if (loadingState.status !== "ready") {
    return null;
  }

  return parsedRecipes.map((r) => {
    return <RecipeCard key={r.parsed.title} recipe={r} onToggle={onToggle} />;
  });
}
