# key-file-storage

#### Simple key-value storage (a persistent data structure) directly on file system, maps each key to a separate file.

A very nice replacement for any of these node modules: [node-persist](https://www.npmjs.com/package/node-persist), [configstore](https://www.npmjs.com/package/configstore), [flat-cache](https://www.npmjs.com/package/flat-cache), [conf](https://www.npmjs.com/package/conf), [simple-store](https://www.npmjs.com/package/simple-store) and more...

+ Simple *key-value* storage model
+ Very easy to learn and use
+ Both *Synchronous* and *Asynchronous* APIs
+ One *JSON* containing file per each key
+ Built-in configurable cache
+ Both *Promise* and *Callback* support

```javascript
var kfs = require("key-file-storage")('my/storage/path');

// Write something to file 'my/storage/path/myfile'
kfs.myfile = { mydata: 123 };

// Read contents of file 'my/storage/path/myfile'
var mydata = kfs.myfile.mydata;

// Delete file 'my/storage/path/myfile'
delete kfs.myfile;
```

Just give it a try, you'll like it!

## Installation

Installing package on Node.js (*Node.js **6.0.0** or higher is required*) :
```sh
$ npm install key-file-storage
```

## Initialization

Initializing a key-file storage :
```javascript
var keyFileStorage = require("key-file-storage");

var kfs = keyFileStorage('/storage/directory/path', caching);
```

The value of `caching` can be

1. **`true`** (_By default, if not specified_) : Unlimited cache, anything will be cached on memory, good for small data volumes.

2. **`false`** : No cache, read the files from disk every time, good when other applications can modify the files' contents arbitrarily.

3. **`n`** (_An integer number_) : Limited cache, only the **`n`** latest referred key-values will be cached, good for large data volumes where only a fraction of data is being used frequently .

## Usage

### Synchronous API

As simple as native javascript objects :

```javascript
kfs['key'] = value       // Write file
```
```javascript
kfs['key']               // Read file
```
```javascript
delete kfs['key']        // Delete file
```
```javascript
delete kfs['*']          // Delete all storage files
```
```javascript
'key' in kfs             // Check for file existence
                         //=> true or false
```

- You can use `kfs.keyName` instead of `kfs['keyName']` anywhere if the key name allows.

- `undefined` is not supported as a savable value, but `null` is. Saving a key with value `undefined` is equivalent to remove it. So, you can use `kfs['key'] = undefined` or even `kfs['*'] = undefined` to delete files.

- Synchronous API will throw an exception if any errors happens, so you shall handle it your way.

### Asynchronous API with Promises

Every one of the following calls **returns a promise** :

```javascript
kfs('key', value)        // Write file
```
```javascript
kfs('key')               // Read file
```
```javascript
new kfs('key')           // Delete file
```
```javascript
new kfs('*')  /* or */
new kfs()     /* or */
new kfs                  // Delete all storage files
```
```javascript
('key' in kfs(), kfs())  // Check for file existence
                         // Resolves to true or false
```

- Once again, `undefined` is not supported as a savable value, but `null` is. Saving a key with value `undefined` is equivalent to remove it. So, you can use `kfs('key', undefined)` or even `kfs('*', undefined)` to delete files.

### Asynchronous API with Callbacks

The same as asynchronous with promises, but with callback function as the last input parameter of `kfs()` :

```javascript
kfs('key', value, cb)   // Write file
```
```javascript
kfs('key', cb)          // Read file
```
```javascript
new kfs('key', cb)      // Delete file
```
```javascript
new kfs('*', cb)   /* or */
new kfs(cb)             // Delete all storage files
```
```javascript
'key' in kfs(cb)        // Check for file existence
                        // without promise output
                   /* or */
('key' in kfs(), kfs(cb))
                        // Check for file existence
                        // with promise output
```

- These calls *still* return a promise on their output (except for `'key' in kfs(callback)` form of existence check).

- The first input parameter of all callback functions is `err`, so you shall handle it within the callback. *Reading* and *Existence checking* callbacks provide the return values as their second input parameter.

### Folders as Collections

Every folder in the storage can be treated as a *collection* of *key-values*.

You can query the list of all containing keys (*filenames*) within a collection (*folder*) like this (_**Note** that a collection path must end with a **forward slash** `'/'`_) :

#### Synchronous API

```javascript
var keys = kfs['col/path/']
// keys = ['col/path/key1', 'col/path/sub/key2', ... ]
```

#### Asynchronous API with Promises

```javascript
kfs('col/path/').then(function(keys) {
    // keys = ['col/path/key1', 'col/path/sub/key2', ... ]
});
```

#### Asynchronous API with Callbacks

```javascript
kfs('col/path/', function(error, keys) {
    // keys = ['col/path/key1', 'col/path/sub/key2', ... ]
});
```

## Notes

- **NOTE 1 :** Each key will map to a separate file (*using the key itself as its relative path*). Therefore, keys may be relative paths, e.g: `'data.json'`, `'/my/key/01'` or `'any/other/relative/path/to/a/file'`. The only exception is strings including `'..'` (*double dot*) which will not be accepted for security reasons.

- **NOTE 2 :** If a key's relative path ends with a *forward slash* `'/'`, it will be considered to be a collection (*folder*) name. So, `'data/set/'` is a collection and `'data/set/key'` is a key in that collection.

- **NOTE 3 :** This module has a built-in implemented **cache**, so, when activated, accessing a certain key more than once won't require file-system level operations again for that file.

## Example

```javascript
var keyFileStorage = require("key-file-storage");

// Locate 'db' folder in the current directory as the storage path,
// Require 100 latest accessed key-values to be cached:
var kfs = keyFileStorage('./db', 100);

// Create file './db/users/hessam' containing this user data, synchronously: 
kfs['users/hessam'] = {
    name: "Hessam",
    skills: { java: 10, csharp: 15 }
};

// Read file './db/users/hessam' as a JSON object, asynchronously:
kfs('users/hessam').then(function(hessamData) {
    console.log("Hessam's java skill is ",
        hessamData.skills.java);
});

// Check whether file './db/users/mahdiar' exists or not, asynchronously:
'users/mahdiar' in kfs(function(error, exists) {
    if(exists) {
        console.log("We have Mahdiar's data!");
    }
});

// List all the keys in './db/users/', synchronously:
var allUsers = kfs['users/'];
//=> ['users/hessam', 'users/mahdiar', ... ]
```

## Contribute

The code is simple! It would be appreciated if you had any suggestions or contribution on it or detected any bug or issue.

+ See the code on [GitHub.com (key-file-storage)](https://github.com/ahs502/key-file-storage)
+ Contact me by [my gmail address](ahs502@gmail.com)  *(Hessam A Shokravi)*
