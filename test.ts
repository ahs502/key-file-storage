import keyFileStorage from '.';

const kfs = keyFileStorage('data');
kfs.a = 'a';
console.log(kfs.a, kfs.b);
