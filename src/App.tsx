import { useEffect, useState } from "react";
import { type LoadState } from "./types/load-state";
import { parseRecipes } from "./lib/parseRecipes";
import type { ParsedRecipe } from "./types/recipe";
import "./App.css";
import { RecipeGrid } from "./components/RecipeGrid.tsx";
import {
  runAsync,
  type AsyncVoidFunction,
} from "./lib/coordinator/async-coordinator.ts";

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
  const [parsedRecipes, setParsedRecipes] = useState<ParsedRecipe[]>([]);
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
          parsedRecipes={parsedRecipes}
          selectedTitles={selectedTitles}
          onToggle={onToggle}
          loadingState={loadingState}
        />
      </div>
    </div>
  );
}

export default App;
