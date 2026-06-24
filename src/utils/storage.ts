import { Platform } from 'react-native';

type StorageShape = {
  getItem: (key: string) => Promise<string | null>;
  setItem: (key: string, value: string) => Promise<void>;
};

let storage: StorageShape;

if (Platform.OS === 'web' && typeof window !== 'undefined' && window.localStorage) {
  storage = {
    getItem: async (k: string) => window.localStorage.getItem(k),
    setItem: async (k: string, v: string) => window.localStorage.setItem(k, v),
  };
} else {
  try {
    // Try to require AsyncStorage at runtime for native platforms
    // eslint-disable-next-line @typescript-eslint/no-var-requires, @typescript-eslint/no-unsafe-assignment
    const AsyncStorage = require('@react-native-async-storage/async-storage');
    storage = {
      getItem: AsyncStorage.getItem.bind(AsyncStorage),
      setItem: AsyncStorage.setItem.bind(AsyncStorage),
    };
  } catch (e) {
    // Fallback no-op storage
    storage = {
      getItem: async () => null,
      setItem: async () => {},
    };
  }
}

export default storage;
