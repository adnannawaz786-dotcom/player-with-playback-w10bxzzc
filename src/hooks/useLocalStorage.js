import { useState, useEffect } from 'react';

const useLocalStorage = (key, initialValue) => {
  // Get from local storage then parse stored json or return initialValue
  const [storedValue, setStoredValue] = useState(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(`Error reading localStorage key "${key}":`, error);
      return initialValue;
    }
  });

  // Return a wrapped version of useState's setter function that persists the new value to localStorage
  const setValue = (value) => {
    try {
      // Allow value to be a function so we have the same API as useState
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      
      // Save state
      setStoredValue(valueToStore);
      
      // Save to local storage
      if (valueToStore === undefined) {
        window.localStorage.removeItem(key);
      } else {
        window.localStorage.setItem(key, JSON.stringify(valueToStore));
      }
    } catch (error) {
      console.error(`Error setting localStorage key "${key}":`, error);
    }
  };

  // Remove item from localStorage
  const removeValue = () => {
    try {
      window.localStorage.removeItem(key);
      setStoredValue(initialValue);
    } catch (error) {
      console.error(`Error removing localStorage key "${key}":`, error);
    }
  };

  // Listen for changes to this key from other tabs/windows
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === key && e.storageArea === localStorage) {
        try {
          const newValue = e.newValue ? JSON.parse(e.newValue) : initialValue;
          setStoredValue(newValue);
        } catch (error) {
          console.error(`Error parsing localStorage change for key "${key}":`, error);
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [key, initialValue]);

  return [storedValue, setValue, removeValue];
};

// Additional utility hooks for common localStorage operations
export const useLocalStorageArray = (key, initialValue = []) => {
  const [array, setArray, removeArray] = useLocalStorage(key, initialValue);

  const addItem = (item) => {
    setArray(prev => [...prev, item]);
  };

  const removeItem = (index) => {
    setArray(prev => prev.filter((_, i) => i !== index));
  };

  const updateItem = (index, newItem) => {
    setArray(prev => prev.map((item, i) => i === index ? newItem : item));
  };

  const clearArray = () => {
    setArray([]);
  };

  return {
    array,
    setArray,
    addItem,
    removeItem,
    updateItem,
    clearArray,
    removeArray
  };
};

export const useLocalStorageObject = (key, initialValue = {}) => {
  const [object, setObject, removeObject] = useLocalStorage(key, initialValue);

  const updateProperty = (property, value) => {
    setObject(prev => ({
      ...prev,
      [property]: value
    }));
  };

  const removeProperty = (property) => {
    setObject(prev => {
      const newObj = { ...prev };
      delete newObj[property];
      return newObj;
    });
  };

  const mergeObject = (newData) => {
    setObject(prev => ({
      ...prev,
      ...newData
    }));
  };

  return {
    object,
    setObject,
    updateProperty,
    removeProperty,
    mergeObject,
    removeObject
  };
};

export default useLocalStorage;