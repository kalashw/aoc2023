const fs = require('fs');
const _ = require('lodash');

const [instructionLines, partLines] = fs.readFileSync('./input.txt').toString()
    .split('\n\n')
    .map(block => block.split('\n'));

const parsePart = partLine => {
    const letterLines = partLine.substring(1, partLine.length - 1)
        .split(',')
        .map(letterLine => {
            const [letter, number] = letterLine.split('=');
            return [letter, +number];
        });

    return _.fromPairs(letterLines);
};

const parseInstruction = instructionLine => {
    const [instructionName, instructionList] = instructionLine
        .substring(0, instructionLine.length - 1)
        .split('{');
    const parsedInstructions = instructionList.split(',')
        .map(instructionString => {
            const [condition, direction] = instructionString.split(':');
            if (!direction) {
                return { conditionType: 'End', next: condition };
            }
            const [conditionLetter, conditionType, ...numbers] = condition;

            return {
                conditionType,
                conditionLetter,
                next: direction,
                value: +numbers.join(''),
            };
        });

    return [instructionName, parsedInstructions];
};

// part 1
const checkCondition = ({ conditionType, value, conditionLetter }, part) => {
    if (conditionType === 'End') {
        return true;
    }
    if (conditionType === '>') {
        return part[conditionLetter] > value;
    }
    return part[conditionLetter] < value;
};

const applyInstructions = ({ startInstructionName, part, instructions }) => {
    const conditions = instructions[startInstructionName];
    const { next } = conditions.find(condition => checkCondition(condition, part));

    if (next === 'A') {
        return true;
    } if (next === 'R') {
        return false;
    }

    return applyInstructions({
        part,
        instructions,
        startInstructionName: next,
    });
};

const findAllAcceptedParts = () => {
    const instructions = _.fromPairs(instructionLines.map(parseInstruction));
    const parts = partLines.map(parsePart);

    return parts.filter(part => applyInstructions({
        startInstructionName: 'in',
        part,
        instructions,
    }));
};

const answer = _.chain(findAllAcceptedParts())
    .map(part => _.sum(_.values(part)))
    .sum()
    .value();

console.log('Part 1:', answer);

// part 2
const applyInstructions2 = ({
    instructionName, conditionIndex, part, instructions,
}) => {
    if (instructionName === 'A') {
        return {
            isAccepted: true,
            part,
        };
    }
    if (instructionName === 'R') {
        return {
            isAccepted: false,
            part,
        };
    }

    if (_.some(part, interval => interval[0] + 1 >= interval[1])) {
        return {
            isAccepted: false,
            part,
        };
    }
    const {
        conditionType, conditionLetter, next, value,
    } = instructions[instructionName][conditionIndex];

    if (conditionType === 'End') {
        return applyInstructions2({
            instructionName: next,
            conditionIndex: 0,
            part,
            instructions,
        });
    }

    const newPartTrue = { ...part };
    const newPartFalse = { ...part };
    const [start, end] = part[conditionLetter];

    if (conditionType === '>') {
        newPartTrue[conditionLetter] = [_.max([start, value]), end];
        newPartFalse[conditionLetter] = [start, _.min([value + 1, end])];
    } else {
        newPartTrue[conditionLetter] = [start, _.min([end, value])];
        newPartFalse[conditionLetter] = [_.max([start, value - 1]), end];
    }

    return _.flatten([
        applyInstructions2({
            part: newPartTrue,
            instructionName: next,
            conditionIndex: 0,
            instructions,
        }),
        applyInstructions2({
            part: newPartFalse,
            instructionName,
            conditionIndex: conditionIndex + 1,
            instructions,
        }),
    ]);
};

const findAllPossibleAcceptedParts = () => {
    const instructions = _.fromPairs(instructionLines.map(parseInstruction));
    const startingPart = {
        x: [0, 4001],
        m: [0, 4001],
        a: [0, 4001],
        s: [0, 4001],
    };

    return applyInstructions2({
        instructionName: 'in',
        conditionIndex: 0,
        part: startingPart,
        instructions,
    })
        .filter(({ isAccepted }) => isAccepted);
};

const calculateResult = ({
    x, m, a, s,
}) => {
    const lengthX = x[1] - x[0] - 1;
    const lengthM = m[1] - m[0] - 1;
    const lengthA = a[1] - a[0] - 1;
    const lengthS = s[1] - s[0] - 1;

    return lengthX * lengthM * lengthA * lengthS;
};

const answer2 = _.sum(
    findAllPossibleAcceptedParts()
        .map(({ part }) => calculateResult(part)),
);
console.log('Part 2:', answer2);
