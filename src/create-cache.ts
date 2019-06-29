export default function createCache(cacheConfig?: number | boolean) {
  if (cacheConfig === true || typeof cacheConfig === 'undefined') {
    // Unlimited cache by default
    return {
      /*CACHE*/
    };
  } else if (cacheConfig === false) {
    // No cache
    return createCache_NoCache(cacheConfig);
  } else if (typeof cacheConfig === 'number' && cacheConfig > 0) {
    // Limited cache by the number of keys
    return createCache_LimitedByKeyCount(cacheConfig);
  } else {
    throw new Error('Invalid cache config.');
  }

  function createCache_NoCache(cacheConfig: false) {
    return new Proxy(
      {
        /*CACHE*/
      },
      {
        set: function(target, property, value, receiver) {
          return value;
        },

        get: function(target, property, receiver) {
          return undefined;
        },

        deleteProperty: function(target, property) {
          return true;
        },

        has: function(target, property) {
          return false;
        },
      },
    );
  }

  function createCache_LimitedByKeyCount(cacheConfig: number) {
    let keyNumber = Math.ceil(cacheConfig),
      keys = Array(keyNumber),
      nextKeyIndex = 0,
      keyIndex: number;

    return new Proxy(
      {
        /*CACHE*/
      },
      {
        set: function(target, property, value, receiver) {
          updateKeys(target, property, 'SET');
          return ((target as any)[property] = value);
        },

        get: function(target, property, receiver) {
          updateKeys(target, property, 'GET');
          return (target as any)[property];
        },

        deleteProperty: function(target, property) {
          if (property === '*') {
            keys = Array(keyNumber);
            nextKeyIndex = 0;
            return true;
          }
          updateKeys(target, property, 'DELETE');
          return delete (target as any)[property];
        },

        has: function(target, property) {
          return keys.indexOf(property) >= 0;
        },
      },
    );

    function realIndex(i: number) {
      return (i + keyNumber) % keyNumber;
    }

    function updateKeys(
      target: { [x: string]: any },
      property: string | number | symbol,
      mode: 'SET' | 'GET' | 'DELETE',
    ) {
      keyIndex = keys.indexOf(property);
      if (keyIndex < 0) {
        // Does not exist
        mode === 'SET' && addKey();
      } else if (keyIndex === realIndex(nextKeyIndex - 1)) {
        // The latest key
        mode === 'DELETE' && removeKey();
      } else {
        // Otherwise
        removeKey();
        mode === 'DELETE' || addKey();
      }

      function removeKey() {
        while (keyIndex !== nextKeyIndex && keys[keyIndex]) {
          keys[keyIndex] = keys[realIndex(keyIndex - 1)];
          keyIndex = realIndex(keyIndex - 1);
        }
        keys[nextKeyIndex] = undefined;
      }

      function addKey() {
        if (keys[nextKeyIndex] !== property) {
          if (keys[nextKeyIndex] !== undefined) delete target[keys[nextKeyIndex]];
          keys[nextKeyIndex] = property;
        }
        nextKeyIndex = realIndex(nextKeyIndex + 1);
      }
    }
  }
}
