/////////////////////////////////////////////////////

require("colors");
var _ = require("lodash");

var e = expectedToBeEqual(_.isEqual);
var a = expectedToBeEqual(setEqual);

function expectedToBeEqual(isEqual) {
    return function(x1, x2, method) {
        if (!isEqual(x1, x2)) {
            console.log('ERROR. '.red.bold, (method || '').red);
            console.log((String(x1).bold + '  !=  ' + (String(x2).bold)).yellow);
            throw new Error(method);
        }
        else {
            console.log('Passed! '.green.bold, (method || '').green);
        }
    };
}

function setEqual(s1, s2) {
    s1 = s1 || [];
    s2 = s2 || [];
    var i;
    for (i = 0; i < s1.length; i++)
        if (s2.indexOf(s1[i]) < 0) return false;
    for (i = 0; i < s2.length; i++)
        if (s1.indexOf(s2[i]) < 0) return false;
    return true;
}

function mock(obj, method, wrap) {
    var f = obj[method];
    obj[method] = function(...args) {
        return wrap(f, ...args);
    };
}

var seeIndex = 0;

function see(obj, method, argNum) {
    mock(obj, method, function(fun, ...args) {
        console.log(' -> [' + String(++seeIndex + 100000).slice(-5).gray + '] Called ' + method.blue.bold + (argNum > 0 ? (' on ' + args.slice(0, argNum || 0).map(p => JSON.stringify(p).bold.cyan).join(', ')) : ''));
        return fun(...args);
    });
}

/////////////////////////////////////////////////////
/////////////////////////////////////////////////////
/////////////////////////////////////////////////////

var fs = require("fs-extra");

see(fs, 'outputJsonSync', 1);
see(fs, 'statSync', 1);
see(fs, 'readJsonSync', 1);
see(fs, 'removeSync', 1);
see(fs, 'outputJson', 1);
see(fs, 'stat', 1);
see(fs, 'readJson', 1);
see(fs, 'remove', 1);

var keyFileStorage = require("./"),
    kfs;

// testBasicAsyncPromise();
// testBasicAsyncHas();
// testBasicSync();
testBasicQuery();

/////////////////////////////////////////////////////

function testBasicAsyncPromise() {
    kfs = keyFileStorage('./db', 6);

    kfs('a')
        .then(a => e(a, null, '0001'), errorHandler)
        .then(() => kfs('a/b', 456), errorHandler)
        .then(ab => e(ab, 456, '0002'), errorHandler)
        .then(() => kfs('a/b'), errorHandler)
        .then(ab => e(ab, 456, '0003'), errorHandler)
        .then(() => new kfs('a/b'), errorHandler)
        .then(() => kfs('a/b'), errorHandler)
        .then(ab => e(ab, null, '0004'), errorHandler)
        .then(() => kfs('s', 67), errorHandler)
        .then(() => kfs('s'), errorHandler)
        .then(s => e(s, 67, '0005'), errorHandler)
        .then(() => kfs('s', undefined), errorHandler)
        .then(() => kfs('s'), errorHandler)
        .then(s => e(s, null, '0005ex'), errorHandler)
        .then(() => kfs('f/h/y', 'dfgafgsdfgsfdgfdsgsfdgsdf'), errorHandler)
        .then(() => kfs('w/4/e', null), errorHandler)
        .then(() => kfs('65', true), errorHandler)
        .then(() => kfs('_-_-_', 12345.67890), errorHandler)
        .then(() => kfs('f/h/y'), errorHandler)
        .then(x => e(x, 'dfgafgsdfgsfdgfdsgsfdgsdf', '0006'), errorHandler)
        .then(() => kfs('w/4/e'), errorHandler)
        .then(x => e(x, null, '0007'), errorHandler)
        .then(() => kfs(65), errorHandler)
        .then(x => e(x, true, '0008'), errorHandler)
        .then(() => kfs('_-_-_'), errorHandler)
        .then(x => e(x, 12345.67890, '0009'), errorHandler)
        .then(() => ('qwe' in kfs(), kfs()), errorHandler)
        .then(has => e(has, false, 'has001'), errorHandler)
        .then(() => ('_-_-_' in kfs(), kfs()), errorHandler)
        .then(has => e(has, true, 'has002'), errorHandler)
        .then(() => ('f/h/y' in kfs(), kfs()), errorHandler)
        .then(has => e(has, true, 'has003'), errorHandler)
        .then(() => new kfs(), errorHandler)
        .then(() => kfs('f/h/y'), errorHandler)
        .then(x => e(x, null, '0010'), errorHandler)
        .then(() => kfs('w/4/e'), errorHandler)
        .then(x => e(x, null, '0011'), errorHandler)
        .then(() => kfs(65), errorHandler)
        .then(x => e(x, null, '0012'), errorHandler)
        .then(() => kfs('_-_-_'), errorHandler)
        .then(x => e(x, null, '0013'), errorHandler)

    .then(() => terminateCondition = true, () => terminateCondition = true);

    function errorHandler(err) {
        console.log(String(err).res.inverse);
        return '';
    }
}

/////////////////////////////////////////////////////

function testBasicAsyncHas() {
    kfs = keyFileStorage('./db', 2);

    'a' in kfs(function(e, a) {
        'b' in kfs(function(e, a) {
            'c' in kfs(function(e, a) {
                'd' in kfs(function(e, a) {
                    'e' in kfs(function(e, a) {
                        'f' in kfs(function(e, a) {

                            'g' in kfs();
                            kfs(function(e, a) {
                                'h' in kfs();
                                kfs(function(e, a) {
                                    'i' in kfs();
                                    kfs(function(e, a) {

                                        'j' in kfs();
                                        kfs().then(function(a) {
                                            'k' in kfs();
                                            kfs().then(function(a) {
                                                'l' in kfs();
                                                kfs().then(function(a) {

                                                    'm' in kfs(function(e, a) {
                                                        ('n' in kfs(), kfs()).then(function(a) {
                                                            'o' in kfs();
                                                            kfs(function(e, a) {
                                                                'p' in kfs();
                                                                kfs().then(function(a) {

                                                                    console.log(terminateCondition = true);

                                                                });
                                                            });
                                                        });
                                                    });

                                                });
                                            });
                                        });

                                    });
                                });
                            });

                        });
                    });
                });
            });
        });
    });

    function errorHandler(err) {
        console.log(String(err).res.inverse);
        return '';
    }
}

/////////////////////////////////////////////////////

function testBasicSync() {
    kfs = keyFileStorage('./db');

    e(kfs.a = 65, kfs.a, '0001');
    e(kfs.a, 65, '0002');
    e(kfs.b, null, '0003');
    e(kfs['c/v/x'] = {
        a: 4,
        b: 'qwerty'
    }, kfs['c/v/x'], '0004');
    e('c/v/x' in kfs, true, '0005');
    e('a' in kfs, true, '0006');
    e(delete kfs.a, true, '0007');
    e('a' in kfs, false, '0008');
    e(delete kfs['c/v/x'], true, '0009');
    e('c/v/x' in kfs, false, '0010');
    kfs.z1 = 1;
    kfs.z2 = 2;
    kfs.z3 = 3;
    kfs.z4 = 4;
    kfs.y1 = kfs.z1;
    kfs.z5 = 5;
    kfs.z6 = 6;
    kfs.z7 = 7;
    e(kfs.z1, 1, '0011');
    e(kfs.z2, 2, '0012');
    e(kfs.z3, 3, '0013');
    e(kfs.z4, 4, '0014');
    e(kfs.z5, 5, '0015');
    e(kfs.z6, 6, '0016');
    e(kfs.z7, 7, '0017');
    e(kfs.y1, kfs.z1, '0018');
    delete kfs['*'];
    e(kfs.z1, null, '0019');
    e(kfs.z2, null, '0020');
    e(kfs.z3, null, '0021');
    e(kfs.z4, null, '0022');
    e(kfs.z5, null, '0023');
    e(kfs.z6, null, '0024');
    e(kfs.z7, null, '0025');
    e(kfs.y1, null, '0026');

    terminateCondition = true;
}

/////////////////////////////////////////////////////

function testBasicQuery() {
    kfs = keyFileStorage('./db', false);

    kfs['asd0'] = kfs['adf'] = kfs['asdh'] = kfs['asd.zxc'] =
        kfs['qwe.zxc'] = kfs['asd.xcv'] = kfs['qwe.asd'] =
        kfs['asd/tyu'] = kfs['asd/tyu2'] = kfs['asd/wer/1'] =
        kfs['asd/wer/2'] = kfs['asd/wer5'] = kfs['asd/wer/5/1'] =
        kfs['z.z'] = kfs['z.'] = kfs['.z'] = kfs['z.z.z'] = kfs['z/.z'] =
        kfs['z/z.'] = kfs['z/z.z'] = kfs['z/z/.z'] = kfs['z/z/z.'] = kfs['z/z/z.z'] =
        true;

    a(kfs['/'], ['.z', 'adf', 'asd/tyu', 'asd/tyu2', 'asd/wer/1', 'asd/wer/2', 'asd/wer/5/1', 'asd/wer5', 'asd.xcv', 'asd.zxc', 'asd0', 'asdh', 'qwe.asd', 'qwe.zxc', 'z/.z', 'z/z/.z', 'z/z/z.', 'z/z/z.z', 'z/z.', 'z/z.z', 'z.', 'z.z', 'z.z.z'], '0001');
    a(kfs['rfv/'], [], '0002');
    a(kfs['z/'], ['z/.z', 'z/z.', 'z/z.z', 'z/z/.z', 'z/z/z.', 'z/z/z.z'], '0003');
    a(kfs['asd/wer/5/'], ['asd/wer/5/1'], '0004');

    kfs('/')
        .then(keys => a(keys, ['.z', 'adf', 'asd/tyu', 'asd/tyu2', 'asd/wer/1', 'asd/wer/2', 'asd/wer/5/1', 'asd/wer5', 'asd.xcv', 'asd.zxc', 'asd0', 'asdh', 'qwe.asd', 'qwe.zxc', 'z/.z', 'z/z/.z', 'z/z/z.', 'z/z/z.z', 'z/z.', 'z/z.z', 'z.', 'z.z', 'z.z.z'], '0010'))
        .then(() => kfs('rfv/' /*,keys=>a(keys,[],'0011')*/ ))
        .then(keys => a(keys, [], '0011'))
        .then(() => kfs('z/', function(err, keys) {
            if (err) return Promise.reject(err);
            a(keys, ['z/.z', 'z/z.', 'z/z.z', 'z/z/.z', 'z/z/z.', 'z/z/z.z'], '0012');
        }))
        .then(() => kfs('asd/wer/5/', function(err, keys) {
            if (err) return Promise.reject(err);
            a(keys, ['asd/wer/5/1'], '0013');
        }))
        .then(() => new kfs)

    .then(() => terminateCondition = true, () => terminateCondition = true);
}

/////////////////////////////////////////////////////
/////////////////////////////////////////////////////
/////////////////////////////////////////////////////

var terminateCondition;
(function wait() {
    if (!terminateCondition) setTimeout(wait, 1000);
})();

/////////////////////////////////////////////////////
