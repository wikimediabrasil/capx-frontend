/**
 * Utility functions for safely accessing and manipulating data
 * to prevent "Cannot read properties of undefined" errors
 */

/**
 * Ensures the value is an array
 * Returns an empty array if the value is null, undefined, or not an array
 */
export const ensureArray = <T>(value: any): T[] => {
  if (value === null || value === undefined) return [];
  if (Array.isArray(value)) return value as T[];
  return [];
};

/**
 * Safely accesses a property from an object with a default value
 * Returns the default value if the object is null, undefined, or the property doesn't exist
 */
export const safeAccess = <T extends object, K extends keyof T>(
  obj: T | null | undefined,
  key: K,
  defaultValue: T[K]
): T[K] => {
  if (obj === null || obj === undefined) return defaultValue;
  return obj[key] !== undefined ? obj[key] : defaultValue;
};

/**
 * Safely processes an array of IDs ensuring they are valid numbers
 * Filters out null, undefined, and NaN values
 */
export const processIdArray = (ids: any[] = []): number[] => {
  return ensureArray(ids)
    .filter(id => id !== null && id !== undefined)
    .map(id => {
      const num = Number(id);
      return isNaN(num) ? null : num;
    })
    .filter((id): id is number => id !== null);
};

/**
 * Creates a safe function wrapper that catches any errors
 * and returns a fallback value instead of crashing
 */
export const createSafeFunction = <T extends (...args: any[]) => any>(
  fn: T,
  fallbackValue: ReturnType<T>,
  errorLogger?: (error: any) => void
): T => {
  return ((...args: Parameters<T>): ReturnType<T> => {
    try {
      return fn(...args);
    } catch (error) {
      if (errorLogger) {
        errorLogger(error);
      } else {
        console.error('Error in safe function:', error);
      }
      return fallbackValue;
    }
  }) as T;
};

/**
 * Safely stringify a value to JSON, returning a fallback string if it fails
 */
export const safeStringify = (value: any, fallback: string = '{}'): string => {
  try {
    return JSON.stringify(value);
  } catch (error) {
    console.error('Error stringifying value:', error);
    return fallback;
  }
};

/**
 * Safely parse a JSON string, returning a fallback value if it fails
 */
export const safeParse = <T>(jsonString: string, fallback: T): T => {
  try {
    return JSON.parse(jsonString) as T;
  } catch (error) {
    console.error('Error parsing JSON:', error);
    return fallback;
  }
};
