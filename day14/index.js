const fs = require('fs');
const _ = require('lodash');

const lines = fs.readFileSync('./input.txt').toString().split('\n').map(line => line.split(''));

// part 1
const getLineWeight = line => {
    let lastPosition = -1;
    let sum = 0;
    line.forEach((elem, index) => {
        if (elem === 'O') {
            lastPosition += 1;
            sum += line.length - lastPosition;
        } else if (elem === '#') {
            lastPosition = index;
        }
    });
    return sum;
};
const rotateL = hash => hash[0].map((val, index) => hash.map(row => row[row.length - 1 - index]));
const rotateR = hash => hash[0].map((val, index) => hash.map(row => row[index]).reverse());

const answer = _.chain(rotateL(lines))
    .map(getLineWeight)
    .sum()
    .value();

console.log('Part 1:', answer);

// part 2

const calculateLine = line => {
    let lastPosition = -1;
    const result = Array(line.length);
    line.forEach((elem, index) => {
        if (elem === 'O') {
            lastPosition += 1;
            result[lastPosition] = 'O';
        } else if (elem === '#') {
            _.fill(result, '.', lastPosition + 1, index);
            result[index] = '#';
            lastPosition = index;
        } else if (lastPosition === -1) {
            result[index] = '.';
        }
    });
    _.fill(result, '.', lastPosition + 1, line.length);
    return result;
};

const cycleThroughHash = hash => {
    // north cycle
    const nResult = rotateR(hash).map(calculateLine);

    // west cycle
    const wResult = rotateR(nResult).map(calculateLine);

    // south cycle
    const sResult = rotateR(wResult).map(calculateLine);

    // east cycle
    return rotateR(sResult).map(calculateLine);
};

let hashToCycle = rotateL(rotateL(lines));
const resultWeights = {};

let dontStop = true;
let index = 0;
let cycleStart;
let cycleEnd;

while (dontStop) {
    const result = cycleThroughHash(hashToCycle);

    const answ = _.chain(result)
        .map((line, ind) => (ind + 1) * (line.join('').split('O').length - 1))
        .sum()
        .value();

    const stringHash = result.map(line => line.join('')).join('\n');

    if (resultWeights[stringHash]) {
        dontStop = false;
        cycleStart = resultWeights[stringHash].index;
        cycleEnd = index;
    } else {
        resultWeights[stringHash] = {
            index,
            answ,
        };
    }

    hashToCycle = result;
    index += 1;
}

const answerIndex = ((1000000000 - cycleStart - 1) % (cycleEnd - cycleStart)) + cycleStart;
const answer2 = _.find(
    resultWeights,
    { index: answerIndex },
).answ;

console.log('Part 2:', answer2);
