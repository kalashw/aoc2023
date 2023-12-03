const fs = require('fs');
const _ = require('lodash'); //

const lines = fs.readFileSync('./input.txt').toString().split('\n');

const isNumber = a => ((a >= '0') && a <= '9');
const isSymbol = a => !isNumber(a) && a !== '.';

const checkTopLeft = (lineIndex, symbolIndex) => lineIndex !== 0
    && symbolIndex !== 0
    && isSymbol(lines[lineIndex - 1][symbolIndex - 1]);

const checkTop = (lineIndex, symbolIndex) => lineIndex !== 0
    && isSymbol(lines[lineIndex - 1][symbolIndex]);

const checkTopRight = (lineIndex, symbolIndex) => lineIndex !== 0
    && symbolIndex !== lines[lineIndex].length - 1
    && isSymbol(lines[lineIndex - 1][symbolIndex + 1]);

const checkLeft = (lineIndex, symbolIndex) => symbolIndex !== 0
    && isSymbol(lines[lineIndex][symbolIndex - 1]);

const checkRight = (lineIndex, symbolIndex) => symbolIndex !== lines[lineIndex].length - 1
    && isSymbol(lines[lineIndex][symbolIndex + 1]);

const checkBottomLeft = (lineIndex, symbolIndex) => lineIndex !== lines.length - 1
    && symbolIndex !== 0
    && isSymbol(lines[lineIndex + 1][symbolIndex - 1]);

const checkBottom = (lineIndex, symbolIndex) => lineIndex !== lines.length - 1
    && isSymbol(lines[lineIndex + 1][symbolIndex]);

const checkBottomRight = (lineIndex, symbolIndex) => lineIndex !== lines.length - 1
    && symbolIndex !== lines[lineIndex].length - 1
    && isSymbol(lines[lineIndex + 1][symbolIndex + 1]);

const isTouched = (lineIndex, symbolIndex) => checkTopLeft(lineIndex, symbolIndex)
        || checkTop(lineIndex, symbolIndex)
        || checkTopRight(lineIndex, symbolIndex)
        || checkLeft(lineIndex, symbolIndex)
        || checkRight(lineIndex, symbolIndex)
        || checkBottomLeft(lineIndex, symbolIndex)
        || checkBottom(lineIndex, symbolIndex)
        || checkBottomRight(lineIndex, symbolIndex);

let sum = 0;

const parseLine = lineIndex => {
    const line = lines[lineIndex];
    let currentNumber = 0;
    let currentNumberIsTouched = false;
    _.each(line, (letter, symbolIndex) => {
        if (isNumber(letter)) {
            currentNumber = currentNumber * 10 + letter * 1;
            currentNumberIsTouched = currentNumberIsTouched
                || isTouched(lineIndex, symbolIndex);
        } else if (currentNumberIsTouched) {
            sum += currentNumber;
            currentNumber = 0;
            currentNumberIsTouched = false;
        } else {
            currentNumber = 0;
            currentNumberIsTouched = false;
        }
    });
    if (currentNumberIsTouched) {
        sum += currentNumber;
    }
    currentNumber = 0;
    currentNumberIsTouched = false;
};

lines.forEach((line, index) => parseLine(index));

console.log('Part 1:', sum);
