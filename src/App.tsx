import { RecipeRow } from "./components/RecipeRow";

function App() {
  return (
    <div>
      <h1>Recipe Migrator</h1>
      <RecipeRow
        recipe={{ id: "1", name: "first" }}
        selected={true}
      ></RecipeRow>
      <RecipeRow
        recipe={{ id: "2", name: "second" }}
        selected={false}
      ></RecipeRow>
    </div>
  );
}

export default App;
