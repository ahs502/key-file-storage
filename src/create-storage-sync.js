var createStorageSyncDisk = require("./create-storage-sync-disk");
var createStorageSyncMemory = require("./create-storage-sync-memory");

module.exports = function createStorageSync(kfsPath, cache) {
    if (typeof kfsPath === 'string') { // Store on disk.
        return createStorageSyncDisk(kfsPath, cache);
    }
    else /* if (typeof kfsPath !== 'string') */ { // Store on memory.
        return createStorageSyncMemory(kfsPath, cache);
    }
};
