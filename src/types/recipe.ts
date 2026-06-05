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

export type ExportStatus =
  | "None"
  | "Selected"
  | "InProgress"
  | "Done"
  | "Error";

export type Recipe = {
  parsed: ParsedRecipe;
  status: ExportStatus;
};
