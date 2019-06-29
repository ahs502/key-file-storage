import createCache from './src/create-cache';
import createKfs from './src/key-file-storage';

export default function keyFileStorage(kfsPath: string, cacheConfig?: number | boolean) {
  var cache = createCache(cacheConfig);
  var kfs = createKfs(kfsPath, cache);
  return kfs;
}
