import { useEffect, useState } from "react";
import { type LoadState } from "./types/load-state";
import { parseRecipes } from "./lib/parseRecipes";
import type { Recipe } from "./types/recipe";
import "./App.css";
import { RecipeGrid } from "./components/RecipeGrid.tsx";
import {
  runAsync,
  type AsyncVoidFunction,
} from "./lib/coordinator/async-coordinator.ts";
import { ProgressBar } from "./components/ProgressBar.tsx";

function MakeAsyncFunc(i: number, delayMilliseconds: number) {
  return async () => {
    console.log(`start ${i}`);
    await new Promise((resolve) => setTimeout(resolve, delayMilliseconds));
    console.log(`end ${i}`);
  };
}

function App() {
  const [loadingState, setLoadingState] = useState<LoadState<string>>({
    status: "idle",
  });
  const [selectedTitles, setSelectedTitles] = useState<string[]>([]);
  const [alreadyLoaded, setAlreadyLoaded] = useState<boolean>(false);
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [exportProgress, setExportProgress] = useState<number>(0);

  async function startExport() {
    const exportFuncs = Array.from(
      { length: selectedTitles.length },
      (_, i) => i,
    )
      .map((i: number) => MakeAsyncFunc(i, 2000))
      .map((f: AsyncVoidFunction) => {
        return async () => {
          await f();
          setExportProgress((prevProgress) => prevProgress + 1);
        };
      });

    await runAsync(exportFuncs, 2);
  }

  function onToggle(id: string) {
    setRecipes((prevRecipes) => {
      return prevRecipes.map((prevRecipe) => {
        if (prevRecipe.parsed.title !== id) return prevRecipe;

        const nextStatus =
          prevRecipe.status === "Selected" ? "None" : "Selected";

        return {
          ...prevRecipe,
          status: nextStatus,
        };
      });
    });
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
        setRecipes(
          parsed.map((parsed) => ({ parsed: parsed, status: "None" })),
        );
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
        <ProgressBar p={5} />
        <button
          type="button"
          disabled={alreadyLoaded}
          onClick={() => setAlreadyLoaded(true)}
        >
          Load recipes
        </button>
        <button
          type="button"
          disabled={selectedTitles.length === 0}
          onClick={startExport}
        >
          Export selected ({selectedTitles.length})
        </button>
        {selectedTitles.length > 0 && (
          <div className="export-bar">
            {exportProgress}/{selectedTitles.length}
          </div>
        )}
      </div>
      <div className="recipe-list">
        <RecipeGrid
          parsedRecipes={recipes}
          onToggle={onToggle}
          loadingState={loadingState}
        />
      </div>
    </div>
  );
}

export default App;
