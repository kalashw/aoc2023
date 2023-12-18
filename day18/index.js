const fs = require('fs');
const _ = require('lodash');

const lines = fs.readFileSync('./input.txt').toString().split('\n');

const dirMap = {
    R: ({ row, col }, distance = 1) => ({ row, col: col + distance }),
    L: ({ row, col }, distance = 1) => ({ row, col: col - distance }),
    U: ({ row, col }, distance = 1) => ({ row: row - distance, col }),
    D: ({ row, col }, distance = 1) => ({ row: row + distance, col }),
};

const hash = ({ row, col }) => `${row},${col}`;

const printArr = arr => {
    const string = arr.map(line => line.map(el => el || '.').join('')).join('\n');

    fs.writeFileSync('output.txt', string);
};

// part 1

const parseLine = line => {
    const [direction, stepCount] = line.split(' ');

    return {
        direction,
        stepCount: +stepCount,
    };
};

const dig1 = ({ point, instruction: { direction, stepCount }, result }) => {
    let newPoint = point;
    _.times(stepCount, () => {
        newPoint = dirMap[direction](newPoint);
        // eslint-disable-next-line no-param-reassign
        result[hash(newPoint)] = '#';
    });
    return newPoint;
};

const digPart1 = () => {
    let point = { row: 200, col: 200 };
    let maxRow = point.row;
    let maxCol = point.col;
    let minRow = point.row;
    let minCol = point.col;
    const instructions = lines.map(parseLine);
    const result = {};

    instructions.forEach(instruction => {
        point = dig1({ point, instruction, result });
        maxRow = maxRow > point.row ? maxRow : point.row;
        maxCol = maxCol > point.col ? maxCol : point.col;
        minRow = minRow > point.row ? point.row : minRow;
        minCol = minCol > point.col ? point.col : minCol;
    });

    const resultArr = [...Array(maxRow + 3 - minRow)].map(() => [...Array(maxCol + 3 - minCol)]);

    _.each(result, (el, key) => {
        const [row, col] = key.split(',');
        resultArr[+row + 1 - minRow][+col + 1 - minCol] = '#';
    });

    printArr(resultArr);
    let areaOutside = 1;

    const floodFill = entryPoint => {
        const pointsToCheck = [entryPoint];
        while (pointsToCheck.length > 0) {
            const pointToCheck = pointsToCheck.pop();
            const newPoints = [
                dirMap.R(pointToCheck),
                dirMap.L(pointToCheck),
                dirMap.U(pointToCheck),
                dirMap.D(pointToCheck),
            ];

            const newPointsToFloodFill = newPoints
                .filter(
                    p => (p.row >= 0)
                    && (p.row < resultArr.length)
                    && (p.col >= 0)
                    && (p.col < resultArr[0].length)
                    && !resultArr[p.row][p.col],
                );

            // eslint-disable-next-line no-loop-func
            newPointsToFloodFill.forEach(p => {
                resultArr[p.row][p.col] = 1;
                areaOutside += 1;
                pointsToCheck.push({ ...p });
            });
        }
    };

    resultArr[0][0] = 1;
    floodFill({ row: 0, col: 0 });
    return (maxRow - minRow + 3) * (maxCol - minCol + 3) - areaOutside;
};

const answer = digPart1();

console.log('Part 1:', answer);

// part 2
const parseLine2 = line => {
    const color = line.split(' ')[2];
    const num = color.substring(2, 7);

    const numToDir = {
        0: 'R',
        1: 'D',
        2: 'L',
        3: 'U',
    };
    const direction = numToDir[color[7]];

    const stepCount = +`0x${num}`;

    return {
        direction,
        stepCount: +stepCount,
    };
};

const dig2 = ({
    point, instruction: { direction, stepCount }, result, nextDirection,
}) => {
    const newPoint = dirMap[direction](point, stepCount);
    const isLeft = (nextDirection === 'L' || direction === 'L');
    const isDown = (nextDirection === 'D' || direction === 'D');

    result.push({ ...newPoint, isLeft, isDown });
    return newPoint;
};

const digPart2 = () => {
    let point = { row: 0, col: 0 };
    const instructions = lines.map(parseLine2);
    const result = [];

    instructions.forEach((instruction, index) => {
        const nextDirection = instructions[(index + 1) % instructions.length].direction;
        point = dig2({
            point, instruction, result, nextDirection,
        });
    });

    return _.chain(result)
        .map(({
            row, col, isLeft, isDown,
        }, index) => {
            const toAdd = (row + (+isLeft)) * (col + (+isDown));
            const sign = index % 2 === 1 ? 1 : -1;

            return sign * toAdd;
        })
        .sum()
        .value();
};

const answer2 = digPart2();

console.log('Part 2:', answer2);
