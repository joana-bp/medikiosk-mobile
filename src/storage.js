// Small key/value store: SecureStore on phones (encrypted), localStorage in the web preview.
import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';

const web = Platform.OS === 'web';

export const storage = {
  async get(key) {
    try {
      return web ? window.localStorage.getItem(key) : await SecureStore.getItemAsync(key);
    } catch {
      return null;
    }
  },
  async set(key, value) {
    try {
      if (web) window.localStorage.setItem(key, value);
      else await SecureStore.setItemAsync(key, value);
    } catch {
      // storage unavailable: the person just signs in again next time
    }
  },
  async remove(key) {
    try {
      if (web) window.localStorage.removeItem(key);
      else await SecureStore.deleteItemAsync(key);
    } catch {
      // ignore
    }
  },
};
