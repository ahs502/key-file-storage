import keyFileBasic from './key-file-basic';

export interface KeyFileStorage {
  [key: string]: any;
  [index: number]: any;

  <T, U = T>(key: string | number, value: T, callback?: (error: any) => U): Promise<U>;
  <T = any, U = T>(key: string | number, callback?: (error: any, value?: T) => U): Promise<U>;
  new <U = boolean>(key: string | number, callback?: (error: any) => U): Promise<U>;
  new <U = boolean>(callback?: (error: any) => U): Promise<U>;
  <U = boolean>(callback?: (error: any) => U): Promise<U>;
}

export default function createKfs(kfsPath: string, cache: { [x: string]: any }): KeyFileStorage {
  var kfb = keyFileBasic(kfsPath, cache);

  // The produced promise and callback function related to the latest async 'in' operator
  var hasAsyncHandler: any = null,
    hasAsyncPromise: Promise<unknown> | null = null;

  /* async has */
  var hasAsyncWrap = {
    has: function(target: any, property: string) {
      var promise = kfb.hasAsync(property);
      if (hasAsyncHandler) {
        callbackizePromise(promise, hasAsyncHandler);
        hasAsyncHandler = null;
      } else {
        hasAsyncPromise = promise;
      }
      return false; // No synchronous answer.
    },
  };

  var kfs = new Proxy(
    function() {
      var a1 = arguments[0],
        a2 = arguments[1],
        a3 = arguments[2];

      switch (arguments.length) {
        case 0:
          if (hasAsyncPromise) {
            a3 = hasAsyncPromise;
            hasAsyncPromise = null;
            return a3;
          } else {
            return new Proxy({}, hasAsyncWrap);
          }
        // break;

        case 1:
          if (typeof a1 === 'function') {
            if (hasAsyncPromise) {
              a3 = hasAsyncPromise;
              hasAsyncPromise = null;
              return callbackizePromise(a3, a1);
            } else {
              hasAsyncHandler = a1;
              return new Proxy({}, hasAsyncWrap);
            }
          } else if (String(a1).slice(-1) === '/') {
            /* async query pr */
            return kfb.queryAsync(String(a1));
          } else {
            /* async get pr */
            return kfb.getAsync(String(a1));
          }
        // break;

        case 2:
          if (typeof a2 === 'function') {
            if (String(a1).slice(-1) === '/') {
              /* async query cb */
              return callbackizePromise(kfb.queryAsync(String(a1)), a2);
            } else {
              /* async get cb */
              return callbackizePromise(kfb.getAsync(String(a1)), a2);
            }
          } else {
            /* async set pr */
            return kfb.setAsync(String(a1), a2);
          }
        // break;

        case 3:
          if (typeof a3 === 'function') {
            /* async set cb */
            return callbackizePromise(kfb.setAsync(String(a1), a2), a3);
          }
        // break;
      }

      throw new Error('Invalid input argument(s).');
    },
    {
      /* sync set */
      set: function(target, property, value, receiver) {
        kfb.setSync(String(property), value);
        return true;
      },

      get: function(target, property, receiver) {
        if (String(property).slice(-1) === '/') {
          /* sync query */
          return kfb.querySync(String(property));
        } else {
          /* sync get */
          return kfb.getSync(String(property));
        }
      },

      /* sync delete */
      deleteProperty: function(target, property) {
        return kfb.deleteSync(String(property));
      },

      /* sync has */
      has: function(target, property) {
        return kfb.hasSync(String(property));
      },

      /* async delete */
      construct: function(target, argumentsList, newTarget) {
        var a1 = argumentsList[0],
          a2 = argumentsList[1];

        switch (argumentsList.length) {
          case 0:
            return kfb.clearAsync();
          // break;

          case 1:
            if (typeof a1 === 'function') {
              return callbackizePromise(kfb.clearAsync(), a1);
            } else {
              return kfb.deleteAsync(String(a1));
            }
          // break;

          case 2:
            return callbackizePromise(kfb.deleteAsync(String(a1)), a2);
          // break;
        }

        throw new Error('Invalid input argument(s).');
      },
    },
  );

  return kfs as any;

  function callbackizePromise(promise: Promise<unknown>, callback: any) {
    if (typeof callback === 'function') {
      return promise.then(function(data) {
        return callback(undefined, data);
      }, callback);
    } else {
      return promise;
    }
  }
}
