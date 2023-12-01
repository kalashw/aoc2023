const fs = require('fs');
const _ = require('lodash');

// part 1
const lines = fs.readFileSync('./input.txt').toString().split('\n');

const processLine = line => {
    const first = _.find(line, a => (a >= '0') && (a <= '9'));
    const last = _.findLast(line, a => (a >= '0') && (a <= '9'));
    return first * 10 + (last * 1);
};

console.log('Part 1:', _.sum(lines.map(processLine)));

// part 2
const list = {
    0: 0,
    1: 1,
    2: 2,
    3: 3,
    4: 4,
    5: 5,
    6: 6,
    7: 7,
    8: 8,
    9: 9,
    zero: 0,
    one: 1,
    two: 2,
    three: 3,
    four: 4,
    five: 5,
    six: 6,
    seven: 7,
    eight: 8,
    nine: 9,
};

const reversedList = _.mapKeys(list, (value, key) => key.split('').reverse().join(''));

const part2 = fs.readFileSync('./input.txt').toString().split('\n').map(line => {
    const firstNum = _.chain(list)
        .map((number, name) => ({
            name,
            position: line.indexOf(name),
        }))
        .filter(x => x.position !== -1)
        .sortBy('position')
        .head()
        .value();

    const reversedLine = line.split('').reverse().join('');

    const lastNum = _.chain(reversedList)
        .map((number, name) => ({
            name,
            position: reversedLine.indexOf(name),
        }))
        .filter(x => x.position !== -1)
        .sortBy('position')
        .head()
        .value();

    return list[firstNum.name] * 10 + reversedList[lastNum.name];
});

console.log('Part 2:', _.sum(part2));
