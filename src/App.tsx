import { useEffect, useState } from "react";
import { type LoadState } from "./types/load-state";
import { parseRecipes } from "./lib/parseRecipes";
import type { ParsedRecipe } from "./types/recipe";
import { RecipeCard } from "./components/RecipeCard";
import "./App.css";

function App() {
  const [loadingState, setLoadingState] = useState<LoadState<string>>({
    status: "idle",
  });
  const [selectedTitles, setSelectedTitles] = useState<string[]>([]);
  const [alreadyLoaded, setAlreadyLoaded] = useState<boolean>(false);
  const [parsedRecipes, setParsedRecipes] = useState<ParsedRecipe[]>([]);

  function onToggle(id: string) {
    setSelectedTitles((prev) =>
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
        const filename = parsed[0].imagepath?.split("/").at(-1);
        const src = filename ? "images/" + filename : null;
        setLoadingState({
          status: "ready",
          data: src ?? "", //parsed.length.toString(),
        });
        setParsedRecipes(parsed);
      } catch {
        setLoadingState({ status: "error", message: "error loading recipes" });
      }
    }
    load();
  }, [alreadyLoaded]);

  return (
    <div className="app-shell">
      <header className="app-header">
        <h1 className="app-title">Recipe Migrator</h1>
      </header>
      <div className="toolbar">
        <button disabled={alreadyLoaded} onClick={() => setAlreadyLoaded(true)}>
          Load recipes
        </button>
        <button disabled={selectedTitles.length === 0}>
          Export selected ({selectedTitles.length})
        </button>
      </div>
      <div className="recipe-list">
        {loadingState.status == "ready" &&
          parsedRecipes.map((r) => {
            return (
              <RecipeCard
                key={r.title}
                recipe={r}
                selected={selectedTitles.includes(r.title)}
                onToggle={onToggle}
              />
            );
          })}
      </div>
    </div>
  );
}

export default App;
