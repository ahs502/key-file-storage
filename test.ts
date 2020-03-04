import keyFileStorage from './index';

const kfs = keyFileStorage('../../data');
delete kfs['*'];

console.log("(kfs.a = 'a')   >>  ", (kfs.a = 'a'));
console.log('kfs.a, kfs.b    >>  ', kfs.a, kfs.b);
console.log("kfs['/']        >>  ", kfs['/']);
console.log("kfs['/']        >>  ", kfs['/']);
console.log("(kfs.b = 'b')   >>  ", (kfs.b = 'b'));
console.log("kfs['/']        >>  ", kfs['/']);
console.log("kfs['/']        >>  ", kfs['/']);
console.log('delete kfs.a    >>  ', delete kfs.a);
console.log("kfs['/']        >>  ", kfs['/']);
console.log("kfs['/']        >>  ", kfs['/']);

console.log('..............................................');

console.log(kfs['a/b/c/']);
console.log((kfs['a/b/c/x'] = 0));
console.log(kfs['a/b/c/']);
console.log((kfs['a/b/c/y'] = 0));
console.log((kfs['a/b/c/z'] = 0));
console.log(kfs['a/b/c/']);
console.log(kfs['a/b/c/']);
console.log(delete kfs['a/b/c/y']);
console.log(kfs['a/b/c/']);
console.log(kfs['a/b/c/']);

console.log('..............................................');

Promise.resolve()
    .then(x => kfs('qq/qqq', { data: 123 }))
    .then(x => kfs('qq/www', { data: 456 }))
    .then(x => kfs('qq/'))
    .then(x => console.log(x))