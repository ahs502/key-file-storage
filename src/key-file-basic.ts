import {
  outputJsonSync,
  statSync,
  readJsonSync,
  removeSync,
  outputJson,
  stat,
  readJson,
  remove,
  readdir,
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

  setAsync(key: string, value: any): Promise<any>;
  getAsync(key: string): Promise<any>;
  deleteAsync(key: string): Promise<boolean>;
  clearAsync(): Promise<boolean>;
  hasAsync(key: string): Promise<boolean>;

  querySync(collection: string): string[];
  queryAsync(collection: string): Promise<string[]>;
}

export default function keyFileBasic(kfsPath: string, cache: { [x: string]: any }): KeyFileBasic {
  kfsPath = kfsPath || __dirname; // Current working folder by default.
  kfsPath = String(kfsPath);
  if (!isValidPath(kfsPath)) {
    throw new Error('Invalid stroage path.');
  }

  return {
    // Synchronous
    setSync,
    getSync,
    deleteSync,
    clearSync,
    hasSync,

    // Asynchronous
    setAsync,
    getAsync,
    deleteAsync,
    clearAsync,
    hasAsync,

    // Iterate
    querySync,
    queryAsync,
  };

  function setSync(key: string, value: any) {
    if (value === undefined) return deleteSync(key);
    key = validizeKey(key);
    var file = join(kfsPath, key);
    outputJsonSync(file, value);
    return (cache[key] = value);
  }

  function getSync(key: string) {
    key = validizeKey(key);
    if (key in cache) return cache[key];
    var file = join(kfsPath, key);
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
    var file = join(kfsPath, key);
    removeSync(file);
    return delete cache[key];
  }

  function clearSync() {
    removeSync(kfsPath);
    return delete cache['*'];
  }

  function hasSync(key: string) {
    key = validizeKey(key);
    if (key in cache) return true;
    var file = join(kfsPath, key);
    try {
      var status = statSync(file);
      if (!status || !status.isFile()) return false;
    } catch (err) {
      return false;
    }
    return true;
  }

  function setAsync(key: string, value: any) {
    if (value === undefined) return deleteAsync(key);
    key = validizeKey(key);
    var file = join(kfsPath, key);
    return new Promise(function(resolve, reject) {
      outputJson(file, value, function(err) {
        if (err) return reject(err);
        resolve((cache[key] = value));
      });
    });
  }

  function getAsync(key: string) {
    key = validizeKey(key);
    if (key in cache) return Promise.resolve(cache[key]);
    var file = join(kfsPath, key);
    return new Promise(function(resolve, reject) {
      stat(file, function(err, status) {
        if (err || !status || !status.isFile()) return resolve((cache[key] = null));
        readJson(file, function(err, value) {
          if (err) return reject(err);
          resolve((cache[key] = value));
        });
      });
    });
  }

  function deleteAsync(key: string): Promise<boolean> {
    key = validizeKey(key);
    if (key === '*') return clearAsync();
    var file = join(kfsPath, key);
    return new Promise(function(resolve, reject) {
      remove(file, function(err) {
        if (err) return reject(err);
        resolve(delete cache[key]);
      });
    });
  }

  function clearAsync(): Promise<boolean> {
    return new Promise(function(resolve, reject) {
      remove(kfsPath, function(err) {
        if (err) return reject(err);
        resolve(delete cache['*']);
      });
    });
  }

  function hasAsync(key: string): Promise<boolean> {
    key = validizeKey(key);
    if (key in cache) return Promise.resolve(true);
    var file = join(kfsPath, key);
    return new Promise(function(resolve, reject) {
      stat(file, function(err, status) {
        resolve(!!(!err && status && status.isFile()));
      });
    });
  }

  function querySync(collection: string) {
    collection = validizeKey(collection);
    if (collection in cache) return cache[collection];
    try {
      const collectionPath = join(kfsPath, collection);
      var files = recurFs.readdir.sync(collectionPath, function(resource: any, status: { isFile: () => void }) {
        return status.isFile();
      });
      files = files.map((file: string) => validizeKey(relative(kfsPath, file)));
      return (cache[collection] = files || []);
    } catch (err) {
      return [];
    }
  }

  function queryAsync(collection: string): Promise<string[]> {
    collection = validizeKey(collection);
    if (collection in cache) return Promise.resolve(cache[collection]);

    return new Promise(function(resolve, reject) {
      //// This implementation does not work with empty folders:
      // recurFs.readdir(collection, function(resource, status, next) {
      //     next(status.isFile());
      // }, function(err, resources) {
      //     if (err) {
      //         reject(err);
      //     }
      //     else {
      //         resolve(resources.map(file => path.relative(kfsPath, file)));
      //     }
      // });

      var fileList: string[] = [],
        jobNumber = 1,
        terminated = false;

      const collectionPath = join(kfsPath, collection);
      stat(collectionPath, function(err, status) {
        if (err) {
          if (err.code === 'ENOENT') resolve((cache[collection] = []));
          else reject(err);
        } else {
          processFolder(collection);
        }
      });

      function processFolder(folder: string) {
        if (terminated) return;
      const folderPath = join(kfsPath, folder);
      readdir(folderPath, function(err, files) {
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
          files.forEach(function(file) {
            if (terminated) return;
            var filePath = join(folderPath, file);
            stat(filePath, function(err, status) {
              if (terminated) return;
              jobNumber--;
              if (err) {
                terminated = true;
                reject(err);
              }
              if (status.isFile()) {
                fileList.push(validizeKey(relative(kfsPath, filePath)));
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
