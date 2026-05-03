import { RecipeRow } from "./components/RecipeRow";

function App() {
  return (
    <div>
      <h1>Recipe Migrator</h1>
      {RecipeRow({ id: "1", name: "first" }, true)}
      {RecipeRow({ id: "2", name: "third" }, false)}
    </div>
  );
}

export default App;
