# key-file-storage

#### Simple key-value storage (a persistent data structure) directly on file system, maps each key to a separate file.

+ Simple *key-value* storage model
+ Very easy to learn and use
+ Both *Synchronous* and *Asynchronous* APIs
+ One *JSON* containing file per each key
+ Built-in configurable cache
+ Both *Promise* and *Callback* support

```ts
const kfs = require("key-file-storage")('my/storage/path')

// Write something to file 'my/storage/path/myfile'
kfs.myfile = { x: 123 }

// Read contents of file 'my/storage/path/myfile'
const x = kfs.myfile.x

// Delete file 'my/storage/path/myfile'
delete kfs.myfile
```

A nice alternative for any of these libraries: [node-persist](https://www.npmjs.com/package/node-persist), [configstore](https://www.npmjs.com/package/configstore), [flat-cache](https://www.npmjs.com/package/flat-cache), [conf](https://www.npmjs.com/package/conf), [simple-store](https://www.npmjs.com/package/simple-store), and more...

## Installation

Installing package on Node.js:
```sh
$ npm install key-file-storage
```

## Initialization

Initializing a key-file storage:
```ts
// ES Modules import style:
import kfs from 'key-file-storage'

// CommonJS import style:
const kfs = require("key-file-storage")

const store = kfs('/storage/directory/path', caching)
```

The value of `caching` can be

1. **`true`** (_By default, if not specified_) : Unlimited cache, anything will be cached on memory, good for small data volumes.

2. **`false`** : No cache, read the files from disk every time, good when other applications can modify the files' contents arbitrarily.

3. **`n`** (_An integer number_) : Limited cache, only the **`n`** latest referred key-values will be cached, good for large data volumes where only a fraction of data is being used frequently .

## Usage

### Synchronous API

As simple as native javascript objects:

```ts
store['key'] = value       // Write file
```
```ts
store['key']               // Read file
```
```ts
delete store['key']        // Delete file
```
```ts
delete store['*']          // Delete all storage files
```
```ts
'key' in store             // Check for file existence
                         //=> true or false
```

- You can use `store.keyName` instead of `store['keyName']` anywhere if the key name allows.

- `undefined` is not supported as a savable value, but `null` is. Saving a key with value `undefined` is equivalent to remove it. So, you can use `store['key'] = undefined` or even `store['*'] = undefined` to delete files.

- Synchronous API will throw an exception if any errors happen, so you shall handle it your way.

### Asynchronous API with Promises

Every one of the following calls **returns a promise**:

```ts
store('key', value)        // Write file
```
```ts
store('key')               // Read file
```
```ts
new store('key')           // Delete file
```
```ts
new store('*')  /* or */
new store()     /* or */
new store                  // Delete all storage files
```
```ts
('key' in store(), store())  // Check for file existence
                         // Resolves to true or false
```

- Once again, `undefined` is not supported as a savable value, but `null` is. Saving a key with value `undefined` is equivalent to remove it. So, you can use `store('key', undefined)` or even `store('*', undefined)` to delete files.

### Asynchronous API with Callbacks

The same as asynchronous with promises, but with callback function as the last input parameter of `store()` :

```ts
store('key', value, cb)   // Write file
```
```ts
store('key', cb)          // Read file
```
```ts
new store('key', cb)      // Delete file
```
```ts
new store('*', cb)   /* or */
new store(cb)             // Delete all storage files
```
```ts
'key' in store(cb)        // Check for file existence
                        // without promise output
                   /* or */
('key' in store(), store(cb))
                        // Check for file existence
                        // with promise output
```

- These calls *still* return a promise on their output (except for `'key' in store(callback)` form of existence check).

- The first input parameter of all callback functions is `err`, so you shall handle it within the callback. *Reading* and *Existence checking* callbacks provide the return values as their second input parameter.

### Folders as Collections

Every folder in the storage can be treated as a *collection* of *key-values*.

You can query the list of all containing keys (*filenames*) within a collection (*folder*) like this (_**Note** that a collection path must end with a **forward slash** `'/'`_):

#### Synchronous API

```ts
try {
    const keys = store['col/path/']
    // keys = ['col/path/key1', 'col/path/sub/key2', ... ]
} catch (error) {
    // handle error...
}
```

#### Asynchronous API with Promises

```ts
store('col/path/')
    .then(keys => {
        // keys = ['col/path/key1', 'col/path/sub/key2', ... ]
    })
    .catch(error => {
        // handle error...
    })
```

#### Asynchronous API with Callbacks

```ts
store('col/path/', (error, keys) => {
    if (error) {
        // handle error...
    }
    // keys = ['col/path/key1', 'col/path/sub/key2', ... ]
})
```

## Notes

- **NOTE 1 :** Each key will map to a separate file (*using the key itself as its relative path*). Therefore, keys may be relative paths, e.g: `'data.json'`, `'/my/key/01'` or `'any/other/relative/path/to/a/file'`. The only exception is strings including `'..'` (*double dot*) which will not be accepted for security reasons.

- **NOTE 2 :** You may have hidden key files by simply add a `'.'` before the filename in the key path.

- **NOTE 3 :** If a key's relative path ends with a *forward slash* `'/'`, it will be considered to be a collection (*folder*) name. So, `'data/set/'` is a collection and `'data/set/key'` is a key in that collection.

- **NOTE 4 :** This module has a built-in implemented **cache**, so, when activated, accessing a certain key more than once won't require file-system level operations again for that file.

- **NOTE 5 :** When activated, caching will include queries on *collections* too.

- **NOTE 6 :** For _TypeScript_ developers, you may indicate the store's value type when creating it: `const store = kfs<DataType>(...)`.

## Example

```ts
import kfs from "key-file-storage"

interface User {
    readonly name: string
    readonly skills: Readonly<Partial<Record<string, number>>>
}

// Locate 'db' folder in the current directory as the storage path,
// Require 100 latest accessed key-values to be cached:
const store = kfs<User>('./db', 100)

// Create file './db/users/hessam' containing this user data, synchronously: 
store['users/hessam'] = ({
    name: "Hessam",
    skills: {
        java: 10,
        csharp: 15
    }
})

// Read file './db/users/hessam' as a JSON object, asynchronously:
store('users/hessam').then(hessam => {
    console.log(`Hessam's java skill is ${hessam.skills.java}.`)
})

// Check whether file './db/users/mahdiar' exists or not, asynchronously:
'users/mahdiar' in store((error, exists) => {
    if (exists) {
        console.log("User Mahdiar exists!")
    }
})

// List all the keys in './db/users/', synchronously:
const allUsers = store['users/']
//=> ['users/hessam', 'users/mahdiar', ... ]
```

## Contribute

It would be very appreciated if you had any suggestions or contribution on this repository or submitted any issue.

+ See the code on [GitHub](https://github.com/ahs502/key-file-storage)
+ Contact me by [my gmail address](ahs502@gmail.com) *(Hessamoddin A Shokravi)*
