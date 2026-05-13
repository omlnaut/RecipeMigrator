import type { ParsedRecipe } from "../types/recipe";

type RecipeCardProps = {
  recipe: ParsedRecipe;
  selected: boolean;
  onToggle: (title: string) => void;
};

export function RecipeCard({ recipe, selected, onToggle }: RecipeCardProps) {
  const filename = recipe.imagepath?.split("/").at(-1);
  const src = filename ? "images/" + filename : null;

  return (
    <div
      onClick={() => onToggle(recipe.title)}
      style={{ outline: selected ? "2px solid blue" : "none" }}
    >
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
