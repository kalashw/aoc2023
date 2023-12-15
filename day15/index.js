const fs = require('fs');
const _ = require('lodash');

const lines = fs.readFileSync('./input.txt').toString().split(',');

// part 1
const HASH = line => _.reduce(line, (sum, char) => ((sum + char.charCodeAt(0)) * 17) % 256, 0);

const answer = _.chain(lines)
    .map(HASH)
    .sum()
    .value();

console.log('Part 1:', answer);

// part 2

const boxes = {};

const doStep = line => {
    const operationIsDash = line.indexOf('-') !== -1;

    if (operationIsDash) {
        const [label] = line.split('-');
        const boxNumber = HASH(label);
        if (!boxes[boxNumber]) return;
        const indexToRemove = boxes[boxNumber].findIndex(el => el.label === label);
        if (indexToRemove !== -1) {
            boxes[boxNumber].splice(indexToRemove, 1);
        }
    } else {
        const [label, lens] = line.split('=');
        const boxNumber = HASH(label);
        if (!boxes[boxNumber]) {
            boxes[boxNumber] = [{ label, lens }];
        } else {
            const previousLabelIndex = boxes[boxNumber].findIndex(el => el.label === label);
            if (previousLabelIndex !== -1) {
                boxes[boxNumber][previousLabelIndex] = { label, lens };
            } else {
                boxes[boxNumber].push({ label, lens });
            }
        }
    }
};

const computeSum = () => _.chain(boxes)
    .flatMap(
        (box, boxNumber) => _.map(
            box,
            (lens, lensIndex) => (1 + +boxNumber) * (1 + lensIndex) * (+lens.lens),
        ),
    )
    .sum()
    .value();

lines.forEach(doStep);
const answer2 = computeSum();
console.log('Part 2:', answer2);
