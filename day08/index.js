const fs = require('fs');
const lcm = require('compute-lcm');

const [instructions, formulas] = fs.readFileSync('./input.txt').toString().split('\n\n');

const combinedDirections = {};
const parseFormula = formula => {
    const value = formula.slice(0, 3);
    const leftDirection = formula.slice(7, 10);
    const rightDirection = formula.slice(12, 15);
    combinedDirections[value] = {
        R: rightDirection,
        L: leftDirection,
    };
};

formulas.split('\n').forEach(parseFormula);

let currentValue = 'AAA';
let currentInstructionIndex = 0;
let stepCount = 0;

const takeStep = (value, instructionIndex) => [
    combinedDirections[value][instructions[instructionIndex]],
    instructionIndex === instructions.length - 1 ? 0 : instructionIndex + 1,
];
while (currentValue !== 'ZZZ' && currentValue) {
    [currentValue, currentInstructionIndex] = takeStep(currentValue, currentInstructionIndex);
    stepCount += 1;
}

console.log('Part 1: ', stepCount);

// part 2

const currentValues = Object.keys(combinedDirections).filter(value => value[2] === 'A');

const hash = (value, index) => `${value}_${index}`;

const findCycle = valueToTest => {
    const allValuesAndDirections = {};
    let value = valueToTest;
    let index = 0;
    let currentStep = 0;
    while (!allValuesAndDirections[hash(value, index)]) {
        allValuesAndDirections[hash(value, index)] = currentStep;
        [value, index] = takeStep(value, index);
        currentStep += 1;
    }

    const headLength = allValuesAndDirections[hash(value, index)];
    const cycleLength = currentStep - allValuesAndDirections[hash(value, index)];
    const indexesOfZInCycle = Object.keys(allValuesAndDirections)
        .filter(val => allValuesAndDirections[val] >= headLength && val[2] === 'Z')
        .map(val => allValuesAndDirections[val] - headLength);

    return { headLength, cycleLength, indexesOfZInCycle };
};

console.log('Info about part 2:', currentValues.map(findCycle));

// From this data we see that Z appears cyclically at every cycleLength position
// so we just need to compute lcm

const cycles = currentValues.map(findCycle).map(a => a.cycleLength);
console.log('Part 2:', lcm(...cycles));
