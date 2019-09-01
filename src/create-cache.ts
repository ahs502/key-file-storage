export interface KfsCache {
  [key: string]: any;
}

interface KfsCollectionCache {
  [collection: string]: string[];
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
    let collectionCache: KfsCollectionCache = {};

    return new Proxy<KfsCache>(
      {
        /*CACHE*/
      },
      {
        set: function(target, property, value, receiver) {
          const propertyName = String(property);
          if (propertyName.endsWith('/')) {
            collectionCache[propertyName] = value;
            return true;
          }
          target[propertyName] = value;
          Object.keys(collectionCache)
            .filter(collection => keyInCollection(propertyName, collection))
            .forEach(
              collection =>
                collectionCache[collection].includes(propertyName) || collectionCache[collection].push(propertyName),
            );
          return true;
        },

        get: function(target, property, receiver) {
          const propertyName = String(property);
          if (propertyName.endsWith('/')) return collectionCache[propertyName];
          return target[propertyName];
        },

        deleteProperty: function(target, property) {
          const propertyName = String(property);
          if (propertyName === '*') {
            collectionCache = {};
            Object.keys(target).forEach(key => delete target[key]);
            return true;
          }
          if (propertyName.endsWith('/')) return delete collectionCache[propertyName];
          Object.keys(collectionCache)
            .filter(collection => keyInCollection(propertyName, collection))
            .forEach(
              collection =>
                collectionCache[collection].includes(propertyName) &&
                collectionCache[collection].splice(collectionCache[collection].indexOf(propertyName), 1),
            );
          return delete target[propertyName];
        },

        has: function(target, property) {
          const propertyName = String(property);
          if (propertyName.endsWith('/')) return propertyName in collectionCache;
          return property in target;
        },
      },
    );
  }

  function createCache_NoCache(cacheConfig: false) {
    return new Proxy<KfsCache>(
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
    let collectionCache: KfsCollectionCache = {};
    let keyNumber = Math.ceil(cacheConfig),
      keys = Array(keyNumber),
      nextKeyIndex = 0,
      keyIndex: number;

    return new Proxy<KfsCache>(
      {
        /*CACHE*/
      },
      {
        set: function(target, property, value, receiver) {
          const propertyName = String(property);
          if (propertyName.endsWith('/')) {
            collectionCache[propertyName] = value;
            return true;
          }
          updateKeys(target, propertyName, 'SET');
          target[propertyName] = value;
          Object.keys(collectionCache)
            .filter(collection => keyInCollection(propertyName, collection))
            .forEach(
              collection =>
                collectionCache[collection].includes(propertyName) || collectionCache[collection].push(propertyName),
            );
          return true;
        },

        get: function(target, property, receiver) {
          const propertyName = String(property);
          if (propertyName.endsWith('/')) return collectionCache[propertyName];
          updateKeys(target, propertyName, 'GET');
          return target[propertyName];
        },

        deleteProperty: function(target, property) {
          const propertyName = String(property);
          if (propertyName === '*') {
            collectionCache = {};
            keys = Array(keyNumber);
            nextKeyIndex = 0;
            return true;
          }
          if (propertyName.endsWith('/')) return delete collectionCache[propertyName];
          Object.keys(collectionCache)
            .filter(collection => keyInCollection(propertyName, collection))
            .forEach(
              collection =>
                collectionCache[collection].includes(propertyName) &&
                collectionCache[collection].splice(collectionCache[collection].indexOf(propertyName), 1),
            );
          updateKeys(target, propertyName, 'DELETE');
          return delete target[propertyName];
        },

        has: function(target, property) {
          const propertyName = String(property);
          if (propertyName.endsWith('/')) return propertyName in collectionCache;
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

  function keyInCollection(key: string, collection: string): boolean {
    collection = collection.startsWith('./')
      ? collection.slice(1)
      : collection.startsWith('/')
      ? collection
      : '/' + collection;
    key = key.startsWith('./') ? key.slice(1) : key.startsWith('/') ? key : '/' + key;
    return key.startsWith(collection);
  }
}
