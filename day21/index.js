const fs = require('fs');
const _ = require('lodash');

const theMap = fs.readFileSync('./input.txt').toString().split('\n')
    .map(line => line.split(''));

const maxLength = theMap.length;

const findStart = () => {
    const row = theMap.findIndex(line => line.indexOf('S') !== -1);
    const col = theMap[row].indexOf('S');
    return { row, col };
};

const isRock = el => el === '#';
const isEmpty = el => el === '.';

const printArr = arr => {
    const string = arr.map(line => line.map(el => el || '.').join(' ')).join('\n');
    fs.writeFileSync('output.txt', string);
    console.log(string);
};

const reachedCellsInSteps = (numberOfSteps, startMap = theMap) => {
    const state = startMap.map(row => [...row]);

    const takeOneStep = currentStepNumber => {
        const previousStep = currentStepNumber - 1 || 'S';
        _.each(state, (line, row) => {
            _.each(line, (value, column) => {
                if (value === previousStep) {
                    if (row > 0 && isEmpty(state[row - 1][column])) {
                        state[row - 1][column] = currentStepNumber;
                    }
                    if (row < state.length - 1 && isEmpty(state[row + 1][column])) {
                        state[row + 1][column] = currentStepNumber;
                    }
                    if (column > 0 && isEmpty(state[row][column - 1])) {
                        state[row][column - 1] = currentStepNumber;
                    } if (column < state[0].length - 1 && isEmpty(state[row][column + 1])) {
                        state[row][column + 1] = currentStepNumber;
                    }
                }
            });
        });
    };
    _.times(numberOfSteps, ind => takeOneStep(ind + 1));

    let numberOfReachedValues = 0;
    _.each(state, line => {
        _.each(line, value => {
            if ((value === 'S' && numberOfSteps % 2 === 0)
                || (_.isInteger(value)
                    && value % 2 === numberOfSteps % 2
                )
            ) {
                numberOfReachedValues += 1;
            }
        });
    });

    return numberOfReachedValues;
};
// part 1
const answer = reachedCellsInSteps(64);
console.log('Part 1:', answer);

const maxNumberOfSteps = 26501365;

const start = findStart();
const reachedCellsInStepsFromEdges = () => {
    const emptyMap = theMap.map(row => [...row].map(el => (el === 'S' ? '.' : el)));

    const edgeStarts = {
        N: { row: 0, col: start.col },
        S: { row: maxLength - 1, col: start.col },
        E: { row: start.row, col: maxLength - 1 },
        W: { row: start.row, col: 0 },
        NE: { row: 0, col: maxLength - 1 },
        NW: { row: 0, col: 0 },
        SE: { row: maxLength - 1, col: maxLength - 1 },
        SW: { row: maxLength - 1, col: 0 },
    };

    return _.mapValues(edgeStarts, (edgeStart, dir) => {
        const newMap = emptyMap.map(row => [...row]);
        newMap[edgeStart.row][edgeStart.col] = 'S';

        if (dir.length === 1) {
            return reachedCellsInSteps(130, newMap);
        }
        return {
            odd: reachedCellsInSteps(64, newMap),
            even: reachedCellsInSteps(131 + 64, newMap),
        };
    });
};

const edgeSteps = reachedCellsInStepsFromEdges(
    (maxNumberOfSteps - start.col) % maxLength,
);

const numberOfCycles = Math.floor(maxNumberOfSteps / maxLength);

// part 2
//
const answer2 = (numberOfCycles * (numberOfCycles - 2) + 1) * (reachedCellsInSteps(131))
    + numberOfCycles * numberOfCycles * reachedCellsInSteps(132)
    + (numberOfCycles) * (edgeSteps.NE.odd + edgeSteps.NW.odd + edgeSteps.SE.odd + edgeSteps.SW.odd)
    + (numberOfCycles - 1) * (edgeSteps.NE.even + edgeSteps.NW.even + edgeSteps.SE.even + edgeSteps.SW.even)
    + edgeSteps.N + edgeSteps.E + edgeSteps.S + edgeSteps.W;

console.log((numberOfCycles * (numberOfCycles) + 1) * (reachedCellsInSteps(132)));
console.log('Part 2:', answer2);
