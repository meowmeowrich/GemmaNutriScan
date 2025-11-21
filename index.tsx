import { resizeImageForAi } from './utils/imageUtils';
import { analyzeFoodImage } from './services/aiService';
import { LmStudioConfig, FoodAnalysisResult } from './types';

// --- State ---
let config: LmStudioConfig = {
  baseUrl: '/api/lmstudio',
  model: 'google/gemma-3-12b'
};

// --- DOM Elements ---
const els = {
  uploadZone: document.getElementById('upload-zone') as HTMLDivElement,
  fileInput: document.getElementById('file-input') as HTMLInputElement,
  imagePreview: document.getElementById('image-preview') as HTMLImageElement,
  uploadPrompt: document.getElementById('upload-prompt') as HTMLDivElement,
  loadingState: document.getElementById('loading-state') as HTMLDivElement,
  errorState: document.getElementById('error-state') as HTMLDivElement,
  errorMessage: document.getElementById('error-message') as HTMLParagraphElement,
  resultsContainer: document.getElementById('results-container') as HTMLDivElement,
  emptyState: document.getElementById('empty-state') as HTMLDivElement,
  contentState: document.getElementById('content-state') as HTMLDivElement,
  
  // Results Fields
  resFoodName: document.getElementById('res-food-name') as HTMLHeadingElement,
  resDescription: document.getElementById('res-description') as HTMLParagraphElement,
  resCalories: document.getElementById('res-calories') as HTMLParagraphElement,
  resWeight: document.getElementById('res-weight') as HTMLParagraphElement,
  macrosList: document.getElementById('macros-list') as HTMLDivElement,
  vitaminsList: document.getElementById('vitamins-list') as HTMLDivElement,
  healthScore: document.getElementById('health-score') as HTMLSpanElement,

  // Settings
  settingsBtn: document.getElementById('settings-btn') as HTMLButtonElement,
  settingsModal: document.getElementById('settings-modal') as HTMLDivElement,
  settingsClose: document.getElementById('settings-close') as HTMLButtonElement,
  settingsSave: document.getElementById('settings-save') as HTMLButtonElement,
  settingUrl: document.getElementById('setting-url') as HTMLInputElement,
  settingModel: document.getElementById('setting-model') as HTMLInputElement,
};

// --- Event Listeners ---

els.uploadZone.addEventListener('click', () => els.fileInput.click());

els.fileInput.addEventListener('change', async (e) => {
  const file = (e.target as HTMLInputElement).files?.[0];
  if (file) handleImageUpload(file);
});

els.settingsBtn.addEventListener('click', () => {
  els.settingUrl.value = config.baseUrl;
  els.settingModel.value = config.model;
  els.settingsModal.classList.remove('hidden');
});

els.settingsClose.addEventListener('click', () => {
  els.settingsModal.classList.add('hidden');
});

els.settingsSave.addEventListener('click', () => {
  config.baseUrl = els.settingUrl.value;
  config.model = els.settingModel.value;
  els.settingsModal.classList.add('hidden');
});

// --- Logic ---

async function handleImageUpload(file: File) {
  // Reset UI
  els.errorState.classList.add('hidden');
  els.contentState.classList.add('hidden');
  els.emptyState.classList.add('hidden');
  els.loadingState.classList.remove('hidden');
  
  // Show Preview
  const reader = new FileReader();
  reader.onload = (e) => {
    els.imagePreview.src = e.target?.result as string;
    els.imagePreview.classList.remove('hidden');
    els.uploadPrompt.classList.add('opacity-0'); // Hide prompt text but keep layout
  };
  reader.readAsDataURL(file);

  try {
    // 1. Resize
    const resizedBase64 = await resizeImageForAi(file, 896);
    
    // 2. Analyze
    const result = await analyzeFoodImage(resizedBase64, config);
    
    // 3. Render
    renderResults(result);
    
  } catch (err: any) {
    els.loadingState.classList.add('hidden');
    els.errorState.classList.remove('hidden');
    els.errorMessage.textContent = err.message || "Failed to analyze image.";
    els.emptyState.classList.remove('hidden');
    console.error(err);
  }
}

function renderResults(data: FoodAnalysisResult) {
  els.loadingState.classList.add('hidden');
  els.contentState.classList.remove('hidden');

  // Text Fields
  els.resFoodName.textContent = data.foodName;
  els.resDescription.textContent = data.description;
  els.resCalories.textContent = data.calories.toString();
  els.resWeight.textContent = data.estimatedWeight;
  els.healthScore.textContent = `${data.healthScore}/10`;

  // Health Score Color
  const score = data.healthScore;
  els.healthScore.className = `text-xl font-bold ${score >= 7 ? 'text-brand-400' : score >= 4 ? 'text-amber-400' : 'text-red-400'}`;

  // Render Macros
  els.macrosList.innerHTML = '';
  els.macrosList.appendChild(createProgressBar('Protein', data.macros.protein.amount, 50, 'g', 'bg-blue-500'));
  els.macrosList.appendChild(createProgressBar('Carbohydrates', data.macros.carbs.amount, 100, 'g', 'bg-amber-500'));
  els.macrosList.appendChild(createProgressBar('Fats', data.macros.fat.amount, 40, 'g', 'bg-rose-500'));

  // Render Vitamins
  els.vitaminsList.innerHTML = '';
  data.vitamins.forEach((vit) => {
    els.vitaminsList.appendChild(createVitaminBar(vit.name, vit.level));
  });

  // Trigger Animations after append
  requestAnimationFrame(() => {
    document.querySelectorAll('.bar-fill').forEach((bar: any) => {
      bar.style.width = bar.dataset.width;
    });
  });
}

function createProgressBar(label: string, value: number, max: number, unit: string, colorClass: string) {
  const container = document.createElement('div');
  container.className = 'mb-4 w-full';
  const percentage = Math.min((value / max) * 100, 100);
  
  container.innerHTML = `
    <div class="flex justify-between items-end mb-1">
      <span class="text-sm font-medium text-slate-300">${label}</span>
      <span class="text-xs font-mono text-slate-400">${value}${unit}</span>
    </div>
    <div class="w-full bg-slate-800 rounded-full h-2.5 overflow-hidden">
      <div
        class="h-2.5 rounded-full ${colorClass} bar-fill"
        style="width: 0%"
        data-width="${percentage}%"
      ></div>
    </div>
  `;
  return container;
}

function createVitaminBar(name: string, level: number) {
  const container = document.createElement('div');
  container.className = 'flex items-center gap-3';
  
  container.innerHTML = `
    <div class="w-24 text-sm text-slate-300 font-medium">${name}</div>
    <div class="flex-1 h-2 bg-slate-700 rounded-full overflow-hidden">
      <div 
         class="h-full bg-brand-400 rounded-full bar-fill"
         style="width: 0%"
         data-width="${Math.min(level, 100)}%"
      ></div>
    </div>
    <div class="w-12 text-right text-xs text-slate-400">${level}%</div>
  `;
  return container;
}