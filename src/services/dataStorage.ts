interface StoredData<T> {
  data: T;
  timestamp: string;
  version: string;
  expiresAt?: string;
}

class DataStorageService {
  private readonly PREFIX = 'universal-sim-';
  private readonly VERSION = '1.0';

  // Save data to localStorage with metadata
  public save<T>(key: string, data: T, expirationHours?: number): void {
    try {
      const storageData: StoredData<T> = {
        data,
        timestamp: new Date().toISOString(),
        version: this.VERSION
      };

      if (expirationHours) {
        const expiresAt = new Date();
        expiresAt.setHours(expiresAt.getHours() + expirationHours);
        storageData.expiresAt = expiresAt.toISOString();
      }

      localStorage.setItem(this.PREFIX + key, JSON.stringify(storageData));
    } catch (error) {
      console.error(`Failed to save data for key ${key}:`, error);
      // If localStorage is full, try to clean up old data
      this.cleanupExpiredData();
    }
  }

  // Load data from localStorage
  public load<T>(key: string): T | null {
    try {
      const item = localStorage.getItem(this.PREFIX + key);
      if (!item) return null;

      const storageData: StoredData<T> = JSON.parse(item);

      // Check if data has expired
      if (storageData.expiresAt) {
        const expiresAt = new Date(storageData.expiresAt);
        if (new Date() > expiresAt) {
          this.remove(key);
          return null;
        }
      }

      return storageData.data;
    } catch (error) {
      console.error(`Failed to load data for key ${key}:`, error);
      return null;
    }
  }

  // Get data with metadata
  public loadWithMetadata<T>(key: string): StoredData<T> | null {
    try {
      const item = localStorage.getItem(this.PREFIX + key);
      if (!item) return null;

      const storageData: StoredData<T> = JSON.parse(item);

      // Check if data has expired
      if (storageData.expiresAt) {
        const expiresAt = new Date(storageData.expiresAt);
        if (new Date() > expiresAt) {
          this.remove(key);
          return null;
        }
      }

      return storageData;
    } catch (error) {
      console.error(`Failed to load data with metadata for key ${key}:`, error);
      return null;
    }
  }

  // Remove specific item
  public remove(key: string): void {
    try {
      localStorage.removeItem(this.PREFIX + key);
    } catch (error) {
      console.error(`Failed to remove data for key ${key}:`, error);
    }
  }

  // Get last update time for a key
  public getLastUpdateTime(key: string): Date | null {
    const data = this.loadWithMetadata(key);
    return data ? new Date(data.timestamp) : null;
  }

  // Check if data exists and is not expired
  public exists(key: string): boolean {
    return this.load(key) !== null;
  }

  // Clean up expired data
  private cleanupExpiredData(): void {
    try {
      const keys = Object.keys(localStorage);
      const now = new Date();

      keys.forEach(key => {
        if (key.startsWith(this.PREFIX)) {
          try {
            const item = localStorage.getItem(key);
            if (item) {
              const storageData: StoredData<any> = JSON.parse(item);
              if (storageData.expiresAt) {
                const expiresAt = new Date(storageData.expiresAt);
                if (now > expiresAt) {
                  localStorage.removeItem(key);
                }
              }
            }
          } catch (error) {
            // If we can't parse it, remove it
            localStorage.removeItem(key);
          }
        }
      });
    } catch (error) {
      console.error('Failed to cleanup expired data:', error);
    }
  }

  // Get all keys managed by this service
  public getAllKeys(): string[] {
    const keys: string[] = [];
    try {
      Object.keys(localStorage).forEach(key => {
        if (key.startsWith(this.PREFIX)) {
          keys.push(key.substring(this.PREFIX.length));
        }
      });
    } catch (error) {
      console.error('Failed to get all keys:', error);
    }
    return keys;
  }

  // Clear all data managed by this service
  public clearAll(): void {
    try {
      const keys = Object.keys(localStorage);
      keys.forEach(key => {
        if (key.startsWith(this.PREFIX)) {
          localStorage.removeItem(key);
        }
      });
    } catch (error) {
      console.error('Failed to clear all data:', error);
    }
  }

  // Get storage size info
  public getStorageInfo(): { used: number; available: number; percentage: number } {
    try {
      let used = 0;
      const keys = Object.keys(localStorage);
      
      keys.forEach(key => {
        if (key.startsWith(this.PREFIX)) {
          const item = localStorage.getItem(key);
          if (item) {
            used += item.length + key.length;
          }
        }
      });

      // Estimate available space (localStorage typically has 5-10MB limit)
      const estimatedTotal = 5 * 1024 * 1024; // 5MB in bytes
      const available = estimatedTotal - used;
      const percentage = (used / estimatedTotal) * 100;

      return { used, available, percentage };
    } catch (error) {
      console.error('Failed to get storage info:', error);
      return { used: 0, available: 0, percentage: 0 };
    }
  }
}

export const dataStorage = new DataStorageService();