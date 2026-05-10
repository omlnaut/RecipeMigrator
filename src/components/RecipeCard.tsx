import type { ParsedRecipe } from "../types/recipe";

type RecipeCardProps = {
  recipe: ParsedRecipe;
};

export function RecipeCard({ recipe }: RecipeCardProps) {
  const filename = recipe.imagepath?.split("/").at(-1);
  const src = filename ? "images/" + filename : null;

  return (
    <div>
      {src !== null && (
        <img
          src={src}
          alt={recipe.title}
          onError={(e) => {
            (e.currentTarget as HTMLImageElement).style.display = "none";
          }}
        />
      )}
      <span>{recipe.title}</span>
      <span>{recipe.category}</span>
    </div>
  );
}
