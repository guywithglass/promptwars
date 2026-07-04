// Recipe database (fake AI brain)
const recipes = [
  {
    name: "Veggie Rice",
    ingredients: ["rice", "onion", "tomato"],
    cost: 40
  },
  {
    name: "Egg Toast",
    ingredients: ["eggs", "bread"],
    cost: 30
  },
  {
    name: "Vegetable Salad",
    ingredients: ["cucumber", "tomato", "onion"],
    cost: 25
  },
  {
    name: "Fried Rice",
    ingredients: ["rice", "carrot", "peas", "onion"],
    cost: 50
  }
];

const substitutes = {
  eggs: "paneer",
  milk: "soy milk",
  bread: "roti",
  rice: "quinoa"
};

function renderLoading() {
  document.getElementById("output").innerHTML = `
    <div class="loading-card">
      <div class="loader"></div>
      <h3>Analyzing your pantry...</h3>
      <p>Matching recipes, checking budget, and shaping a smart plan.</p>
    </div>
  `;
}

function generatePlan() {
  const button = document.querySelector("button");
  const ingredientsInput = document.getElementById("ingredients").value.toLowerCase().trim();
  const ingredients = ingredientsInput
    ? ingredientsInput.split(",").map(value => value.trim()).filter(Boolean)
    : [];
  const budget = parseInt(document.getElementById("budget").value) || 0;
  const diet = document.getElementById("diet").value;

  button.disabled = true;
  button.textContent = "Thinking...";
  renderLoading();

  setTimeout(() => {
    const matchedRecipes = recipes.filter(recipe =>
      recipe.ingredients.some(ingredient => ingredients.includes(ingredient))
    );

    let totalCost = 0;
    const recipeCards = matchedRecipes.length
      ? matchedRecipes.map(recipe => {
          totalCost += recipe.cost;
          return `
            <div class="recipe-card">
              <div>
                <strong>${recipe.name}</strong>
                <p>${recipe.ingredients.join(", ")}</p>
              </div>
              <div class="recipe-meta">₹${recipe.cost}</div>
            </div>
          `;
        }).join("")
      : `
        <div class="recipe-card">
          <div>
            <strong>No strong match yet</strong>
            <p>Try adding staples like rice, eggs, or onions.</p>
          </div>
        </div>
      `;

    const budgetStatus = totalCost > budget
      ? "warning"
      : "success";

    const budgetMessage = totalCost > budget
      ? `Your plan runs over budget. Try swaps like ${Object.entries(substitutes).slice(0, 2).map(([from, to]) => `${from} → ${to}`).join(", ")}.`
      : `This plan stays within your budget and feels ready to cook.`;

    const dietMessage = diet === "Vegan"
      ? "The suggestions are tuned for a plant-based meal path."
      : diet === "Vegetarian"
        ? "The suggestions are tuned for vegetarian-friendly cooking."
        : "The suggestions are flexible for any preference.";

    document.getElementById("output").innerHTML = `
      <div class="ai-response">
        <div class="response-header">
          <div>
            <div class="mini-badge">AI response</div>
            <h2>✨ Personalized cooking plan</h2>
          </div>
          <div class="status-pill">Live</div>
        </div>

        <div class="summary-grid">
          <div class="summary-card">
            <strong>Pantry</strong>
            <span>${ingredients.length ? ingredients.join(", ") : "No ingredients listed"}</span>
          </div>
          <div class="summary-card">
            <strong>Budget</strong>
            <span>₹${budget || 0}</span>
          </div>
          <div class="summary-card">
            <strong>Diet</strong>
            <span>${diet}</span>
          </div>
        </div>

        <div class="recipe-list">
          ${recipeCards}
        </div>

        <div class="insight-card ${budgetStatus}">
          <strong>Budget insight</strong>
          <p>${budgetMessage}</p>
          <p>${dietMessage}</p>
        </div>

        <div class="todo-card">
          <strong>Next steps</strong>
          <ul>
            <li>Check ingredients and prep surfaces</li>
            <li>Start with the highest-match recipe</li>
            <li>Save leftovers for the next meal</li>
          </ul>
        </div>
      </div>
    `;

    button.disabled = false;
    button.textContent = "✨ Generate AI Plan";
  }, 900);
}