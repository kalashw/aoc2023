const fs = require('fs');
const _ = require('lodash'); //

const lines = fs.readFileSync('./input.txt').toString().split('\n');

const isNumber = a => ((a >= '0') && a <= '9');
const isStar = a => a === '*';

const checkTopLeft = (lineIndex, symbolIndex) => lineIndex !== 0
    && symbolIndex !== 0
    && isStar(lines[lineIndex - 1][symbolIndex - 1]);

const checkTop = (lineIndex, symbolIndex) => lineIndex !== 0
    && isStar(lines[lineIndex - 1][symbolIndex]);

const checkTopRight = (lineIndex, symbolIndex) => lineIndex !== 0
    && symbolIndex !== lines[lineIndex].length - 1
    && isStar(lines[lineIndex - 1][symbolIndex + 1]);

const checkLeft = (lineIndex, symbolIndex) => symbolIndex !== 0
    && isStar(lines[lineIndex][symbolIndex - 1]);

const checkRight = (lineIndex, symbolIndex) => symbolIndex !== lines[lineIndex].length - 1
    && isStar(lines[lineIndex][symbolIndex + 1]);

const checkBottomLeft = (lineIndex, symbolIndex) => lineIndex !== lines.length - 1
    && symbolIndex !== 0
    && isStar(lines[lineIndex + 1][symbolIndex - 1]);

const checkBottom = (lineIndex, symbolIndex) => lineIndex !== lines.length - 1
    && isStar(lines[lineIndex + 1][symbolIndex]);

const checkBottomRight = (lineIndex, symbolIndex) => lineIndex !== lines.length - 1
    && symbolIndex !== lines[lineIndex].length - 1
    && isStar(lines[lineIndex + 1][symbolIndex + 1]);

const isTouchedByStar = (lineIndex, symbolIndex) => {
    const stars = [];
    if (checkTopLeft(lineIndex, symbolIndex)) stars.push([lineIndex - 1, symbolIndex - 1]);
    if (checkTop(lineIndex, symbolIndex)) stars.push([lineIndex - 1, symbolIndex]);
    if (checkTopRight(lineIndex, symbolIndex)) stars.push([lineIndex - 1, symbolIndex + 1]);
    if (checkLeft(lineIndex, symbolIndex)) stars.push([lineIndex, symbolIndex - 1]);
    if (checkRight(lineIndex, symbolIndex)) stars.push([lineIndex, symbolIndex + 1]);
    if (checkBottomLeft(lineIndex, symbolIndex)) stars.push([lineIndex + 1, symbolIndex - 1]);
    if (checkBottom(lineIndex, symbolIndex)) stars.push([lineIndex + 1, symbolIndex]);
    if (checkBottomRight(lineIndex, symbolIndex)) stars.push([lineIndex + 1, symbolIndex + 1]);

    return stars;
};

const touchedStars = {};

const parseTouchedStars = (stars, num) => _.chain(stars)
    .map(([lI, sI]) => `${lI}_${sI}`)
    .uniq()
    .each(hash => {
        if (!touchedStars[hash]) {
            touchedStars[hash] = {
                count: 1,
                prod: num,
            };
        } else {
            touchedStars[hash] = {
                count: touchedStars[hash].count + 1,
                prod: touchedStars[hash].prod * num,
            };
        }
    })
    .value();

const parseLine = lineIndex => {
    const line = lines[lineIndex];
    let currentNumber = 0;
    let currentTouchedStars = [];
    _.each(line, (letter, symbolIndex) => {
        if (isNumber(letter)) {
            currentNumber = +currentNumber * 10 + +letter;
            currentTouchedStars = [...currentTouchedStars,
                ...isTouchedByStar(lineIndex, symbolIndex)];
        } else {
            parseTouchedStars(currentTouchedStars, currentNumber);
            currentNumber = 0;
            currentTouchedStars = [];
        }
    });
    parseTouchedStars(currentTouchedStars, currentNumber);
};

lines.map((line, index) => parseLine(index));

const answer = _.chain(touchedStars)
    .filter({ count: 2 })
    .map('prod')
    .sum()
    .value();

console.log('Part 2:', answer);
