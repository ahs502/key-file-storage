var createStorageSyncDisk = require("./create-storage-sync-disk");
var createStorageSyncMemory = require("./create-storage-sync-memory");

module.exports = function createStorageSync(kvsPath, cache) {
    if (typeof kvsPath === 'string') { // Store on disk.
        return createStorageSyncDisk(kvsPath, cache);
    }
    else /* if (typeof kvsPath !== 'string') */ { // Store on memory.
        return createStorageSyncMemory(kvsPath, cache);
    }
};
