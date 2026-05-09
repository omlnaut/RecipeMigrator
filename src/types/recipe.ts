type Recipe = {
  id: string;
  name: string;
  servings: number;
  imageFileName: string | null;
  instructions: string;
};

export type ParsedRecipe = {
  title: string;
  preptime: string;
  cooktime: string;
  description: string;
  ingredients: string[];
  instructions: string[];
  url: string;
  imagepath: string;
  quantity: string;
  rating: number;
  category: string;
};

export type RecipeSummary = Pick<Recipe, "id" | "name">;
type RecipeDraft = Omit<Recipe, "id">;
type RecipeIndex = Record<string, Recipe>;

function indexRecipes(recipes: Recipe[]): RecipeIndex {
  return recipes.reduce((acc, recipe) => {
    acc[recipe.id] = recipe;
    return acc;
  }, {} as RecipeIndex);
}
