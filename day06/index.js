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

const countWaitTimesToWin = (time, distance) => {
    const lowerRoot = 0.5 * (time - Math.sqrt(time * time - 4 * distance));
    const lowestWaitTimeToWin = Math.floor(lowerRoot + 1);

    const higherRoot = 0.5 * (time + Math.sqrt(time * time - 4 * distance));
    const highestWaitTimeToWin = Math.ceil(higherRoot - 1);

    return highestWaitTimeToWin - lowestWaitTimeToWin + 1;
};

const answer = _.zip(times, distances)
    .map(([time, distance]) => countWaitTimesToWin(time, distance))
    .reduce((val, product) => product * val, 1);

console.log('Part 1', answer);

const times2 = +times.join('');
const distance2 = +distances.join('');

console.log('Part 2', countWaitTimesToWin(times2, distance2));
