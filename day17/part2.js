const fs = require('fs');
const _ = require('lodash');

const cityMap = fs.readFileSync('./input.txt').toString().split('\n')
    .map(line => line.split('').map(_.toInteger));

const canGoNorth = ({ point, history }) => _.last(history) !== 'S'
    && (history.length < 10 || history.substring(history.length - 10, history.length) !== 'NNNNNNNNNN')
    && (history.length === 0 || history[history.length - 1] === 'N' || history.substring(history.length - 4, history.length) === `${history[history.length - 1]}${history[history.length - 1]}${history[history.length - 1]}${history[history.length - 1]}`)
    && point.row !== 0;

const canGoSouth = ({ point, history }) => _.last(history) !== 'N'
    && (history.length < 10 || history.substring(history.length - 10, history.length) !== 'SSSSSSSSSS')
    && (history.length === 0 || history[history.length - 1] === 'S' || history.substring(history.length - 4, history.length) === `${history[history.length - 1]}${history[history.length - 1]}${history[history.length - 1]}${history[history.length - 1]}`)
    && point.row !== cityMap.length - 1;

const canGoWest = ({ point, history }) => _.last(history) !== 'E'
    && (history.length < 10 || history.substring(history.length - 10, history.length) !== 'WWWWWWWWWW')
    && (history.length === 0 || history[history.length - 1] === 'W' || history.substring(history.length - 4, history.length) === `${history[history.length - 1]}${history[history.length - 1]}${history[history.length - 1]}${history[history.length - 1]}`)
    && point.col !== 0;

const canGoEast = ({ point, history }) => _.last(history) !== 'W'
    && (history.length < 10 || history.substring(history.length - 10, history.length) !== 'EEEEEEEEEE')
    && (history.length === 0 || history[history.length - 1] === 'E' || history.substring(history.length - 4, history.length) === `${history[history.length - 1]}${history[history.length - 1]}${history[history.length - 1]}${history[history.length - 1]}`)
    && point.col !== cityMap[0].length - 1;

const cache = {};

const hashFunc = ({ point, history }) => {
    if (history.length < 10) return `${point.row},${point.col},${history}`;
    const len = history.length;
    const ind = _.findLastIndex(history.substring(len - 10, len).split(''), el => el !== history[history.length - 1]);
    return `${point.row},${point.col},${history[history.length - 1]},${ind}`;
};

let currentMinimalHeat = 964; /* _.sum(
    _.map(_.range(0, cityMap.length - 1), ind => cityMap[ind][ind] + cityMap[ind][ind + 1]),
) - cityMap[0][0] + cityMap[cityMap.length - 1][cityMap[0].length - 1]; */

let shortestPath = '';

const calculateHeat = ({
    point, history, currentHeat,
}) => {
    const hash = hashFunc({ point, history });
    if (cache[hash] && cache[hash] <= currentHeat) {
        return currentMinimalHeat;
    }
    cache[hash] = currentHeat;

    if (point.row === cityMap.length - 1 && point.col === cityMap[0].length - 1) {
        if (currentMinimalHeat > currentHeat) {
            shortestPath = history;
        }
        currentMinimalHeat = _.min([currentHeat, currentMinimalHeat]);
        console.log(currentMinimalHeat);

        return currentHeat;
    }
    if (currentHeat >= currentMinimalHeat) {
        return currentHeat;
    }
    const allDirections = [];
    if (canGoNorth({ point, history })) {
        const northDirection = {
            point: {
                row: point.row - 1,
                col: point.col,
            },
            history: `${history}N`,
            currentHeat: currentHeat + cityMap[point.row - 1][point.col],
        };
        allDirections.push(northDirection);
    }
    if (canGoSouth({ point, history })) {
        const southDirection = {
            point: {
                row: point.row + 1,
                col: point.col,
            },
            history: `${history}S`,
            currentHeat: currentHeat + cityMap[point.row + 1][point.col],
        };

        allDirections.push(southDirection);
    }

    if (canGoWest({ point, history })) {
        const westDirection = {
            point: {
                row: point.row,
                col: point.col - 1,
            },
            history: `${history}W`,
            currentHeat: currentHeat + cityMap[point.row][point.col - 1],
        };

        allDirections.push(westDirection);
    }

    if (canGoEast({ point, history })) {
        const eastDirection = {
            point: {
                row: point.row,
                col: point.col + 1,
            },
            history: `${history}E`,
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
    currentHeat: 0,
    history: '',
};

const answer = calculateHeat(start);
console.log('Part 2:', answer, shortestPath);
