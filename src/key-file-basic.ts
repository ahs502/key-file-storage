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

export default function keyFileBasic(kfsPath: string, cache: { [x: string]: any }) {
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
    if (value === undefined) {
      return deleteSync(key);
    }
    key = validizeKey(key);
    var file = join(kfsPath, key);
    outputJsonSync(file, value);
    return (cache[key] = value);
  }

  function getSync(key: string) {
    key = validizeKey(key);
    if (key in cache) {
      return cache[key];
    }
    var file = join(kfsPath, key);
    try {
      var status = statSync(file);
      if (!status || !status.isFile()) {
        return (cache[key] = null);
      }
    } catch (err) {
      return (cache[key] = null);
    }
    return (cache[key] = readJsonSync(file));
  }

  function deleteSync(key: string) {
    key = validizeKey(key);
    if (key === '*') {
      return clearSync();
    }
    var file = join(kfsPath, key);
    removeSync(file);
    return delete cache[key];
  }

  function clearSync() {
    removeSync(kfsPath);
    if (cache.constructor === Object) {
      cache = {
        /*NEW-EMPTY-CACHE*/
      };
      return true;
    } else {
      return delete cache['*'];
    }
  }

  function hasSync(key: string) {
    key = validizeKey(key);
    if (key in cache) {
      return true;
    }
    var file = join(kfsPath, key);
    try {
      var status = statSync(file);
      if (!status || !status.isFile()) {
        return false;
      }
    } catch (err) {
      return false;
    }
    return true;
  }

  function setAsync(key: string, value: any) {
    if (value === undefined) {
      return deleteAsync(key);
    }
    key = validizeKey(key);
    var file = join(kfsPath, key);
    return new Promise(function(resolve, reject) {
      outputJson(file, value, function(err) {
        if (err) {
          reject(err);
        } else {
          resolve((cache[key] = value));
        }
      });
    });
  }

  function getAsync(key: string) {
    key = validizeKey(key);
    if (key in cache) {
      return Promise.resolve(cache[key]);
    } else {
      var file = join(kfsPath, key);
      return new Promise(function(resolve, reject) {
        stat(file, function(err, status) {
          if (err || !status || !status.isFile()) {
            resolve((cache[key] = null));
          } else {
            readJson(file, function(err, value) {
              if (err) {
                reject(err);
              } else {
                resolve((cache[key] = value));
              }
            });
          }
        });
      });
    }
  }

  function deleteAsync(key: string) {
    key = validizeKey(key);
    if (key === '*') {
      return clearAsync();
    }
    var file = join(kfsPath, key);
    return new Promise(function(resolve, reject) {
      remove(file, function(err) {
        if (err) {
          reject(err);
        } else {
          resolve(delete cache[key]);
        }
      });
    });
  }

  function clearAsync() {
    return new Promise(function(resolve, reject) {
      remove(kfsPath, function(err) {
        if (err) {
          reject(err);
        } else {
          if (cache.constructor === Object) {
            cache = {
              /*NEW-EMPTY-CACHE*/
            };
            resolve(true);
          } else {
            resolve(delete cache['*']);
          }
        }
      });
    });
  }

  function hasAsync(key: string) {
    key = validizeKey(key);
    if (key in cache) {
      return Promise.resolve(true);
    } else {
      var file = join(kfsPath, key);
      return new Promise(function(resolve, reject) {
        stat(file, function(err, status) {
          if (err || !status || !status.isFile()) {
            resolve(false);
          } else {
            resolve(true);
          }
        });
      });
    }
  }

  function querySync(collection: string) {
    collection = join(kfsPath, validizeKey(collection));
    if (collection in cache) return cache[collection];
    try {
      var files = recurFs.readdir.sync(collection, function(resource: any, status: { isFile: () => void }) {
        return status.isFile();
      });
      files = files.map((file: string) => relative(kfsPath, file));
      return (cache[collection] = files || []);
    } catch (err) {
      return [];
    }
  }

  function queryAsync(collection: string) {
    collection = join(kfsPath, validizeKey(collection));
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

      stat(collection, function(err, status) {
        if (err) {
          if (err.code === 'ENOENT') resolve((cache[collection] = []));
          else reject(err);
        } else {
          processFolder(collection);
        }
      });

      function processFolder(folder: string) {
        if (terminated) return;
        readdir(folder, function(err, files) {
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
            var filePath = join(folder, file);
            stat(filePath, function(err, status) {
              if (terminated) return;
              jobNumber--;
              if (err) {
                terminated = true;
                reject(err);
              }
              if (status.isFile()) {
                fileList.push(relative(kfsPath, filePath));
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
    key = String(key);
    if (key.indexOf('/..') >= 0 || key.indexOf('../') >= 0 || key === '..') {
      throw new Error('Invalid key name.');
    }
    return key;
  }
}
