var createStoragePromiseDisk = require("./create-storage-promise-disk");
var createStoragePromiseMemory = require("./create-storage-promise-memory");

module.exports = function createStoragePromise(kvsPath, cache) {
    if (typeof kvsPath === 'string') { // Store on disk.
        return createStoragePromiseDisk(kvsPath, cache);
    }
    else /* if (typeof kvsPath !== 'string') */ { // Store on memory.
        return createStoragePromiseMemory(kvsPath, cache);
    }
};
