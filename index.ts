import createCache from './src/create-cache';
import createStore, { KeyFileStorage } from './src/key-file-storage';

/**
 * Returns an instance of `key-file-storage` store to access the file system.
 * @param path The root storage path on the file system:
 * * For example `'./the/path/to/data'`
 * @param caching The selected cache configuration:
 * * `true` *(By default)* for unlimited cache,
 * * `false` to disable caching,
 * * `n: number` to cache the latest **n** accessed keys.
 */
function keyFileStorage<P = any>(path: string, caching?: number | boolean): KeyFileStorage<P> {
  var cache = createCache(caching);
  var store = createStore<P>(path, cache);
  return store;
}

export default keyFileStorage;
export { keyFileStorage };
