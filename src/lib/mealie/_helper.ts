import { MealieClient } from "./mealie-client.ts";

export function DefaultMealieClient(): MealieClient {
  return new MealieClient(
    { baseUrl: "http://192.168.2.116", port: 9090 },
    {
      username: String(Deno.env.get("MEALIE_USERNAME") ?? ""),
      password: String(Deno.env.get("MEALIE_PASSWORD") ?? ""),
    },
  );
}

import type { ParsedRecipeProjection } from "../schemaOrgRecipe.ts";

export const defaultRecipe: ParsedRecipeProjection = {
  title: "testi asdf",
  description: "testi mac testface",
  ingredients: ["first", "second"],
  instructions: ["do first", "then do second"],
};
