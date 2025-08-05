// Storage utility for managing local data and AI model persistence
class StorageManager {
  constructor() {
    this.dbName = 'creative-energy-flow';
    this.version = 1;
    this.db = null;
    this.init();
  }

  async init() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.version);
      
      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };
      
      request.onupgradeneeded = (event) => {
        const db = event.target.result;
        
        // Energy data store
        if (!db.objectStoreNames.contains('energyData')) {
          const energyStore = db.createObjectStore('energyData', { keyPath: 'timestamp' });
          energyStore.createIndex('date', 'date', { unique: false });
        }
        
        // Social battery data store
        if (!db.objectStoreNames.contains('socialData')) {
          const socialStore = db.createObjectStore('socialData', { keyPath: 'timestamp' });
          socialStore.createIndex('date', 'date', { unique: false });
        }
        
        // AI model data store
        if (!db.objectStoreNames.contains('aiModels')) {
          db.createObjectStore('aiModels', { keyPath: 'modelId' });
        }
        
        // Task and schedule data
        if (!db.objectStoreNames.contains('tasks')) {
          const taskStore = db.createObjectStore('tasks', { keyPath: 'id' });
          taskStore.createIndex('priority', 'priority', { unique: false });
          taskStore.createIndex('energyRequirement', 'energyRequirement', { unique: false });
        }
        
        // Calendar events
        if (!db.objectStoreNames.contains('events')) {
          const eventStore = db.createObjectStore('events', { keyPath: 'id' });
          eventStore.createIndex('startTime', 'startTime', { unique: false });
        }
        
        // AI insights and recommendations
        if (!db.objectStoreNames.contains('insights')) {
          db.createObjectStore('insights', { keyPath: 'id' });
        }
      };
    });
  }

  async store(storeName, data) {
    const transaction = this.db.transaction([storeName], 'readwrite');
    const store = transaction.objectStore(storeName);
    return store.put(data);
  }

  async get(storeName, key) {
    const transaction = this.db.transaction([storeName], 'readonly');
    const store = transaction.objectStore(storeName);
    return store.get(key);
  }

  async getAll(storeName, indexName = null, query = null) {
    const transaction = this.db.transaction([storeName], 'readonly');
    const store = transaction.objectStore(storeName);
    
    if (indexName) {
      const index = store.index(indexName);
      return query ? index.getAll(query) : index.getAll();
    }
    
    return store.getAll();
  }

  async delete(storeName, key) {
    const transaction = this.db.transaction([storeName], 'readwrite');
    const store = transaction.objectStore(storeName);
    return store.delete(key);
  }

  async clear(storeName) {
    const transaction = this.db.transaction([storeName], 'readwrite');
    const store = transaction.objectStore(storeName);
    return store.clear();
  }

  // Specific methods for AI data
  async storeEnergyData(data) {
    return this.store('energyData', {
      timestamp: Date.now(),
      date: new Date().toISOString().split('T')[0],
      ...data
    });
  }

  async storeSocialData(data) {
    return this.store('socialData', {
      timestamp: Date.now(),
      date: new Date().toISOString().split('T')[0],
      ...data
    });
  }

  async getEnergyHistory(days = 30) {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);
    const cutoffString = cutoffDate.toISOString().split('T')[0];
    
    const data = await this.getAll('energyData', 'date');
    return data.filter(item => item.date >= cutoffString);
  }

  async getSocialHistory(days = 30) {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);
    const cutoffString = cutoffDate.toISOString().split('T')[0];
    
    const data = await this.getAll('socialData', 'date');
    return data.filter(item => item.date >= cutoffString);
  }

  async storeAIModel(modelId, modelData) {
    return this.store('aiModels', {
      modelId,
      data: modelData,
      lastUpdated: Date.now()
    });
  }

  async getAIModel(modelId) {
    return this.get('aiModels', modelId);
  }

  // Local storage fallback for simple data
  setLocalData(key, data) {
    try {
      localStorage.setItem(key, JSON.stringify(data));
    } catch (error) {
      console.error('Failed to store local data:', error);
    }
  }

  getLocalData(key, defaultValue = null) {
    try {
      const data = localStorage.getItem(key);
      return data ? JSON.parse(data) : defaultValue;
    } catch (error) {
      console.error('Failed to retrieve local data:', error);
      return defaultValue;
    }
  }
}

export default StorageManager;