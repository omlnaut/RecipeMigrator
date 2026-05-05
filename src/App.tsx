import { useState } from "react";
import { RecipeRow } from "./components/RecipeRow";
import type { RecipeSummary } from "./types/recipe";

function App() {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  function onToggle(id: string) {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x != id) : [...prev, id],
    );
  }

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
    </div>
  );
}

export default App;
