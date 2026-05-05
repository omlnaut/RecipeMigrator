import { useState } from "react";
import { RecipeRow } from "./components/RecipeRow";

function Counter() {
  const [count, setCount] = useState(0);
  return <button onClick={() => setCount(count + 1)}>{count}</button>;
}

function App() {
  return (
    <div>
      <h1>Recipe Migrator</h1>
      <Counter></Counter>
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
