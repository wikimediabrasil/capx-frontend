import {
  ensureArray,
  safeAccess,
  processIdArray,
  createSafeFunction,
  safeStringify,
  safeParse,
} from '@/lib/utils/safeDataAccess';

describe('safeDataAccess', () => {
  describe('ensureArray', () => {
    it('returns [] for null', () => {
      expect(ensureArray(null)).toEqual([]);
    });

    it('returns [] for undefined', () => {
      expect(ensureArray(undefined)).toEqual([]);
    });

    it('returns [] for a number', () => {
      expect(ensureArray(42)).toEqual([]);
    });

    it('returns [] for a string', () => {
      expect(ensureArray('hello')).toEqual([]);
    });

    it('returns [] for a plain object', () => {
      expect(ensureArray({ a: 1 })).toEqual([]);
    });

    it('returns the array as-is for a non-empty array', () => {
      const arr = [1, 2, 3];
      expect(ensureArray(arr)).toBe(arr);
    });

    it('returns the array as-is for an empty array', () => {
      const arr: number[] = [];
      expect(ensureArray(arr)).toBe(arr);
    });

    it('preserves typed arrays', () => {
      const arr = ['a', 'b'];
      expect(ensureArray<string>(arr)).toEqual(['a', 'b']);
    });
  });

  describe('safeAccess', () => {
    it('returns the property value when it exists', () => {
      expect(safeAccess({ name: 'Alice' }, 'name', 'default')).toBe('Alice');
    });

    it('returns the default when the object is null', () => {
      expect(safeAccess(null as any, 'name' as any, 'default')).toBe('default');
    });

    it('returns the default when the object is undefined', () => {
      expect(safeAccess(undefined as any, 'name' as any, 'default')).toBe('default');
    });

    it('returns the default when the property is undefined on the object', () => {
      const obj: { name?: string } = {};
      expect(safeAccess(obj, 'name', 'fallback')).toBe('fallback');
    });

    it('returns the property value when it is falsy but defined (0)', () => {
      expect(safeAccess({ count: 0 }, 'count', 99)).toBe(0);
    });

    it('returns the property value when it is falsy but defined (empty string)', () => {
      expect(safeAccess({ label: '' }, 'label', 'fallback')).toBe('');
    });

    it('works with boolean properties', () => {
      expect(safeAccess({ active: false }, 'active', true)).toBe(false);
    });

    it('works with nested objects as values', () => {
      const inner = { x: 1 };
      expect(safeAccess({ inner }, 'inner', null)).toBe(inner);
    });
  });

  describe('processIdArray', () => {
    it('returns an empty array for an empty input', () => {
      expect(processIdArray([])).toEqual([]);
    });

    it('converts string numbers to numbers', () => {
      expect(processIdArray(['1', '2', '3'])).toEqual([1, 2, 3]);
    });

    it('keeps valid numeric values', () => {
      expect(processIdArray([1, 2, 3])).toEqual([1, 2, 3]);
    });

    it('filters out null values', () => {
      expect(processIdArray([1, null, 3])).toEqual([1, 3]);
    });

    it('filters out undefined values', () => {
      expect(processIdArray([1, undefined, 3])).toEqual([1, 3]);
    });

    it('filters out NaN-producing strings', () => {
      expect(processIdArray([1, 'abc', 3])).toEqual([1, 3]);
    });

    it('handles a mix of valid and invalid values', () => {
      expect(processIdArray([1, null, 'two', undefined, '4', 5])).toEqual([1, 4, 5]);
    });

    it('defaults to empty array when called with no arguments', () => {
      expect(processIdArray()).toEqual([]);
    });

    it('converts float strings to floats', () => {
      expect(processIdArray(['1.5', '2.7'])).toEqual([1.5, 2.7]);
    });
  });

  describe('createSafeFunction', () => {
    it('returns the result of the wrapped function on success', () => {
      const add = (a: number, b: number) => a + b;
      const safeAdd = createSafeFunction(add, -1);
      expect(safeAdd(2, 3)).toBe(5);
    });

    it('returns the fallback value when the function throws', () => {
      const boom = () => {
        throw new Error('boom');
      };
      const safeBoom = createSafeFunction(boom, 'fallback');
      expect(safeBoom()).toBe('fallback');
    });

    it('calls the custom errorLogger when the function throws', () => {
      const logger = jest.fn();
      const boom = () => {
        throw new Error('oops');
      };
      const safeBoom = createSafeFunction(boom, null, logger);
      safeBoom();
      expect(logger).toHaveBeenCalledTimes(1);
      expect(logger.mock.calls[0][0]).toBeInstanceOf(Error);
    });

    it('falls back to console.error when no logger is provided', () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
      const boom = () => {
        throw new Error('no logger');
      };
      const safeBoom = createSafeFunction(boom, 0);
      safeBoom();
      expect(consoleSpy).toHaveBeenCalled();
      consoleSpy.mockRestore();
    });

    it('passes arguments through to the wrapped function', () => {
      const fn = jest.fn((x: string) => x.toUpperCase());
      const safeFn = createSafeFunction(fn, '');
      expect(safeFn('hello')).toBe('HELLO');
      expect(fn).toHaveBeenCalledWith('hello');
    });
  });

  describe('safeStringify', () => {
    it('stringifies a plain object', () => {
      expect(safeStringify({ a: 1 })).toBe('{"a":1}');
    });

    it('stringifies an array', () => {
      expect(safeStringify([1, 2, 3])).toBe('[1,2,3]');
    });

    it('stringifies a primitive', () => {
      expect(safeStringify(42)).toBe('42');
    });

    it('returns the default fallback "{}" for circular references', () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
      const obj: any = {};
      obj.self = obj;
      expect(safeStringify(obj)).toBe('{}');
      consoleSpy.mockRestore();
    });

    it('returns a custom fallback for circular references', () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
      const obj: any = {};
      obj.self = obj;
      expect(safeStringify(obj, 'ERROR')).toBe('ERROR');
      consoleSpy.mockRestore();
    });

    it('stringifies null', () => {
      expect(safeStringify(null)).toBe('null');
    });
  });

  describe('safeParse', () => {
    it('parses a valid JSON object string', () => {
      expect(safeParse('{"a":1}', {})).toEqual({ a: 1 });
    });

    it('parses a valid JSON array string', () => {
      expect(safeParse('[1,2,3]', [])).toEqual([1, 2, 3]);
    });

    it('parses a primitive JSON string', () => {
      expect(safeParse('42', 0)).toBe(42);
    });

    it('returns the fallback for invalid JSON', () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
      expect(safeParse('not json', { default: true })).toEqual({ default: true });
      consoleSpy.mockRestore();
    });

    it('returns the fallback for an empty string', () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
      expect(safeParse('', null)).toBeNull();
      consoleSpy.mockRestore();
    });

    it('returns the fallback for malformed JSON', () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
      expect(safeParse('{bad json}', [])).toEqual([]);
      consoleSpy.mockRestore();
    });
  });
});
