const fs = require('fs');
const _ = require('lodash');

const text = fs.readFileSync('./input.txt').toString().split('\n');

const times = _.chain(text[0].substring(10).split(' '))
    .filter()
    .map(_.toNumber)
    .value();
const distances = _.chain(text[1].substring(10).split(' '))
    .filter()
    .map(_.toNumber)
    .value();

const calculateWinners = (time, distance) => {
    const lowerRoot = 0.5 * (time - Math.sqrt(time * time - 4 * distance));
    const integerLower = Math.ceil(lowerRoot) + (+_.isInteger(lowerRoot));
    const higherRoot = 0.5 * (time + Math.sqrt(time * time - 4 * distance));
    const integerHigher = Math.floor(higherRoot) - (+_.isInteger(higherRoot));
    return integerHigher - integerLower + 1;
};

const answer = _.chain(times.length)
    .times(i => calculateWinners(times[i], distances[i]))
    .reduce((val, product) => product * val, 1)
    .value();

console.log('Part 1', answer);

const times2 = +times.join('');

const distance2 = +distances.join('');

console.log('Part 2', calculateWinners(times2, distance2));
