const fs = require('fs');
const _ = require('lodash');

const text = fs.readFileSync('./input.txt').toString().split('\n');

console.log(text);
console.log(_.reverse(Array.from(text)).toString());
