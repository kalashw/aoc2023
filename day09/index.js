const fs = require('fs');
const _ = require('lodash');
const binomial = require('binomial');

const lines = fs.readFileSync('./input.txt').toString().split('\n');

const parseLine = line => line.split(' ').map(i => +i);

const calculateNext = numbers => {
    const indexToiSign = index => (index % 2 === 0 ? 1 : -1);
    return _.chain(numbers)
        .map((num, ind) => indexToiSign(ind) * num * binomial.get(numbers.length, ind + 1))
        .sum()
        .value();
};

const answer = _.chain(lines)
    .map(parseLine)
    .map(line => line.reverse())
    .map(calculateNext)
    .sum()
    .value();

console.log('Part 1:', answer);

// part 2

const answer2 = _.chain(lines)
    .map(parseLine)
    .map(calculateNext)
    .sum()
    .value();

console.log('Part 2:', answer2);
