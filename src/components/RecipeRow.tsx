import type { RecipeSummary } from "../types/recipe";

export function RecipeRow(recipe: RecipeSummary, selected: boolean){
    return (
        <div>
            <span>{selected ? ">>":""}</span>
            <span>{recipe.name}</span>
            <span>{recipe.id}</span>
        </div>
    )
}