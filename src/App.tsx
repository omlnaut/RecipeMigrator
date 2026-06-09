import { ProgressBar } from "@components/progressbar";
import { RecipeGrid } from "@components/RecipeGrid.tsx";
import { useEffect, useState } from "react";
import "./App.css";
import { runAsync } from "./lib/coordinator/async-coordinator.ts";
import { loadRecipeImage } from "./lib/load-images.ts";
import { parseRecipes } from "./lib/parseRecipes.ts";
import { type LoadState } from "./types/load-state.ts";
import type { ExportStatus, Recipe } from "./types/recipe.ts";

function MakeAsyncFunc(i: number, delayMilliseconds: number) {
  return async () => {
    console.log(`start ${i}`);
    await new Promise((resolve) => setTimeout(resolve, delayMilliseconds));
    console.log(`end ${i}`);
  };
}

function WithStatus(
  recipes: Recipe[],
  status: ExportStatus | ExportStatus[],
): Recipe[] {
  const targetStatus = Array.isArray(status) ? status : [status];
  return recipes.filter((r) => targetStatus.includes(r.status));
}

function App() {
  const [loadingState, setLoadingState] = useState<LoadState<string>>({
    status: "idle",
  });
  const [alreadyLoaded, setAlreadyLoaded] = useState<boolean>(false);
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [exportProgress, setExportProgress] = useState<number>(0);
  const [totalExport, setTotalExport] = useState<number>(0);

  async function startExport() {
    const selectedRecipes = WithStatus(recipes, "Selected");
    setTotalExport(selectedRecipes.length);
    const exportPromises = selectedRecipes.map(async (r, i) => {
      const asyncFunc = MakeAsyncFunc(i, 2000);

      const imageInfo = await loadRecipeImage(r.parsed.imagepath);
      console.log(`blob size: ${imageInfo?.blob.size}`);

      return async () => {
        r.status = "InProgress";
        await asyncFunc();
        r.status = i % 2 ? "Done" : "Error";
        setExportProgress((prevProgress) => prevProgress + 1);
      };
    });
    const exportFuncs = await Promise.all(exportPromises);

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
        {totalExport > 0 && (
          <ProgressBar p={(100 * exportProgress) / totalExport} />
        )}
        <button
          type="button"
          disabled={alreadyLoaded}
          onClick={() => setAlreadyLoaded(true)}
        >
          Load recipes
        </button>
        <button
          type="button"
          disabled={WithStatus(recipes, "Selected").length === 0}
          onClick={startExport}
        >
          Export selected ({WithStatus(recipes, "Selected").length})
        </button>
        {WithStatus(recipes, "Selected").length > 0 && (
          <div className="export-bar">
            {exportProgress}/{WithStatus(recipes, "Selected").length}
          </div>
        )}
      </div>
      <div>
        Errors:
        <ul style={{ listStylePosition: "inside", padding: 0, margin: 0 }}>
          {WithStatus(recipes, "Error").map((r) => (
            <li>{r.parsed.title}</li>
          ))}
        </ul>
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
