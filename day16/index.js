const fs = require('fs');
const _ = require('lodash');

const grid = fs.readFileSync('./input.txt').toString().split('\n')
    .map(line => line.split(''));

const mapOfDirections = {
    '.': {
        '1,0': '1,0',
        '0,1': '0,1',
        '-1,0': '-1,0',
        '0,-1': '0,-1',
    },
    '\\': {
        '1,0': '0,1',
        '0,1': '1,0',
        '-1,0': '0,-1',
        '0,-1': '-1,0',
    },
    '/': {
        '1,0': '0,-1',
        '0,1': '-1,0',
        '-1,0': '0,1',
        '0,-1': '1,0',
    },
    '|': {
        '1,0': '1,0',
        '0,1': ['1,0', '-1,0'],
        '-1,0': '-1,0',
        '0,-1': ['1,0', '-1,0'],
    },
    '-': {
        '1,0': ['0,-1', '0,1'],
        '0,1': '0,1',
        '-1,0': ['0,-1', '0,1'],
        '0,-1': '0,-1',
    },
};

const hash = ({ row, col }) => `${row},${col}`;

const applyDirections = ({ to, directionsToApply }) => {
    const directionsArr = _.isString(directionsToApply)
        ? [directionsToApply]
        : directionsToApply;
    return _.chain(directionsArr)
        .map(direction => {
            const [directionRow, directionCol] = direction.split(',').map(a => +a);
            const nextRow = to.row + directionRow;
            const nextCol = to.col + directionCol;

            if (nextRow < 0 || nextCol < 0 || nextRow >= grid.length || nextCol >= grid[0].length) {
                return false;
            }

            return { row: nextRow, col: nextCol };
        })
        .filter()
        .value();
};

const chooseNextSteps = ({
    from, to,
}) => {
    const toValue = grid[to.row][to.col];
    const hashedDiff = hash({ row: to.row - from.row, col: to.col - from.col });
    const directionsToApply = mapOfDirections[toValue][hashedDiff];

    return applyDirections({ to, directionsToApply });
};

const calculateEnergized = startingStep => {
    let steps = [startingStep];
    const currentlyEnergized = new Set([hash(steps[0].to)]);

    const stepsMade = new Set([hash(steps[0].from) + hash(steps[0].to)]);

    let dontStop = true;

    while (dontStop) {
        const nextSteps = _.chain(steps)
            .map(chooseNextSteps)
            .flatMap(
                // eslint-disable-next-line no-loop-func
                (nextStep, id) => nextStep.map(step => ({ from: steps[id].to, to: step })),
            )
            .uniqBy(el => hash(el.from) + hash(el.to))
            .filter(step => !stepsMade.has(hash(step.from) + hash(step.to)))
            .value();

        if (nextSteps.length === 0) {
            dontStop = false;
        } else {
            nextSteps.forEach(step => {
                stepsMade.add(hash(step.from) + hash(step.to));
                currentlyEnergized.add(hash(step.to));
            });
            steps = nextSteps;
        }
    }

    return currentlyEnergized.size;
};

// part 1
const answer = calculateEnergized({
    from: { row: 0, col: -1 },
    to: { row: 0, col: 0 },
});
console.log('Part 1:', answer);

// part 2

const getStartingRowsAndColumns = () => {
    const topRow = _.map(_.range(0, grid[0].length), ind => ({
        from: { row: -1, col: ind },
        to: { row: 0, col: ind },
    }));

    const bottomRow = _.map(_.range(0, grid[0].length), ind => ({
        from: { row: grid.length, col: ind },
        to: { row: grid.length - 1, col: ind },
    }));

    const leftCol = _.map(_.range(0, grid.length), ind => ({
        from: { row: ind, col: -1 },
        to: { row: ind, col: 0 },
    }));

    const rightCol = _.map(_.range(0, grid.length), ind => ({
        from: { row: ind, col: grid[0].length },
        to: { row: ind, col: grid[0].length - 1 },
    }));

    return [...topRow, ...bottomRow, ...leftCol, ...rightCol];
};
const answer2 = _.chain(getStartingRowsAndColumns())
    .map(calculateEnergized)
    .max()
    .value();

console.log('Part 2:', answer2);
