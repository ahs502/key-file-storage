import keyFileStorage from './index';

const kfs = keyFileStorage('data');
console.log((kfs.a = 'a'));
console.log(kfs.a, kfs.b);
