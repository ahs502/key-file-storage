# key-file-storage

#### Simple key-value storage directly on file system, maps each key to a separate file.

No database and database overhead anymore, just plain file-system and simple files containing JSON data!
It's great for applications with small and medium data sizes.

+ Simple *key-value* storage model
+ Very easy to learn and use
+ Both *Synchronous* and *Asynchronous* API
+ One JSON containing file per each key
+ Built-in configurable cache
+ Both *Promise* and *Callback* support

Just give it a try, you'll like it!

## Installation

Installing package on Node.js (*Node.js 6.0.0 or higher is required*) :
```sh
$ npm install key-file-storage
```

## Initialization

Initializing key-file storage :
```javascript
var keyFileStorage = require("key-file-storage");

// Using an unlimited cache
var kfs = keyFileStorage('/path/to/storage/directory');

// or

// Using a custom cache
var kfs = keyFileStorage('/path/to/storage/directory', cacheConfig);
```

The value of `cacheConfig` can be

1. `true` (_By default_) : Unlimited cache, anything will be cached on memory, good for small data volumes.
2. `false` : No cache, read the files from disk every time, good when other applications can modify the files' contents arbitrarily.
3. `n` (_An integer number_) : Limited cache, only the `n` latest referred key-values will be cached, good for large data volumes where only a fraction of data is being used frequently .

## Usage

### Synchronous API

As simple as native javascript objects :

```javascript
// Set
kfs['key'] = value;

// Get
kfs['key'];

// Delete
delete kfs['key'];

// Check for existence
'key' in kfs    // true or false

// Clear all database
delete kfs['*'];
```

- You can use `kfs.keyName` instead of `kfs['keyName']` anywhere if the key name allows.

- `undefined` is not supported as a savable value, but `null` is. Saving a key with value `undefined` is equivalent to remove it. So, you can use `kfs['key'] = undefined` or even `kfs['*'] = undefined` to delete data.

- Synchronous API will throw an exception if any errors happens, so you shall handle it your way.

### Asynchronous API with Promises

Every one of the following calls returns a promise :

```javascript
// Set
kfs('key', value);

// Get
kfs('key');

// Delete
new kfs('key');

// Check for existence
('key' in kfs(), kfs())    // resolves to true or false

// Clear all database
new kfs('*');  /* or */  new kfs();
```

- Once again, `undefined` is not supported as a savable value, but `null` is. Saving a key with value `undefined` is equivalent to remove it. So, you can use `kfs('key', undefined)` or even `kfs('*', undefined)` to delete data.

### Asynchronous API with Callbacks

The same as asynchronous with promises, but with callback function as the last input value of `kfs()` :

```javascript
// Set
kfs('key', value, callback);

// Get
kfs('key', callback);

// Delete
new kfs('key', callback);

// Check for existence
'key' in kfs(callback)             // No promise returns anymore
/* or */
('key' in kfs(), kfs(callback))    // resolves to true or false

// Clear all database
new kfs('*', callback);  /* or */  new kfs(callback);
```

- These calls *still* return a promise on their output (except for `'key' in kfs(callback)` form of existence check).

- The first input parameter of all callback functions is `err`, so you shall handle it within the callback. *Set*, *Get* and *Existence check* callbacks provide the return values as their second input parameter.

## Notes

- **NOTE 1 :** Each key will map to a separate file (*using the key itself as its relative path*) so there is no need to load all the database file for any key access. Also, keys can be relative paths, e.g: `data.json`, `/my/key/01` or `any/other/relative/path/to/a/file`.

- **NOTE 2 :** There is a built-in implemented **cache**, so accessing a certain key more than once won't require file-system level operations (off course with some active cache).


## Contribute

The code is very simple and straightforward. It would be nice if you had any suggestions or contribution on it or detected any bug or issue.

+ See the code on [GitHub.com](https://github.com/ahs502/key-file-storage)
+ Contact me by [my gmail address](ahs502@gmail.com)  *(Hessam A Shokravi)*
