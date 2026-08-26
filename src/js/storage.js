const STORAGE_KEY = 'freshlog_inventory';

export function getItems() {
  const data = localStorage.getItem(STORAGE_KEY);
  return data ? JSON.parse(data) : [];
}

export function saveItem(item) {
  const inventory = getItems();
  inventory.unshift(item);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(inventory));
}

export function removeItem(id) {
  const inventory = getItems().filter(item => item.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(inventory));
}