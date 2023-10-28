import {
  outputJson,
  outputJsonSync,
  readJson,
  readJsonSync,
  readdir,
  remove,
  removeSync,
  stat,
  statSync,
} from 'fs-extra';
import { join, relative } from 'path';

const isValidPath = require('is-valid-path');
const recurFs = require('recur-fs');

export interface KeyFileBasic {
  setSync(key: string, value: any): any;
  getSync(key: string): any;
  deleteSync(key: string): boolean;
  clearSync(): boolean;
  hasSync(key: string): boolean;
  querySync(collection: string): string[];

  setAsync(key: string, value: any): Promise<any>;
  getAsync(key: string): Promise<any>;
  deleteAsync(key: string): Promise<boolean>;
  clearAsync(): Promise<boolean>;
  hasAsync(key: string): Promise<boolean>;
  queryAsync(collection: string): Promise<string[]>;
}

export default function keyFileBasic(storagePath: string, cache: { [x: string]: any }): KeyFileBasic {
  storagePath = storagePath || __dirname; // Current working folder by default.
  storagePath = String(storagePath);
  if (!isValidPath(storagePath)) {
    throw new Error('Invalid stroage path.');
  }

  return {
    // Synchronous
    setSync,
    getSync,
    deleteSync,
    clearSync,
    hasSync,
    querySync,

    // Asynchronous
    setAsync,
    getAsync,
    deleteAsync,
    clearAsync,
    hasAsync,
    queryAsync,
  };

  function setSync(key: string, value: any) {
    if (value === undefined) return deleteSync(key);
    key = validizeKey(key);
    var file = join(storagePath, key);
    outputJsonSync(file, value, { spaces: 2 });
    return (cache[key] = value);
  }

  function getSync(key: string) {
    key = validizeKey(key);
    if (key in cache) return cache[key];
    var file = join(storagePath, key);
    try {
      var status = statSync(file);
      if (!status || !status.isFile()) return (cache[key] = null);
    } catch (err) {
      return (cache[key] = null);
    }
    return (cache[key] = readJsonSync(file));
  }

  function deleteSync(key: string) {
    key = validizeKey(key);
    if (key === '*') return clearSync();
    var file = join(storagePath, key);
    removeSync(file);
    return delete cache[key];
  }

  function clearSync() {
    removeSync(storagePath);
    return delete cache['*'];
  }

  function hasSync(key: string) {
    key = validizeKey(key);
    if (key in cache) return true;
    var file = join(storagePath, key);
    try {
      var status = statSync(file);
      if (!status || !status.isFile()) return false;
    } catch (err) {
      return false;
    }
    return true;
  }

  function querySync(collection: string) {
    collection = validizeKey(collection);
    if (collection in cache) return cache[collection];
    try {
      const collectionPath = join(storagePath, collection);
      var files = recurFs.readdir.sync(collectionPath, function (resource: any, status: { isFile: () => void }) {
        return status.isFile();
      });
      files = files.map((file: string) => validizeKey(relative(storagePath, file)));
      return (cache[collection] = files || []);
    } catch (err) {
      return [];
    }
  }

  function setAsync(key: string, value: any) {
    if (value === undefined) return deleteAsync(key);
    key = validizeKey(key);
    var file = join(storagePath, key);
    return new Promise(function (resolve, reject) {
      outputJson(file, value, { spaces: 2 }, function (err) {
        if (err) return reject(err);
        resolve((cache[key] = value));
      });
    });
  }

  function getAsync(key: string) {
    key = validizeKey(key);
    if (key in cache) return Promise.resolve(cache[key]);
    var file = join(storagePath, key);
    return new Promise(function (resolve, reject) {
      stat(file, function (err, status) {
        if (err || !status || !status.isFile()) return resolve((cache[key] = null));
        readJson(file, function (err, value) {
          if (err) return reject(err);
          resolve((cache[key] = value));
        });
      });
    });
  }

  function deleteAsync(key: string): Promise<boolean> {
    key = validizeKey(key);
    if (key === '*') return clearAsync();
    var file = join(storagePath, key);
    return new Promise(function (resolve, reject) {
      remove(file, function (err) {
        if (err) return reject(err);
        resolve(delete cache[key]);
      });
    });
  }

  function clearAsync(): Promise<boolean> {
    return new Promise(function (resolve, reject) {
      remove(storagePath, function (err) {
        if (err) return reject(err);
        resolve(delete cache['*']);
      });
    });
  }

  function hasAsync(key: string): Promise<boolean> {
    key = validizeKey(key);
    if (key in cache) return Promise.resolve(true);
    var file = join(storagePath, key);
    return new Promise(function (resolve, reject) {
      stat(file, function (err, status) {
        resolve(!!(!err && status && status.isFile()));
      });
    });
  }

  function queryAsync(collection: string): Promise<string[]> {
    collection = validizeKey(collection);
    if (collection in cache) return Promise.resolve(cache[collection]);

    return new Promise(function (resolve, reject) {
      //// This implementation does not work with empty folders:
      // recurFs.readdir(collection, function(resource, status, next) {
      //     next(status.isFile());
      // }, function(err, resources) {
      //     if (err) {
      //         reject(err);
      //     }
      //     else {
      //         resolve(resources.map(file => path.relative(storagePath, file)));
      //     }
      // });

      var fileList: string[] = [],
        jobNumber = 1,
        terminated = false;

      const collectionPath = join(storagePath, collection);
      stat(collectionPath, function (err, status) {
        if (err) {
          if (err.code === 'ENOENT') resolve((cache[collection] = []));
          else reject(err);
        } else {
          processFolder(collection);
        }
      });

      function processFolder(folder: string) {
        if (terminated) return;
        const folderPath = join(storagePath, folder);
        readdir(folderPath, function (err, files) {
          if (terminated) return;
          jobNumber--;
          if (err) {
            terminated = true;
            reject(err);
          }
          jobNumber += files.length;
          if (!jobNumber) {
            resolve((cache[collection] = fileList));
          }
          files.forEach(function (file) {
            if (terminated) return;
            var filePath = join(folderPath, file);
            stat(filePath, function (err, status) {
              if (terminated) return;
              jobNumber--;
              if (err) {
                terminated = true;
                reject(err);
              }
              if (status.isFile()) {
                fileList.push(validizeKey(relative(storagePath, filePath)));
              } else if (status.isDirectory()) {
                jobNumber++;
                processFolder(filePath);
              }
              if (!jobNumber) {
                resolve((cache[collection] = fileList));
              }
            });
          });
        });
      }
    });
  }

  ///////////////////////////////////////////////////

  function validizeKey(key: string) {
    key = String(key).replace(/\\/g, '/');
    if (key.includes('/..') || key.includes('../') || key === '..') throw new Error('Invalid key name.');
    return key;
  }
}
