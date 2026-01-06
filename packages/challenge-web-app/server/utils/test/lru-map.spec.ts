import { describe, it, expect, beforeEach } from 'vitest';
import { LRUMap } from '../lru-map';

describe('LRUMap', () => {
   let lruMap: LRUMap<string, number>;

   beforeEach(() => {
      lruMap = new LRUMap<string, number>(3);
   });

   describe('constructor', () => {
      it('should create an LRUMap with the specified max size', () => {
         expect(lruMap.maxSize).toBe(3);
         expect(lruMap.size).toBe(0);
         expect(lruMap.isEmpty).toBe(true);
      });

      it('should throw error for invalid max size', () => {
         expect(() => new LRUMap(0)).toThrow('maxSize must be greater than 0');
         expect(() => new LRUMap(-1)).toThrow('maxSize must be greater than 0');
      });
   });

   describe('set and get', () => {
      it('should set and get values correctly', () => {
         lruMap.set('a', 1);
         lruMap.set('b', 2);

         expect(lruMap.get('a')).toBe(1);
         expect(lruMap.get('b')).toBe(2);
         expect(lruMap.size).toBe(2);
      });

      it('should return undefined for non-existent keys', () => {
         expect(lruMap.get('nonexistent')).toBeUndefined();
      });

      it('should update value for existing key', () => {
         lruMap.set('a', 1);
         lruMap.set('a', 10);

         expect(lruMap.get('a')).toBe(10);
         expect(lruMap.size).toBe(1);
      });
   });

   describe('LRU eviction', () => {
      it('should evict least recently used item when capacity is exceeded', () => {
         // Fill to capacity
         lruMap.set('a', 1);
         lruMap.set('b', 2);
         lruMap.set('c', 3);

         expect(lruMap.size).toBe(3);
         expect(lruMap.isFull).toBe(true);

         // Add one more - should evict 'a'
         lruMap.set('d', 4);

         expect(lruMap.size).toBe(3);
         expect(lruMap.has('a')).toBe(false);
         expect(lruMap.has('b')).toBe(true);
         expect(lruMap.has('c')).toBe(true);
         expect(lruMap.has('d')).toBe(true);
      });

      it('should move accessed item to most recent position', () => {
         lruMap.set('a', 1);
         lruMap.set('b', 2);
         lruMap.set('c', 3);

         // Access 'a' to make it most recent
         lruMap.get('a');

         // Add new item - should evict 'b' (oldest unaccessed)
         lruMap.set('d', 4);

         expect(lruMap.has('a')).toBe(true);
         expect(lruMap.has('b')).toBe(false);
         expect(lruMap.has('c')).toBe(true);
         expect(lruMap.has('d')).toBe(true);
      });

      it('should handle setting existing key without eviction', () => {
         lruMap.set('a', 1);
         lruMap.set('b', 2);
         lruMap.set('c', 3);

         // Update existing key - no eviction should occur
         lruMap.set('b', 20);

         expect(lruMap.size).toBe(3);
         expect(lruMap.get('b')).toBe(20);
         expect(lruMap.has('a')).toBe(true);
         expect(lruMap.has('c')).toBe(true);
      });
   });

   describe('has', () => {
      it('should return true for existing keys', () => {
         lruMap.set('a', 1);
         expect(lruMap.has('a')).toBe(true);
      });

      it('should return false for non-existing keys', () => {
         expect(lruMap.has('nonexistent')).toBe(false);
      });
   });

   describe('delete', () => {
      it('should delete existing keys', () => {
         lruMap.set('a', 1);
         lruMap.set('b', 2);

         expect(lruMap.delete('a')).toBe(true);
         expect(lruMap.has('a')).toBe(false);
         expect(lruMap.size).toBe(1);
      });

      it('should return false for non-existing keys', () => {
         expect(lruMap.delete('nonexistent')).toBe(false);
      });
   });

   describe('clear', () => {
      it('should clear all items', () => {
         lruMap.set('a', 1);
         lruMap.set('b', 2);
         lruMap.set('c', 3);

         lruMap.clear();

         expect(lruMap.size).toBe(0);
         expect(lruMap.isEmpty).toBe(true);
         expect(lruMap.has('a')).toBe(false);
      });
   });

   describe('properties', () => {
      it('should track size correctly', () => {
         expect(lruMap.size).toBe(0);

         lruMap.set('a', 1);
         expect(lruMap.size).toBe(1);

         lruMap.set('b', 2);
         expect(lruMap.size).toBe(2);

         lruMap.delete('a');
         expect(lruMap.size).toBe(1);
      });

      it('should report isEmpty correctly', () => {
         expect(lruMap.isEmpty).toBe(true);

         lruMap.set('a', 1);
         expect(lruMap.isEmpty).toBe(false);

         lruMap.clear();
         expect(lruMap.isEmpty).toBe(true);
      });

      it('should report isFull correctly', () => {
         expect(lruMap.isFull).toBe(false);

         lruMap.set('a', 1);
         lruMap.set('b', 2);
         expect(lruMap.isFull).toBe(false);

         lruMap.set('c', 3);
         expect(lruMap.isFull).toBe(true);
      });

      it('should calculate utilization correctly', () => {
         expect(lruMap.utilization).toBe(0);

         lruMap.set('a', 1);
         expect(lruMap.utilization).toBeCloseTo(1 / 3);

         lruMap.set('b', 2);
         expect(lruMap.utilization).toBeCloseTo(2 / 3);

         lruMap.set('c', 3);
         expect(lruMap.utilization).toBe(1);
      });
   });

   describe('getOldestKey and getNewestKey', () => {
      it('should return undefined for empty map', () => {
         expect(lruMap.getOldestKey()).toBeUndefined();
         expect(lruMap.getNewestKey()).toBeUndefined();
      });

      it('should track oldest and newest keys correctly', () => {
         lruMap.set('a', 1);
         expect(lruMap.getOldestKey()).toBe('a');
         expect(lruMap.getNewestKey()).toBe('a');

         lruMap.set('b', 2);
         expect(lruMap.getOldestKey()).toBe('a');
         expect(lruMap.getNewestKey()).toBe('b');

         lruMap.set('c', 3);
         expect(lruMap.getOldestKey()).toBe('a');
         expect(lruMap.getNewestKey()).toBe('c');

         // Access 'a' to make it newest
         lruMap.get('a');
         expect(lruMap.getOldestKey()).toBe('b');
         expect(lruMap.getNewestKey()).toBe('a');
      });
   });

   describe('iteration methods', () => {
      beforeEach(() => {
         lruMap.set('a', 1);
         lruMap.set('b', 2);
         lruMap.set('c', 3);
      });

      it('should iterate over keys', () => {
         const keys = Array.from(lruMap.keys());
         expect(keys).toEqual(['a', 'b', 'c']);
      });

      it('should iterate over values', () => {
         const values = Array.from(lruMap.values());
         expect(values).toEqual([1, 2, 3]);
      });

      it('should iterate over entries', () => {
         const entries = Array.from(lruMap.entries());
         expect(entries).toEqual([
            ['a', 1],
            ['b', 2],
            ['c', 3],
         ]);
      });

      it('should be iterable with for...of', () => {
         const entries: [string, number][] = [];
         for (const entry of lruMap) {
            entries.push(entry);
         }
         expect(entries).toEqual([
            ['a', 1],
            ['b', 2],
            ['c', 3],
         ]);
      });

      it('should work with forEach', () => {
         const entries: [string, number][] = [];
         lruMap.forEach((value, key, map) => {
            entries.push([key, value]);
            expect(map).toBe(lruMap);
         });
         expect(entries).toEqual([
            ['a', 1],
            ['b', 2],
            ['c', 3],
         ]);
      });
   });

   describe('conversion methods', () => {
      beforeEach(() => {
         lruMap.set('a', 1);
         lruMap.set('b', 2);
         lruMap.set('c', 3);
      });

      it('should convert to object', () => {
         const obj = lruMap.toObject();
         expect(obj).toEqual({ a: 1, b: 2, c: 3 });
      });

      it('should convert to array', () => {
         const arr = lruMap.toArray();
         expect(arr).toEqual([
            ['a', 1],
            ['b', 2],
            ['c', 3],
         ]);
      });

      it('should create string representation', () => {
         const str = lruMap.toString();
         expect(str).toBe('LRUMap(3) { a => 1, b => 2, c => 3 }');
      });
   });

   describe('static methods', () => {
      it('should create LRUMap from array', () => {
         const entries: [string, number][] = [
            ['a', 1],
            ['b', 2],
            ['c', 3],
         ];
         const newLruMap = LRUMap.fromArray(entries, 5);

         expect(newLruMap.maxSize).toBe(5);
         expect(newLruMap.size).toBe(3);
         expect(newLruMap.get('a')).toBe(1);
         expect(newLruMap.get('b')).toBe(2);
         expect(newLruMap.get('c')).toBe(3);
      });

      it('should handle array larger than max size', () => {
         const entries: [string, number][] = [
            ['a', 1],
            ['b', 2],
            ['c', 3],
            ['d', 4],
         ];
         const newLruMap = LRUMap.fromArray(entries, 2);

         expect(newLruMap.maxSize).toBe(2);
         expect(newLruMap.size).toBe(2);
         // Should only contain the last 2 items due to LRU eviction
         expect(newLruMap.has('a')).toBe(false);
         expect(newLruMap.has('b')).toBe(false);
         expect(newLruMap.has('c')).toBe(true);
         expect(newLruMap.has('d')).toBe(true);
      });
   });

   describe('edge cases', () => {
      it('should handle single capacity', () => {
         const singleLru = new LRUMap<string, number>(1);

         singleLru.set('a', 1);
         expect(singleLru.get('a')).toBe(1);
         expect(singleLru.size).toBe(1);

         singleLru.set('b', 2);
         expect(singleLru.has('a')).toBe(false);
         expect(singleLru.get('b')).toBe(2);
         expect(singleLru.size).toBe(1);
      });

      it('should handle complex key types', () => {
         const objLru = new LRUMap<object, string>(3);
         const key1 = { id: 1 };
         const key2 = { id: 2 };

         objLru.set(key1, 'value1');
         objLru.set(key2, 'value2');

         expect(objLru.get(key1)).toBe('value1');
         expect(objLru.get(key2)).toBe('value2');
      });

      it('should maintain order after multiple operations', () => {
         lruMap.set('a', 1);
         lruMap.set('b', 2);
         lruMap.set('c', 3);

         // Access in different order
         lruMap.get('b');
         lruMap.get('a');

         // Add new item - should evict 'c' (oldest unaccessed)
         lruMap.set('d', 4);

         expect(lruMap.has('c')).toBe(false);
         expect(lruMap.has('b')).toBe(true);
         expect(lruMap.has('a')).toBe(true);
         expect(lruMap.has('d')).toBe(true);

         // Verify order: oldest to newest should be b, a, d
         expect(lruMap.getOldestKey()).toBe('b');
         expect(lruMap.getNewestKey()).toBe('d');
      });

      it('should handle rapid set/get operations', () => {
         // Rapidly set many items
         for (let i = 0; i < 10; i++) {
            lruMap.set(`key${i}`, i);
         }

         // Should only have the last 3
         expect(lruMap.size).toBe(3);
         expect(lruMap.has('key7')).toBe(true);
         expect(lruMap.has('key8')).toBe(true);
         expect(lruMap.has('key9')).toBe(true);
         expect(lruMap.has('key0')).toBe(false);
      });
   });

   describe('type safety', () => {
      it('should maintain type safety for different value types', () => {
         const stringLru = new LRUMap<string, string>(3);
         const numberLru = new LRUMap<number, object>(3);

         stringLru.set('key', 'value');
         numberLru.set(1, { data: 'test' });

         const stringValue = stringLru.get('key');
         const objectValue = numberLru.get(1);

         expect(typeof stringValue).toBe('string');
         expect(typeof objectValue).toBe('object');
      });
   });

   describe('subscribeRemove observer pattern', () => {
      it('should notify observers when items are evicted due to capacity', () => {
         const removedItems: Array<{ key: string; value: number }> = [];

         // Subscribe to remove events
         const unsubscribe = lruMap.subscribeRemove((key, value) => {
            removedItems.push({ key, value });
         });

         // Fill to capacity
         lruMap.set('a', 1);
         lruMap.set('b', 2);
         lruMap.set('c', 3);

         expect(removedItems).toHaveLength(0);

         // Add one more item to trigger eviction
         lruMap.set('d', 4);

         expect(removedItems).toHaveLength(1);
         expect(removedItems[0]).toEqual({ key: 'a', value: 1 });

         unsubscribe();
      });

      it('should notify multiple observers', () => {
         const removedItems1: Array<{ key: string; value: number }> = [];
         const removedItems2: Array<{ key: string; value: number }> = [];

         // Subscribe multiple observers
         const unsubscribe1 = lruMap.subscribeRemove((key, value) => {
            removedItems1.push({ key, value });
         });

         const unsubscribe2 = lruMap.subscribeRemove((key, value) => {
            removedItems2.push({ key, value });
         });

         // Fill to capacity and trigger eviction
         lruMap.set('a', 1);
         lruMap.set('b', 2);
         lruMap.set('c', 3);
         lruMap.set('d', 4); // Should evict 'a'

         expect(removedItems1).toHaveLength(1);
         expect(removedItems2).toHaveLength(1);
         expect(removedItems1[0]).toEqual({ key: 'a', value: 1 });
         expect(removedItems2[0]).toEqual({ key: 'a', value: 1 });

         unsubscribe1();
         unsubscribe2();
      });

      it('should not notify observers when manually deleting items', () => {
         const removedItems: Array<{ key: string; value: number }> = [];

         const unsubscribe = lruMap.subscribeRemove((key, value) => {
            removedItems.push({ key, value });
         });

         lruMap.set('a', 1);
         lruMap.set('b', 2);

         // Manual delete should not trigger observer
         lruMap.delete('a');

         expect(removedItems).toHaveLength(0);

         unsubscribe();
      });

      it('should not notify observers when clearing the map', () => {
         const removedItems: Array<{ key: string; value: number }> = [];

         const unsubscribe = lruMap.subscribeRemove((key, value) => {
            removedItems.push({ key, value });
         });

         lruMap.set('a', 1);
         lruMap.set('b', 2);

         // Clear should not trigger observer
         lruMap.clear();

         expect(removedItems).toHaveLength(0);

         unsubscribe();
      });

      it('should not notify observers when updating existing keys', () => {
         const removedItems: Array<{ key: string; value: number }> = [];

         const unsubscribe = lruMap.subscribeRemove((key, value) => {
            removedItems.push({ key, value });
         });

         lruMap.set('a', 1);
         lruMap.set('b', 2);
         lruMap.set('c', 3);

         // Update existing key should not trigger observer
         lruMap.set('b', 20);

         expect(removedItems).toHaveLength(0);

         unsubscribe();
      });

      it('should handle unsubscription correctly', () => {
         const removedItems: Array<{ key: string; value: number }> = [];

         const unsubscribe = lruMap.subscribeRemove((key, value) => {
            removedItems.push({ key, value });
         });

         // Fill to capacity
         lruMap.set('a', 1);
         lruMap.set('b', 2);
         lruMap.set('c', 3);

         // Unsubscribe before triggering eviction
         unsubscribe();

         // This eviction should not notify the observer
         lruMap.set('d', 4);

         expect(removedItems).toHaveLength(0);
      });

      it('should notify observers in correct order for multiple evictions', () => {
         const removedItems: Array<{ key: string; value: number }> = [];

         const unsubscribe = lruMap.subscribeRemove((key, value) => {
            removedItems.push({ key, value });
         });

         // Fill to capacity
         lruMap.set('a', 1);
         lruMap.set('b', 2);
         lruMap.set('c', 3);

         // Add multiple items to trigger multiple evictions
         lruMap.set('d', 4); // Should evict 'a'
         lruMap.set('e', 5); // Should evict 'b'

         expect(removedItems).toHaveLength(2);
         expect(removedItems[0]).toEqual({ key: 'a', value: 1 });
         expect(removedItems[1]).toEqual({ key: 'b', value: 2 });

         unsubscribe();
      });

      it('should handle observer errors gracefully', () => {
         const removedItems: Array<{ key: string; value: number }> = [];

         // Add normal observer first
         const unsubscribe2 = lruMap.subscribeRemove((key, value) => {
            removedItems.push({ key, value });
         });

         // Add observer that throws an error
         const unsubscribe1 = lruMap.subscribeRemove(() => {
            throw new Error('Observer error');
         });

         // Fill to capacity and trigger eviction
         lruMap.set('a', 1);
         lruMap.set('b', 2);
         lruMap.set('c', 3);

         // This should throw an error because one observer throws
         expect(() => {
            lruMap.set('d', 4);
         }).toThrow('Observer error');

         // The first observer should be called before the error occurs
         expect(removedItems).toHaveLength(1);
         expect(removedItems[0]).toEqual({ key: 'a', value: 1 });

         unsubscribe1();
         unsubscribe2();
      });

      it('should work with complex value types', () => {
         const complexLru = new LRUMap<string, { id: number; data: string }>(2);
         const removedItems: Array<{
            key: string;
            value: { id: number; data: string };
         }> = [];

         const unsubscribe = complexLru.subscribeRemove((key, value) => {
            removedItems.push({ key, value });
         });

         complexLru.set('obj1', { id: 1, data: 'first' });
         complexLru.set('obj2', { id: 2, data: 'second' });
         complexLru.set('obj3', { id: 3, data: 'third' }); // Should evict 'obj1'

         expect(removedItems).toHaveLength(1);
         expect(removedItems[0]).toEqual({
            key: 'obj1',
            value: { id: 1, data: 'first' },
         });

         unsubscribe();
      });
   });
});
