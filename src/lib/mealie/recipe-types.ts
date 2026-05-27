export interface RecipeItem {
  id: string;
  userId: string;
  householdId: string;
  groupId: string;
  name: string;
  slug: string;
  image: string;
  recipeServings: number;
  recipeYieldQuantity: number;
  recipeYield: string;
  totalTime: string;
  prepTime: string | null;
  cookTime: string | null;
  performTime: string;
  description: string;
  rating: number | null;
  orgURL: string;
  dateAdded: string;
  dateUpdated: string;
  createdAt: string;
  updatedAt: string;
  lastMade: string | null;
}

export interface RecipeResponse {
  page: number;
  per_page: number;
  total: number;
  total_pages: number;
  items: RecipeItem[];
}
