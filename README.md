# key-file-storage

#### Simple key-value Node.js storage directly on file system, maps each key to JSON contents of a file.

No database and database overhead anymore, just plain file-system and simple files containing JSON data !
It's great for simple applications with small data.

## Installation

+ Installing package on Node.js :
```sh
$ npm install key-file-storage
```

## Initialization

+ Initializing key-file storage :
```javascript
var keyFileStorage = require("key-file-storage");

// To store files on disk
var kfs = keyFileStorage('/path/to/storage/directory', cacheConfig);

// To store files on disk (using unlimited cache)
var kfs = keyFileStorage('/path/to/storage/directory');

// To store values on memory (useful for test)
var kfs = keyFileStorage();
```

+ Cache configuration :

`cacheConfig` can be on of the following values :

1. `true` (_by default_) : Unlimited cache, anything will be cached on memory, good for small data volumes.
2. `false` : No cache, read the files from disk every time, good when other applications can modify the files' contents at anytime.
3. `n` (_An integer number_) : Limited cache, only the `n` latest referred key-values will be cached, good for large data volumes where only a fraction of data is being used frequently .

## Usage

+ Setting a new value to a key : (*Setting to* `undefined` *is equivalent to remove the key*)
```javascript
var value = ... // Any JSON-able object

// Callback form :
kfs.set('key', value, function(err) {
    if (err) { /*...*/ }
});

// Promise form :
kfs.set('key', value).then(function() {
    // Done!
}, function(err) {
    // Failed.
});

// Synchronized form (It may fail by throwing some exception) :
kfs.setSync('key', value);
```

+ Getting value of a key : (*Value of a not existing key will be* `null`)
```javascript
// Callback form :
kfs.get('key', function(err, value) {
    if (err) { /*...*/ }
    else { /* Do something with value ... */ }
});

// Promise form :
kfs.get('key').then(function(value) {
    // Done!
}, function(err) {
    // Failed.
});

// Synchronized form (It may fail by throwing some exception) :
var value = kfs.getSync('key');
```

+ Removing a key-file pair :
```javascript
// Callback form :
kfs.remove('key', function(err) {
    if (err) { /*...*/ }
});

// Promise form :
kfs.remove('key').then(function() {
    // Done!
}, function(err) {
    // Failed.
});

// Synchronized form (It may fail by throwing some exception) :
kfs.removeSync('key');
```

+ Clearing anything in the database folder :
```javascript
// Callback form :
kfs.clear(function(err) {
    if (err) { /*...*/ }
});

// Promise form :
kfs.clear().then(function() {
    // Done!
}, function(err) {
    // Failed.
});

// Synchronized form (It may fail by throwing some exception) :
kfs.clearSync();
```


## Notes

- **NOTE 1 :** `undefined` is not supported as a savable value, but `null` is. Saving a key with value `undefined` is equivalent to remove it.

- **NOTE 2 :** Each key will map to a separate file (*using the key itself as its relative path*) so there is no need to load all the database file for any key access. Also, keys can be relative paths, e.g: `data.json`, `/my/key/01` or `any/other/relative/path/to/a/file`.

- **NOTE 3 :** There is a built-in implemented **cache**, so accessing a certain key once again won't require file-system level operations.


## Contribute

The code is very simple and straightforward. It would be nice if you had any suggestions or contribution on it or detected any bug or issue.

+ See the code on [GitHub.com](https://github.com/ahs502/key-file-storage)
+ Contact me by [my gmail address](ahs502@gmail.com)  *(Hessam A Shokravi)*
