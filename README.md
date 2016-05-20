# key-file-storage
Simple key-value Node.js storage directly on file system, maps each key to JSON contents of a file.

#### I'll soon make a detailed readme for this module, but for now I just show you some examples :

+ Initializing key-file storage :
```javascript
var keyFileStorage = require("key-file-storage");

// To store files on disk
var kfs = keyFileStorage('/path/to/storage/directory');

// To store values on memory (useful for test)
var kfs = keyFileStorage();
```

+ Setting a new value to a key :
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
```

+ Getting value of a key : (*Value of a not existing key will be* `null`)
```javascript
// Callback form :
kfs.get('key', function(err, value) {
    if (err) { /*...*/ }
    else { /* Do something with value ... */ }
});

// Promise form :
kfs.set('key').then(function(value) {
    // Done!
}, function(err) {
    // Failed.
});
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
```

NOTE: `undefined` is not supported as a savable value, but `null` is. Saving a key with value `undefined` is equivalent to remove it.

NOTE: Each key will map to a separate file (*using the key itself as its relative path*) so there is no need to load all the database file for any key access. Also, keys can be relative paths, e.g: `data.json`, `/my/key/01` or `any/other/relative/path/to/a/file`.

NOTE: There is a built-in implemented **cache**, so accessing a certain key once again won't require file-system level operations.