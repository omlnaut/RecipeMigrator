import type { Recipe } from "../types/recipe.ts";

type RecipeCardProps = {
  recipe: Recipe;
  onToggle: (title: string) => void;
};

export function RecipeCard({ recipe, onToggle }: RecipeCardProps) {
  const filename = recipe.parsed.imagepath?.split("/").at(-1);
  const src = filename ? "images/" + filename : null;

  let className = "recipe-card";
  switch (recipe.status) {
    case "Selected":
      className += " recipe-card--selected";
      break;
    case "InProgress":
      className += " recipe-card--inProgress";
      break;
    case "Done":
      className += " recipe-card--done";
      break;
    case "Error":
      className += " recipe-card--error";
      break;
  }

  return (
    <div onClick={() => onToggle(recipe.parsed.title)} className={className}>
      <span className="recipe-card-title">{recipe.parsed.title}</span>
      {src !== null && (
        <img
          className="recipe-card__image"
          src={src}
          alt={recipe.parsed.title}
          onError={(e) => {
            (e.currentTarget as HTMLImageElement).style.display = "none";
          }}
        />
      )}
      <span>{recipe.parsed.category}</span>
    </div>
  );
}
