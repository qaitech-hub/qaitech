const storage = {
  get(key) {
    try {
      const value = localStorage.getItem(key);
      return JSON.parse(value);
    } catch (error) {
      console.error(`Error getting item ${key} from localStorage:`, error);
    }
  },
  set(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error(`Error setting item ${key} in localStorage:`, error);
    }
  },
  remove(key) {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.error(`Error removing item ${key} from localStorage:`, error);
    }
  },
};
export default storage;
