const fs = require('fs');
const _ = require('lodash')

const json = JSON.parse(fs.readFileSync("./input.json").toString());
const text = fs.readFileSync("./input.txt").toString();


console.log(json);
console.log(text);