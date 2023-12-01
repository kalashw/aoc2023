const fs = require('fs');
const _ = require('lodash')

//part 1
const lines = fs.readFileSync("./input.txt").toString().split("\n");

const processLine = line => {
    const first = _.find(line, a => ("0" <= a) && (a <= "9"));
    const last = _.findLast(line, a => ("0" <= a) && (a <= "9"));
    return first * 10 + (last * 1);
};

console.log("Part 1:", _.sum(lines.map(processLine)));

//part 2
const list = {
    "0": 0,
    "1": 1,
    "2": 2,
    "3": 3,
    "4": 4,
    "5": 5,
    "6": 6,
    "7": 7,
    "8": 8,
    "9": 9,
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
}
const part2 = fs.readFileSync("./input.txt").toString().split("\n").map((line) => {
    const firstNum = _.sortBy(
        Object.keys(list)
            .map(item => ({
                name: item,
                value: line.indexOf(item),
            }))
            .filter(x => x.value != -1),
        'value'
    )[0];

    const reversedLine = _.reverse(Array.from(line)).toString();
    const lastNum = _.sortBy(
        Object.keys(list)
            .map(item => ({
                name: item,
                value: reversedLine.indexOf(_.reverse(Array.from(item))),
            }))
            .filter(x => x.value != -1),
        'value',
        )[0];

    return list[firstNum.name] * 10 + list[lastNum.name];
});

console.log("Part 2:", _.sum(part2));