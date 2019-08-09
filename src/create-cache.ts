export interface KfsCache {
  [key: string]: any;
}

export default function createCache(cacheConfig?: number | boolean): KfsCache {
  if (cacheConfig === true || typeof cacheConfig === 'undefined') {
    // Unlimited cache by default
    return createCache_Unlimited(cacheConfig);
  } else if (cacheConfig === false) {
    // No cache
    return createCache_NoCache(cacheConfig);
  } else if (typeof cacheConfig === 'number' && cacheConfig > 0) {
    // Limited cache by the number of keys
    return createCache_LimitedByKeyCount(cacheConfig);
  } else {
    throw new Error('Invalid cache config.');
  }

  function createCache_Unlimited(cacheConfig: true | undefined) {
    return new Proxy(
      {
        /*CACHE*/
      },
      {
        set: function(target, property, value, receiver) {
          property in target || cleanUpCachedCollections(target, property);
          (target as any)[property] = value;
          return true;
        },

        get: function(target, property, receiver) {
          return (target as any)[property];
        },

        deleteProperty: function(target, property) {
          if (property === '*') {
            Object.keys(target).forEach(key => delete (target as any)[key]);
            return true;
          }
          property in target && cleanUpCachedCollections(target, property);
          return delete (target as any)[property];
        },

        has: function(target, property) {
          return property in target;
        },
      },
    );

    function cleanUpCachedCollections(target: any, property: string | number | symbol) {
      const path = String(property);
      if (path.slice(-1) === '/') return;
      const parts = path.split('/');
      const collections = parts.map((part, index) => parts.slice(0, index).join('/') + '/');
      collections.forEach(collection => delete target[collection]);
    }
  }

  function createCache_NoCache(cacheConfig: false) {
    return new Proxy(
      {
        /*CACHE*/
      },
      {
        set: function(target, property, value, receiver) {
          return true;
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
          if (!keys.includes(property)) {
            keys
              .filter(key => key === '/' || (key.slice(-1) === '/' && String(property).indexOf(key) === 0))
              .forEach(key => {
                updateKeys(target, key, 'DELETE');
                delete (target as any)[key];
              });
          }
          updateKeys(target, property, 'SET');
          (target as any)[property] = value;
          return true;
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
          if (keys.includes(property)) {
            keys
              .filter(key => key === '/' || (key.slice(-1) === '/' && String(property).indexOf(key) === 0))
              .forEach(key => {
                updateKeys(target, key, 'DELETE');
                delete (target as any)[key];
              });
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
