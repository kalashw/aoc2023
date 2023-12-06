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
    const integerLower = Math.floor(lowerRoot + 1);

    const higherRoot = 0.5 * (time + Math.sqrt(time * time - 4 * distance));
    const integerHigher = Math.ceil(higherRoot - 1);

    return integerHigher - integerLower + 1;
};

const answer = _.zip(times, distances)
    .map(([time, distance]) => calculateWinners(time, distance))
    .reduce((val, product) => product * val, 1);

console.log('Part 1', answer);

const times2 = +times.join('');
const distance2 = +distances.join('');

console.log('Part 2', calculateWinners(times2, distance2));
