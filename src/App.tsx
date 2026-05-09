import { useEffect, useState } from "react";
import { RecipeRow } from "./components/RecipeRow";
import { describe, type LoadState } from "./types/load-state";
import { parseRecipes } from "./lib/parseRecipes";
import type { ParsedRecipe, RecipeSummary } from "./types/recipe";

function App() {
  const [loadingState, setLoadingState] = useState<LoadState<string>>({
    status: "idle",
  });
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [alreadyLoaded, setAlreadyLoaded] = useState<boolean>(false);
  const [parsedRecipes, setParsedRecipes] = useState<ParsedRecipe[]>([]);

  function onToggle(id: string) {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x != id) : [...prev, id],
    );
  }

  useEffect(() => {
    async function load() {
      if (!alreadyLoaded) {
        return;
      }
      setLoadingState({ status: "loading" });
      try {
        const response = await fetch("/cookbook_recipes.xml");
        const parsed = parseRecipes(await response.text());
        setParsedRecipes(parsed);
        setLoadingState({
          status: "ready",
          data: parsed.length.toString(),
        });
      } catch {
        setLoadingState({ status: "error", message: "error loading recipes" });
      }
    }
    load();
  }, [alreadyLoaded]);

  const recipes: RecipeSummary[] = [
    { id: "1", name: "first" },
    { id: "2", name: "second" },
  ];

  return (
    <div>
      <h1>Recipe Migrator</h1>
      {recipes.map((r) => (
        <RecipeRow
          key={r.id}
          recipe={r}
          selected={selectedIds.includes(r.id)}
          onToggle={onToggle}
        ></RecipeRow>
      ))}
      <p>
        <button disabled={alreadyLoaded} onClick={() => setAlreadyLoaded(true)}>
          Load recipes
        </button>
        <br />
        {describe(loadingState)}
      </p>
    </div>
  );
}

export default App;
