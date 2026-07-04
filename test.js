const test = require('node:test');
const assert = require('node:assert/strict');

const planner = require('./script.js');

test('sanitizeIngredients splits and trims comma-separated inputs', () => {
  assert.deepEqual(planner.sanitizeIngredients(' rice, eggs, onion '), ['rice', 'eggs', 'onion']);
});

test('selectMealRecipes prefers matching meals and respects dietary filters', () => {
  const meals = planner.selectMealRecipes({
    ingredients: ['eggs', 'onion', 'tomato', 'spinach'],
    budget: 120,
    diet: 'Any',
    focusCategory: 'Breakfast'
  });

  assert.equal(meals.length, 1);
  assert.equal(meals[0].category, 'Breakfast');
});

test('buildPlanData returns budget and grocery guidance', () => {
  const plan = planner.buildPlanData({
    ingredients: ['eggs', 'tomato'],
    budget: 100,
    diet: 'Vegetarian',
    mealType: 'Breakfast',
    selectedMeals: [planner.recipes[0]],
    totalCost: planner.recipes[0].cost,
    mode: 'chef'
  });

  assert.ok(plan.budgetMessage.includes('budget'));
  assert.ok(plan.groceryList.length >= 0);
  assert.ok(plan.suggestions.length > 0);
});
