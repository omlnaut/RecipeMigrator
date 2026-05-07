import { useEffect, useState } from "react";
import { RecipeRow } from "./components/RecipeRow";
import type { RecipeSummary } from "./types/recipe";

function App() {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [text, setText] = useState<string>("not loaded");
  const [shouldLoad, setShouldLoad] = useState<boolean>(false);

  function onToggle(id: string) {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x != id) : [...prev, id],
    );
  }

  useEffect(() => {
    async function load() {
      if (!shouldLoad) {
        return;
      }
      const response = await fetch("/cookbook_recipes.xml");
      const text = await response.text();
      setText(text);
    }
    load();
  }, [shouldLoad]);

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
      <button disabled={shouldLoad} onClick={() => setShouldLoad(true)}>
        Load recipes
      </button>
      <p>{text}</p>
    </div>
  );
}

export default App;
