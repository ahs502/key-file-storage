var fs = require("fs-extra");
var path = require("path");
var Q = require("q");



function keyFileStorage(kvsPath) {

    var storage = {},
        cache = {};

    if (kvsPath) {

        storage.save = function(key, value) {
            if (value === undefined) {
                return storage.delete(key);
            }
            var file = path.join(kvsPath, key),
                deferred = Q.defer();
            fs.outputJson(file, value, function(err) {
                if (err) {
                    deferred.reject(err);
                }
                else {
                    deferred.resolve();
                    cache[key] = value;
                }
            });
            return deferred.promise;
        };

        storage.load = function(key) {
            if (cache[key] !== undefined) {
                return Q.when(cache[key]);
            }
            else {
                var file = path.join(kvsPath, key),
                    deferred = Q.defer();
                fs.stat(file, function(err, stat) {
                    if (err || !stat || !stat.isFile()) {
                        cache[key] = null;
                        deferred.resolve(null);
                    }
                    else {
                        fs.readJson(file, function(err, value) {
                            if (err) {
                                deferred.reject(err);
                            }
                            else {
                                cache[key] = value;
                                deferred.resolve(value);
                            }
                        });
                    }
                });
                return deferred.promise;
            }
        };

        storage.delete = function(key) {
            var file = path.join(kvsPath, key),
                deferred = Q.defer();
            fs.remove(file, function(err) {
                if (err) { /*TODO?*/ }
                delete cache[key];
                deferred.resolve();
            });
            return deferred.promise;
        };

    }
    else {
        
        storage.save = function(key, value) {
            if (value === undefined) {
                return storage.delete(key);
            }
            return Q.when(cache[key] = value);
        };
        
        storage.load = function(key) {
            return Q.when((cache[key] === undefined) ? null : cache[key]);
        };
        
        storage.delete = function(key) {
            return Q.fcall(function() {
                delete cache[key];
            });
        };
        
    }

    return storage;

}









// var kfs = keyFileStorage( /*'./my/db'*/ );

// kfs.save('alpha', {
//     x: 23,
//     y: 'df'
// }).then(() => {
//     console.log('S alpha')
//     kfs.load('alpha').then(value => {
//         console.log('L alpha =', value)
//         kfs.delete('alpha').then(() => {
//             console.log('D alpha')
//             kfs.load('beta').then(value => {
//                 console.log('L beta =', value)
//             })
//         })
//     })
// })

// kfs.save('gamma/datakeys/01', ['asd', 678, 'fgh'])
//     .then(() => kfs.load('gamma/datakeys/01'))
//     .then(value => {
//         console.log('S, L gamma/datakeys/01 =', value)
//     })
//     .then(() => kfs.delete('gamma/datakeys/01'))
//     .then(function() {
//         console.log('D gamma/datakeys/01')
//     })



// setInterval(()=>{
//     Q.when()
// .then(()=>kfs.load('gamma/datakeys/01'))
// .then(value=>{
//     console.log('S, L gamma/datakeys/01 =',value)
// })
// },1000)


module.exports = keyFileStorage;
