const fs = require('fs');
const _ = require('lodash');

const cityMap = fs.readFileSync('./input.txt').toString().split('\n')
    .map(line => line.split('').map(_.toInteger));

const canGoNorth = ({ point, lastThreeSteps }) => lastThreeSteps[2] !== 'S'
    && lastThreeSteps !== 'NNN'
    && point.row !== 0;

const canGoSouth = ({ point, lastThreeSteps }) => lastThreeSteps[2] !== 'N'
    && lastThreeSteps !== 'SSS'
    && point.row !== cityMap.length - 1;

const canGoWest = ({ point, lastThreeSteps }) => lastThreeSteps[2] !== 'E'
    && lastThreeSteps !== 'WWW'
    && point.col !== 0;

const canGoEast = ({ point, lastThreeSteps }) => lastThreeSteps[2] !== 'W'
    && lastThreeSteps !== 'EEE'
    && point.col !== cityMap[0].length - 1;

const cache = {};

const hashFunc = ({ point, lastThreeSteps }) => {
    const ind = _.findLastIndex(lastThreeSteps.split(''), el => el !== lastThreeSteps[2]);
    return `${point.row},${point.col},${lastThreeSteps[2]},${ind}`;
};

let currentMinimalHeat = 824; /* _.sum(
    _.map(_.range(0, cityMap.length - 1), ind => cityMap[ind][ind] + cityMap[ind][ind + 1]),
) - cityMap[0][0] + cityMap[cityMap.length - 1][cityMap[0].length - 1]; */

let shortestPath = '';

const calculateHeat = ({
    point, lastThreeSteps, history, currentHeat,
}) => {
    const hash = hashFunc({ point, lastThreeSteps });
    if (cache[hash] && cache[hash] <= currentHeat) {
        return currentMinimalHeat;
    }
    cache[hash] = currentHeat;
    if (point.row === cityMap.length - 1 && point.col === cityMap[0].length - 1) {
        if (currentMinimalHeat > currentHeat) {
            shortestPath = history;
        }
        currentMinimalHeat = _.min([currentHeat, currentMinimalHeat]);
        cache[hash] = currentMinimalHeat;

        return currentHeat;
    }
    if (currentHeat >= currentMinimalHeat) {
        return currentHeat;
    }
    const allDirections = [];
    if (canGoNorth({ point, lastThreeSteps })) {
        const northDirection = {
            point: {
                row: point.row - 1,
                col: point.col,
            },
            lastThreeSteps: `${lastThreeSteps.substring(1, 3)}N`,
            history: `${history}N${cityMap[point.row - 1][point.col]}`,
            currentHeat: currentHeat + cityMap[point.row - 1][point.col],
        };
        allDirections.push(northDirection);
    }
    if (canGoSouth({ point, lastThreeSteps })) {
        const southDirection = {
            point: {
                row: point.row + 1,
                col: point.col,
            },
            lastThreeSteps: `${lastThreeSteps.substring(1, 3)}S`,
            history: `${history}S${cityMap[point.row + 1][point.col]}`,
            currentHeat: currentHeat + cityMap[point.row + 1][point.col],
        };

        allDirections.push(southDirection);
    }

    if (canGoWest({ point, lastThreeSteps })) {
        const westDirection = {
            point: {
                row: point.row,
                col: point.col - 1,
            },
            lastThreeSteps: `${lastThreeSteps.substring(1, 3)}W`,
            history: `${history}W${cityMap[point.row][point.col - 1]}`,
            currentHeat: currentHeat + cityMap[point.row][point.col - 1],
        };

        allDirections.push(westDirection);
    }

    if (canGoEast({ point, lastThreeSteps })) {
        const eastDirection = {
            point: {
                row: point.row,
                col: point.col + 1,
            },
            lastThreeSteps: `${lastThreeSteps.substring(1, 3)}E`,
            history: `${history}E${cityMap[point.row][point.col + 1]}`,
            currentHeat: currentHeat + cityMap[point.row][point.col + 1],
        };

        allDirections.push(eastDirection);
    }

    return _.chain(allDirections)
        .map(calculateHeat)
        .min()
        .value();
};

const start = {
    point: {
        row: 0,
        col: 0,
    },
    lastThreeSteps: '000',
    currentHeat: 0,
    history: '',
};

const answer = calculateHeat(start);
console.log('Part 1:', answer, shortestPath);
