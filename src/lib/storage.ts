class MemoryStorage {
  private items: Record<string, string> = {};

  getItem(key: string): string | null {
    return this.items[key] !== undefined ? this.items[key] : null;
  }

  setItem(key: string, value: string): void {
    this.items[key] = String(value);
  }

  removeItem(key: string): void {
    delete this.items[key];
  }

  clear(): void {
    this.items = {};
  }
}

const createSafeStorage = (type: 'localStorage' | 'sessionStorage') => {
  try {
    const storageObj = window[type];
    const testKey = '__storage_test_key__';
    storageObj.setItem(testKey, 'test');
    storageObj.removeItem(testKey);
    return storageObj;
  } catch (e) {
    console.warn(`[Storage Warning] ${type} is not accessible. Falling back to secure in-memory representation.`);
    return new MemoryStorage() as unknown as Storage;
  }
};

export const safeLocalStorage = createSafeStorage('localStorage');
export const safeSessionStorage = createSafeStorage('sessionStorage');

export const safeScrollTo = (options: ScrollToOptions | number, y?: number) => {
  try {
    if (typeof window !== 'undefined' && window.scrollTo) {
      if (typeof options === 'object') {
        window.scrollTo(options);
      } else if (typeof options === 'number' && typeof y === 'number') {
        window.scrollTo(options, y);
      }
    }
  } catch (e) {
    try {
      if (typeof window !== 'undefined' && window.scrollTo) {
        if (typeof options === 'object') {
          window.scrollTo(0, options.top || 0);
        }
      }
    } catch (ignore) {}
  }
};

