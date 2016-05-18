# key-file-storage
Simple key-value Node.js storage directly on file system, maps each key to JSON contents of a file.

### I'll soon make a detailed readme for this module, but for now I just show you some examples :

```
var keyFileStorage = require("key-file-storage");

// To store files on disk
var kfs = keyFileStorage('/path/to/storage/directory');

// To store values on memory (useful for test)
var kfs = keyFileStorage();

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