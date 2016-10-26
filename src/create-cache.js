module.exports = createCache;

function createCache(cacheConfig) {

    if (cacheConfig === true || typeof cacheConfig === 'undefined') { // Unlimited cache by default
        return { /*CACHE*/ };
    }
    else if (cacheConfig === false) { // No cache
        return createCache_NoCache(cacheConfig);
    }
    else if (typeof cacheConfig === 'number' && cacheConfig > 0) { // Limited cache by the number of keys
        return createCache_LimitedByKeyCount(cacheConfig);
    }
    else {
        throw new Error('Invalid cache config.');
    }

}

function createCache_NoCache(cacheConfig) {

    return new Proxy({ /*CACHE*/ }, {

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
        }

    });

}

function createCache_LimitedByKeyCount(cacheConfig) {

    var keyNumber = Math.ceil(cacheConfig),
        keys = Array(keyNumber),
        nextKeyIndex = 0,
        keyIndex;

    return new Proxy({ /*CACHE*/ }, {

        set: function(target, property, value, receiver) {
            updateKeys(target, property, 'set');
            return target[property] = value;
        },

        get: function(target, property, receiver) {
            updateKeys(target, property, 'get');
            return target[property];
        },

        deleteProperty: function(target, property) {
            if (property === '*') {
                keys = Array(keyNumber);
                nextKeyIndex = 0;
                return true;
            }
            updateKeys(target, property, 'del');
            return delete target[property];
        },

        has: function(target, property) {
            return keys.indexOf(property) >= 0;
        }

    });

    function realIndex(i) {
        return (i + keyNumber) % keyNumber;
    }

    function updateKeys(target, property, mode) {
        keyIndex = keys.indexOf(property);
        if (keyIndex < 0) { // Does not exist
            (mode === 'set') && addKey();
        }
        else if (keyIndex === realIndex(nextKeyIndex - 1)) { // The latest key
            (mode === 'del') && removeKey();
        }
        else { // Otherwise
            removeKey();
            (mode === 'del') || addKey();
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
                if (keys[nextKeyIndex] !== undefined)
                    delete target[keys[nextKeyIndex]];
                keys[nextKeyIndex] = property;
            }
            nextKeyIndex = realIndex(nextKeyIndex + 1);
        }
    }

}
