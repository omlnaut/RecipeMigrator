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
