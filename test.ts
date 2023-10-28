import kfs from './index';

const store = kfs('../data');
delete store['*'];

console.log('..............................................');

console.log("(store.a = 'a')   >>  ", (store.a = 'a'));
console.log('store.a, store.b    >>  ', store.a, store.b);
console.log("store['/']        >>  ", store['/']);
console.log("store['/']        >>  ", store['/']);
console.log("(store.b = 'b')   >>  ", (store.b = 'b'));
console.log("store['/']        >>  ", store['/']);
console.log("store['/']        >>  ", store['/']);
console.log('delete store.a    >>  ', delete store.a);
console.log("store['/']        >>  ", store['/']);
console.log("store['/']        >>  ", store['/']);

console.log('..............................................');

console.log(store['a/b/c/']);
console.log((store['a/b/c/x'] = 0));
console.log(store['a/b/c/']);
console.log((store['a/b/c/y'] = 0));
console.log((store['a/b/c/z'] = 0));
console.log(store['a/b/c/']);
console.log(store['a/b/c/']);
console.log(delete store['a/b/c/y']);
console.log(store['a/b/c/']);
console.log(store['a/b/c/']);

console.log('..............................................');

Promise.resolve()
  .then((x) => store('qq/qqq', { data: 123 }))
  .then((x) => store('qq/www', { data: 456 }))
  .then((x) => store('qq/'))
  .then((x) => console.log(x));
