import type { ParsedRecipe } from "../types/recipe";

export function parseRecipes(xmlText: string): ParsedRecipe[] {
  const parser = new DOMParser();
  const doc = parser.parseFromString(xmlText, "application/xml");

  const r = Array.from(doc.querySelectorAll("recipe")).map((el) => {
    const text = (tag: string) => el.querySelector(tag)?.textContent ?? "";
    const array = (tag: string) =>
      Array.from(el.querySelector(tag)?.querySelectorAll("li") ?? []);

    return {
      title: text("title"),
      preptime: text("preptime"),
      cooktime: text("cooktime"),
      description: text("description"),
      ingredients: array("ingredient").map((li) => li.textContent ?? ""),
      instructions: array("recipetext").map((li) => li.textContent ?? ""),
      url: text("url"),
      imagepath: text("imagepath"),
      quantity: text("quantity"),
      rating: parseInt(text("rating"), 10),
      category: text("category"),
    };
  });
  console.info(r.length);
  return r;
}
