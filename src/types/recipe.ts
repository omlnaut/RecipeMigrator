type Recipe = {
  id: string;
  name: string;
  servings: number;
  imageFileName: string | null;
  instructions: string;
};

type RecipeSummary = Pick<Recipe, "id" | "name">;
type RecipeDraft = Omit<Recipe, "id">;
type RecipeIndex = Record<string, Recipe>;

function indexRecipes(recipes: Recipe[]): RecipeIndex {
  return recipes.reduce((acc, recipe) => {
    acc[recipe.id] = recipe;
    return acc;
  }, {} as RecipeIndex);
}
