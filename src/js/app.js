import { FOOD_CATEGORIES, DEFAULT_CATEGORY_DAYS, getDaysForCustomItem } from './config.js';
import { getItems, saveItem, removeItem } from './storage.js';
import { calculateExpiry } from './expiryEngine.js';

let pendingScannedItems = [];

document.addEventListener('DOMContentLoaded', () => {
  renderQuickAddButtons();
  renderInventory();
  setupFormListener();
  setupVoiceInput();
  setupBillUpload();
  setupReviewListeners();
});

// 1. Voice Input Handler (Web Speech API)
function setupVoiceInput() {
  const voiceBtn = document.getElementById('voice-btn');
  const voiceStatus = document.getElementById('voice-status');

  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  
  if (!SpeechRecognition) {
    voiceStatus.innerText = 'Voice not supported';
    voiceBtn.disabled = true;
    return;
  }

  const recognition = new SpeechRecognition();
  recognition.lang = 'en-US';

  voiceBtn.addEventListener('click', () => {
    recognition.start();
    voiceStatus.innerText = 'Listening... Speak now';
    voiceBtn.classList.add('animate-pulse');
  });

  recognition.onresult = (event) => {
    const spokenText = event.results[0][0].transcript;
    voiceStatus.innerText = `Added: "${spokenText}"`;
    voiceBtn.classList.remove('animate-pulse');
    
    let storage = 'room';
    if (spokenText.toLowerCase().includes('fridge')) storage = 'fridge';
    if (spokenText.toLowerCase().includes('freezer')) storage = 'freezer';

    const cleanName = spokenText.replace(/in fridge|in freezer|in room/gi, '').trim();
    addNewItem(cleanName, 3, storage);
  };

  recognition.onerror = () => {
    voiceStatus.innerText = 'Error hearing voice. Try again!';
    voiceBtn.classList.remove('animate-pulse');
  };
}

// Known Food Terms / Dictionary for Validation Filter
const KNOWN_FOOD_WORDS = [
  'milk', 'bread', 'apple', 'banana', 'tomato', 'potato', 'onion', 'egg', 'cheese',
  'butter', 'rice', 'chicken', 'fish', 'paneer', 'curd', 'dosa', 'idli', 'batter',
  'spinach', 'carrot', 'garlic', 'ginger', 'oil', 'flour', 'sugar', 'salt', 'tea',
  'coffee', 'biscuit', 'mushroom', 'meat', 'fruit', 'veg', 'vegetable', 'greens'
];

// 2. Bill Upload Handler with Auto-Filtering & Verification Review
function setupBillUpload() {
  const billInput = document.getElementById('bill-input');
  const billStatus = document.getElementById('bill-status');
  const reviewCard = document.getElementById('bill-review-card');

  billInput.addEventListener('change', async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    billStatus.innerText = 'Scanning Image (OCR)...';
    reviewCard.classList.add('hidden');

    try {
      const result = await Tesseract.recognize(file, 'eng');
      const lines = result.data.text.split('\n');
      
      pendingScannedItems = [];

      lines.forEach(line => {
        const cleanLine = line.replace(/[^a-zA-Z\s]/g, '').trim();
        const lowerLine = cleanLine.toLowerCase();

        if (cleanLine.length >= 3) {
          const isFoodRelated = KNOWN_FOOD_WORDS.some(word => lowerLine.includes(word));
          
          // Filter out obvious non-grocery bill text (totals, cards, receipt keywords)
          const isNoise = /total|subtotal|cash|card|tax|change|invoice|thank|visit|str|tel|phone|date|time/i.test(cleanLine);

          if (!isNoise) {
            pendingScannedItems.push({
              name: cleanLine,
              isValid: isFoodRelated // Auto check if matched with food items
            });
          }
        }
      });

      if (pendingScannedItems.length === 0) {
        billStatus.innerText = '❌ Not a valid bill image! No items found.';
        return;
      }

      billStatus.innerText = 'Scan Complete! Review items below.';
      renderReviewModal();

    } catch (err) {
      billStatus.innerText = 'Failed to process image.';
    }
  });
}

// Render Review Modal for User Rectification
function renderReviewModal() {
  const reviewCard = document.getElementById('bill-review-card');
  const itemsContainer = document.getElementById('scanned-items-list');

  reviewCard.classList.remove('hidden');

  itemsContainer.innerHTML = pendingScannedItems.map((item, index) => `
    <div class="flex items-center justify-between bg-slate-900 p-2 rounded-lg border border-slate-800 text-xs">
      <div class="flex items-center gap-2 flex-1 mr-2">
        <input type="checkbox" id="scan-chk-${index}" ${item.isValid ? 'checked' : ''} 
          class="accent-purple-500 rounded cursor-pointer">
        <input type="text" value="${item.name}" id="scan-txt-${index}" 
          class="bg-slate-950 border border-slate-800 rounded px-2 py-1 text-slate-200 w-full focus:outline-none focus:border-purple-500">
      </div>
      <span class="text-[10px] px-2 py-0.5 rounded ${item.isValid ? 'bg-emerald-500/20 text-emerald-300' : 'bg-amber-500/20 text-amber-300'}">
        ${item.isValid ? 'Matched' : 'Check'}
      </span>
    </div>
  `).join('');
}

// Setup Review Confirmation Listeners
function setupReviewListeners() {
  const cancelBtn = document.getElementById('cancel-review-btn');
  const confirmBtn = document.getElementById('confirm-review-btn');
  const reviewCard = document.getElementById('bill-review-card');
  const billStatus = document.getElementById('bill-status');

  cancelBtn.addEventListener('click', () => {
    reviewCard.classList.add('hidden');
    pendingScannedItems = [];
    billStatus.innerText = 'Upload Grocery Bill';
  });

  confirmBtn.addEventListener('click', () => {
    let count = 0;
    pendingScannedItems.forEach((_, index) => {
      const chk = document.getElementById(`scan-chk-${index}`);
      const txt = document.getElementById(`scan-txt-${index}`);

      if (chk && chk.checked && txt.value.trim() !== '') {
        addNewItem(txt.value.trim(), 4, 'room');
        count++;
      }
    });

    reviewCard.classList.add('hidden');
    pendingScannedItems = [];
    billStatus.innerText = `Successfully Added ${count} Item(s)!`;
  });
}

// Render Quick Add Chips
function renderQuickAddButtons() {
  const container = document.getElementById('quick-add-container');
  const quickItems = [
    FOOD_CATEGORIES.VEGETABLES.items[1], // Tomatoes
    FOOD_CATEGORIES.DAIRY.items[0],      // Milk
    FOOD_CATEGORIES.COOKED_FOOD.items[2],// Batter
    FOOD_CATEGORIES.VEGETABLES.items[0], // Greens
    FOOD_CATEGORIES.BAKERY.items[0]      // Bread
  ];

  container.innerHTML = quickItems.map(item => `
    <button type="button" data-name="${item.name}" data-days="${item.days}" 
      class="quick-btn flex items-center gap-1.5 px-3 py-1.5 bg-slate-950 hover:bg-slate-800 border border-slate-800 rounded-xl text-xs font-semibold text-purple-300 transition-all">
      <span>${item.icon}</span> ${item.name} (${item.days}d)
    </button>
  `).join('');

  document.querySelectorAll('.quick-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const name = btn.getAttribute('data-name');
      const days = parseInt(btn.getAttribute('data-days'));
      addNewItem(name, days, 'room');
    });
  });
}

// Form Submission Event Handler
function setupFormListener() {
  const form = document.getElementById('add-form');
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const nameInput = document.getElementById('item-name');
    const categorySelect = document.getElementById('item-category');
    const storageSelect = document.getElementById('item-storage');

    const name = nameInput.value.trim();
    const category = categorySelect.value;
    const storage = storageSelect.value;
    
    const defaultDays = getDaysForCustomItem(category);

    addNewItem(name, defaultDays, storage);
    nameInput.value = '';
  });
}

// Add Item Controller
function addNewItem(name, defaultDays, storage) {
  const newItem = {
    id: Date.now().toString(),
    name,
    defaultDays,
    storage,
    addedDate: new Date().toISOString()
  };

  saveItem(newItem);
  renderInventory();
}

// Global External Actions
window.openRecipeSearch = function(itemName) {
  const cleanName = itemName.split('(')[0].trim();
  const query = encodeURIComponent(`quick recipes using ${cleanName}`);
  window.open(`https://www.youtube.com/results?search_query=${query}`, '_blank');
};

window.openStorageTips = function(itemName) {
  const cleanName = itemName.split('(')[0].trim();
  const query = encodeURIComponent(`how to store ${cleanName} for longer time Tamil`);
  window.open(`https://www.google.com/search?q=${query}`, '_blank');
};

window.deleteInventoryItem = function(id) {
  removeItem(id);
  renderInventory();
};

// UI List Render Controller
function renderInventory() {
  const listContainer = document.getElementById('inventory-list');
  const inventory = getItems();

  document.getElementById('item-count').innerText = `${inventory.length} Items`;

  if (inventory.length === 0) {
    listContainer.innerHTML = `
      <div class="text-center py-8 border border-dashed border-slate-800 rounded-2xl bg-slate-900/40">
        <p class="text-slate-500 text-sm">No items added yet. Use Voice, Bill upload, or buttons above!</p>
      </div>`;
    return;
  }

  inventory.sort((a, b) => calculateExpiry(a).remainingDays - calculateExpiry(b).remainingDays);

  listContainer.innerHTML = inventory.map(item => {
    const { percentage, statusText, badgeColor, barColor } = calculateExpiry(item);

    return `
      <div class="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-md hover:border-purple-500/30 transition-all">
        <div class="flex-1 space-y-2">
          <div class="flex items-center justify-between">
            <h3 class="font-bold text-base text-slate-100">${item.name} <span class="text-xs text-slate-500 font-normal">(${item.storage})</span></h3>
            <span class="text-xs px-2.5 py-0.5 border rounded-full font-medium ${badgeColor}">
              ${statusText}
            </span>
          </div>
          
          <div class="w-full bg-slate-950 h-2 rounded-full overflow-hidden border border-slate-800">
            <div class="h-full ${barColor} transition-all duration-300" style="width: ${percentage}%"></div>
          </div>
        </div>

        <div class="flex items-center gap-2 self-end sm:self-center">
          <button onclick="openStorageTips('${item.name}')" 
            class="px-3 py-1.5 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-300 text-xs font-semibold rounded-xl transition-all flex items-center gap-1">
            <span>💡</span> Tips
          </button>
          <button onclick="openRecipeSearch('${item.name}')" 
            class="px-3 py-1.5 bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/30 text-purple-300 text-xs font-semibold rounded-xl transition-all flex items-center gap-1">
            <span>🔍</span> Recipe
          </button>
          <button onclick="deleteInventoryItem('${item.id}')" 
            class="px-3 py-1.5 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-300 text-xs font-semibold rounded-xl transition-all">
            Remove
          </button>
        </div>
      </div>
    `;
  }).join('');
}