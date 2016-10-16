var _ = require("lodash");

function e(x1, x2, method) { // expect to be equal
    if (!_.isEqual(x1, x2)) {
        console.log('ERROR. ', method || '');
        console.log(x1, ' <---> ', x2);
        throw new Error(method);
    }
    else {
        console.log('Passed! ', method);
    }
}

var keyFileStorage = require("./");

var kfs = keyFileStorage('./mydb');

kfs.clearSync();
e(kfs.getSync('a/b/c'), null, '0001');
kfs.get('z/x/c').then(function(zxc) {
    e(zxc, null, '0002');
});
e(kfs.setSync('a/b/c', true), true, '0003');
e(kfs.getSync('a/b/c'), true, '0004');
kfs.set('z/x/c', {
    b: kfs.getSync('a/b/c')
}, function(e, zxc) {
    e(zxc, {
        b: true
    }, '0005');
    return zxc;
}).then(function(zxc) {
    return kfs.get('z/x/c', function(zxc2) {
        e(zxc, {
            b: kfs.getSync('a/b/c')
        }, '0006');
    }).then(function() {
        return kfs.remove('z/x/c');
    });
}).then(function(res) {
    e(res, null, '0007');
    e(kfs.getSync('z/x/c'), null, '0008');
    e(kfs.getSync('a/b/c'), true, '0009');
    return kfs.clear();
}).then(function() {
    e(kfs.getSync('z/x/c'), null, '0010');
    e(kfs.getSync('a/b/c'), null, '0011');
});


kfs.setSync('aaa', 1);
kfs.getSync('bbb');
kfs.setSync('ccc', 1);
kfs.getSync('bbb');
kfs.setSync('aaa', 1);
kfs.getSync('ddd');
kfs.setSync('bbb', 1);
kfs.getSync('eee');
kfs.setSync('aaa', 1);
kfs.getSync('ccc');



// setTimeout(function() {
//     console.log(12345)
// },2000)


// var sto=setTimeout;
// (new Promise(function(res,rej){
//     sto(function(){
//         res(100)
//     },1000)
// })).then(function (x    ) {
//     console.log(x)
// });






var terminateCondition = false;
(function wait() {
    if (!terminateCondition) setTimeout(wait, 1000);
})();
