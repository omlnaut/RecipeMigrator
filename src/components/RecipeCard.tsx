import type { ParsedRecipe } from "../types/recipe";

type RecipeCardProps = {
  recipe: ParsedRecipe;
  selected: boolean;
  onToggle: (title: string) => void;
};

export function RecipeCard({ recipe, selected, onToggle }: RecipeCardProps) {
  const filename = recipe.imagepath?.split("/").at(-1);
  const src = filename ? "images/" + filename : null;

  let className = "recipe-card";
  if (selected) className += " recipe-card--selected";

  return (
    <div onClick={() => onToggle(recipe.title)} className={className}>
      {src !== null && (
        <img
          className="recipe-card__image"
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
