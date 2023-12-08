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

const takeStep = ({ value, index }) => [
    combinedDirections[value][instructions[index]],
    index === instructions.length - 1 ? 0 : index + 1,
];
while (currentValue !== 'ZZZ' && currentValue) {
    currentValue = combinedDirections[currentValue][instructions[currentInstructionIndex]];
    if (currentInstructionIndex === instructions.length - 1) {
        currentInstructionIndex = 0;
    } else {
        currentInstructionIndex += 1;
    }
    stepCount += 1;
}

console.log('Part 1: ', stepCount);

// part 2

const currentValues = Object.keys(combinedDirections).filter(value => value[2] === 'A');

const hash = (value, index) => `${value}_${index}`;

const findCycle = valueToTest => {
    const allValuesAndDirections = { [hash(valueToTest, 0)]: 0 };
    let value = valueToTest;
    let index = 0;
    let currentStep = 0;
    while (!allValuesAndDirections[hash(value, index)]) {
        allValuesAndDirections[[hash(value, index)]] = currentStep;
        [value, index] = takeStep({ value, index });
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

// here we see that all cycles start from 0
// and there is only one Z in each cycle! so we just need to find GCD of cycleLengths
const cycles = currentValues.map(findCycle).map(a => a.cycleLength);
console.log('Part 2:', lcm(...cycles));
