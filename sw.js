const CACHE_NAME = 'creative-energy-flow-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/styles/main.css',
  '/js/app.js',
  '/js/ai/aiConstraintEngine.js',
  '/js/ai/energyOptimizer.js',
  '/js/ai/socialBatteryAI.js',
  '/js/ai/taskPriorityAI.js',
  '/js/ai/scheduleOptimizer.js',
  '/js/ai/energyForecastAI.js',
  '/js/core/energyTracker.js',
  '/js/core/socialBattery.js',
  '/js/utils/storage.js',
  '/manifest.json'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Return cached version or fetch from network
        return response || fetch(event.request);
      }
    )
  );
});

// Background sync for AI processing
self.addEventListener('sync', event => {
  if (event.tag === 'ai-analysis') {
    event.waitUntil(processAIAnalysis());
  }
});

async function processAIAnalysis() {
  // Process pending AI analysis tasks
  const pendingTasks = await getStoredData('pendingAITasks') || [];
  
  for (const task of pendingTasks) {
    try {
      await processAITask(task);
    } catch (error) {
      console.error('AI task processing failed:', error);
    }
  }
  
  await clearStoredData('pendingAITasks');
}