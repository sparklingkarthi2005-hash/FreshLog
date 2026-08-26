export const FOOD_CATEGORIES = {
  VEGETABLES: {
    name: 'Vegetables & Greens',
    items: [
      { name: 'Spinach / Greens', days: 2, icon: '🥬' },
      { name: 'Tomatoes', days: 5, icon: '🍅' },
      { name: 'Onions', days: 20, icon: '🧅' },
      { name: 'Potatoes', days: 30, icon: '🥔' },
      { name: 'Carrot / Beetroot', days: 10, icon: '🥕' },
      { name: 'Beans / Peas', days: 5, icon: '🫛' },
      { name: 'Ladies Finger', days: 4, icon: '🌱' },
      { name: 'Brinjal', days: 5, icon: '🍆' },
      { name: 'Cabbage / Cauliflower', days: 7, icon: '🥦' },
      { name: 'Curry Leaves / Coriander', days: 3, icon: '🌿' },
      { name: 'Green Chillies / Ginger / Garlic', days: 14, icon: '🧄' }
    ]
  },
  FRUITS: {
    name: 'Fruits',
    items: [
      { name: 'Bananas', days: 4, icon: '🍌' },
      { name: 'Apples', days: 15, icon: '🍎' },
      { name: 'Oranges / Citrus', days: 10, icon: '🍊' },
      { name: 'Papaya / Mango', days: 4, icon: '🥭' },
      { name: 'Grapes / Berries', days: 5, icon: '🍇' },
      { name: 'Watermelon (Cut)', days: 2, icon: '🍉' }
    ]
  },
  COOKED_FOOD: {
    name: 'South Indian & Cooked Food',
    items: [
      { name: 'Cooked Rice', days: 1, icon: '🍚' },
      { name: 'Sambar / Rasam / Kuzhambu', days: 1, icon: '🍲' },
      { name: 'Idli / Dosa Batter', days: 4, icon: '🥣' },
      { name: 'Chapathi / Poori (Cooked)', days: 2, icon: '🫓' },
      { name: 'Non-Veg Gravy', days: 1, icon: '🥘' },
      { name: 'Sweets / Halwa / Payasam', days: 3, icon: '🍯' }
    ]
  },
  DAIRY: {
    name: 'Dairy & Eggs',
    items: [
      { name: 'Milk - Boiled', days: 1, icon: '🥛' },
      { name: 'Milk - Packet (Boiled Unopened)', days: 2, icon: '🥛' },
      { name: 'Curd / Butter Milk', days: 4, icon: '🥣' },
      { name: 'Paneer / Cheese', days: 7, icon: '🧀' },
      { name: 'Butter / Ghee', days: 60, icon: '🧈' },
      { name: 'Eggs', days: 21, icon: '🥚' }
    ]
  },
  MEAT_FISH: {
    name: 'Meat & Seafood',
    items: [
      { name: 'Raw Chicken', days: 2, icon: '🍗' },
      { name: 'Raw Mutton', days: 2, icon: '🥩' },
      { name: 'Fish / Prawns', days: 1, icon: '🐟' }
    ]
  },
  BAKERY: {
    name: 'Bakery & Snacks',
    items: [
      { name: 'White / Wheat Bread', days: 4, icon: '🍞' },
      { name: 'Buns / Pav', days: 3, icon: '🥯' },
      { name: 'Cakes / Pastries', days: 3, icon: '🍰' },
      { name: 'Biscuits / Cookies', days: 45, icon: '🍪' },
      { name: 'Mixture / Murukku', days: 30, icon: '🥨' }
    ]
  },
  PANTRY: {
    name: 'Pantry & Groceries',
    items: [
      { name: 'Rice / Flour / Pulses', days: 180, icon: '🌾' },
      { name: 'Cooking Oil', days: 180, icon: '🛢️' },
      { name: 'Spices / Masala Powders', days: 120, icon: '🌶️' },
      { name: 'Nuts & Dry Fruits', days: 90, icon: '🥜' }
    ]
  }
};

export const DEFAULT_CATEGORY_DAYS = {
  VEGETABLES: 5,
  FRUITS: 7,
  COOKED_FOOD: 1,
  DAIRY: 3,
  MEAT_FISH: 1,
  BAKERY: 4,
  PANTRY: 90
};

export function getDaysForCustomItem(categoryKey) {
  return DEFAULT_CATEGORY_DAYS[categoryKey] || 3;
}