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










var k = keyFileStorage('./mydb',100);

k.clear().then(function () {
    console.log('0001');
    return k.get('e/r/t').then(function     (ert) {
        e(ert,null,'0002');
        return k.set('f/g/h',12345);
    }).then(function () {
        return k.get('f/g/h');
    }).then(function (fgh) {
        e(fgh,12345,'0006');
    });
}).then(function () {
    return k.set('e/r/t',{x:3,y:4},function (ex,ert) {
    e(ert,{x:3,y:4},'0003');
    return ert;
    });
}).then(function (ert) {
    e(ert,{x:3,y:4},'0004');
}).then(function () {
    return k.get('e/r/t');
}).then(function (ert) {
        e(ert,{x:3,y:4},'0005');
        return k.remove('e/r/t',function (ex,ert) {
            e(ert,null,'0007');
        });
}).then(function () {
    return k.get('e/r/t');
}).then(function (ert) {
        e(ert,null,'0008');
        return k.clear();
}).then(function () {
    k.get('e/r/t',function (ex,ert) {
        e(ert,null,'0009');
    });
    k.get('f/g/h',function (ex,fgh) {
        e(fgh,null,'0010');
    });
});






var kfs=keyFileStorage();

kfs.clearSync();
e(kfs.getSync('a/b/c'), null, 'q0001');
kfs.get('z/x/c').then(function(zxc) {
    e(zxc, null, 'q0002');
});
e(kfs.setSync('a/b/c', true), true, 'q0003');
e(kfs.getSync('a/b/c'), true, 'q0004');
kfs.set('z/x/c', {
    b: kfs.getSync('a/b/c')
}, function(ex, zxc) {
    e(zxc, {
        b: true
    }, 'q0005');
    return zxc;
}).then(function(zxc) {
    return kfs.get('z/x/c', function(zxc2) {
        e(zxc, {
            b: kfs.getSync('a/b/c')
        }, 'q0006');
    }).then(function() {
        return kfs.remove('z/x/c');
    });
}).then(function(res) {
    e(res, null, 'q0007');
    e(kfs.getSync('z/x/c'), null, 'q0008');
    e(kfs.getSync('a/b/c'), true, 'q0009');
    return kfs.clear();
}).then(function() {
    e(kfs.getSync('z/x/c'), null, 'q0010');
    e(kfs.getSync('a/b/c'), null, 'q0011');
});








// kfs.setSync('aaa', 1);
// kfs.getSync('bbb');
// kfs.setSync('ccc', 1);
// kfs.getSync('bbb');
// kfs.setSync('aaa', 1);
// kfs.getSync('ddd');
// kfs.setSync('bbb', 1);
// kfs.getSync('eee');
// kfs.setSync('aaa', 1);
// kfs.getSync('ccc');



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
