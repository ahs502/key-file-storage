var createStoragePromiseDisk = require("./create-storage-promise-disk");
var createStoragePromiseMemory = require("./create-storage-promise-memory");

module.exports = function createStoragePromise(kfsPath, cache) {
    if (typeof kfsPath === 'string') { // Store on disk.
        return createStoragePromiseDisk(kfsPath, cache);
    }
    else /* if (typeof kfsPath !== 'string') */ { // Store on memory.
        return createStoragePromiseMemory(kfsPath, cache);
    }
};
