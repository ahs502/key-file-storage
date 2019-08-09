import createCache from './src/create-cache';
import createKfs, { KeyFileStorage } from './src/key-file-storage';

/**
 * Returns an instance of `key-file-storage` to access the file system.
 * @param path The root storage path on the file system:
 * * For example `'./the/path/to/data'`
 * @param caching The selected cache configuration:
 * * `true` *(By default)* for unlimited cache,
 * * `false` to disable caching,
 * * `n: number` to cache the latest **n** accessed keys.
 */
export default function keyFileStorage(path: string, caching?: number | boolean): KeyFileStorage {
  var cache = createCache(caching);
  var kfs = createKfs(path, cache);
  return kfs;
}
