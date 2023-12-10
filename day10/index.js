/* eslint-disable no-multiple-empty-lines */
const fs = require('fs');
const _ = require('lodash');

const lines = fs.readFileSync('./input.txt').toString().split('\n');

const charactersToNodes = {
    '|': {
        nodes: [{ col: 0, row: 1 }, { col: 0, row: -1 }],
    },
    '-': {
        nodes: [{ col: -1, row: 0 }, { col: 1, row: 0 }],
    },
    L: {
        nodes: [{ col: 0, row: -1 }, { col: 1, row: 0 }],
    },
    J: {
        nodes: [{ col: 0, row: -1 }, { col: -1, row: 0 }],
    },
    7: {
        nodes: [{ col: 0, row: 1 }, { col: -1, row: 0 }],
    },
    F: {
        nodes: [{ col: 0, row: 1 }, { col: 1, row: 0 }],
    },
    '.': {
        nodes: [],
    },
    // this is because I looked into my input
    S: {
        nodes: [{ col: 0, row: 1 }, { col: 0, row: -1 }],
    },
};
// part 1

const startRow = _.findIndex(lines, line => line.indexOf('S') !== -1);
const startCol = _.findIndex(lines[startRow], char => char === 'S');

const takeStep = ({ current, previous }) => {
    const previousNode = { col: -current.col + previous.col, row: -current.row + previous.row };
    const { nodes } = charactersToNodes[current.value];
    const nextNode = nodes.find(
        node => node.col !== previousNode.col || node.row !== previousNode.row,
    );
    const result = { col: current.col + nextNode.col, row: current.row + nextNode.row };
    return {
        ...result,
        value: lines[result.row][result.col],
    };
};

const calculateLoop = () => {
    let previousNode = {
        col: startCol,
        row: startRow,
        value: lines[startRow][startCol],
    };

    // this is because I looked into input
    let currentNode = {
        col: startCol,
        row: startRow - 1,
        value: '|',
    };


    const loop = {};

    const addToLoop = ({ row, col, value }) => {
        loop[`${row}_${col}`] = value;
    };
    addToLoop(previousNode);
    while ((currentNode.col !== startCol) || (currentNode.row !== startRow)) {
        addToLoop(currentNode);
        const step = takeStep({ previous: previousNode, current: currentNode });
        previousNode = currentNode;
        currentNode = step;
    }
    return loop;
};

const mainLoop = calculateLoop();
const answer = Object.keys(mainLoop).length / 2;
console.log('Part 1:', answer);

const findInMainLoop = ({ row, col }) => mainLoop[`${row}_${col}`];

// part 2

const isInside = ({ row, col }) => {
    let numberOfInBars = 0;
    _.times(row, ind => {
        const node = findInMainLoop({ row: ind, col });
        if (!node) return;
        if (node === '-' || node === '7' || node === 'J') {
            numberOfInBars += 1;
        }
    });
    return numberOfInBars % 2 === 1;
};

const calculateNumberInside = () => {
    let numberInside = 0;
    lines.forEach((line, row) => line.split('').forEach((char, col) => {
        const isInMainLoop = findInMainLoop({ row, col });

        if (isInMainLoop) return;
        numberInside += +isInside({ col, row });
    }));

    return numberInside;
};

const answer2 = calculateNumberInside();

console.log('Part 2:', answer2);


// part 2 old
/*
const newLabMap = {
    '|': [[0, 1, 0], [0, 1, 0], [0, 1, 0]],
    '-': [[0, 0, 0], [1, 1, 1], [0, 0, 0]],
    L: [[0, 1, 0], [0, 1, 1], [0, 0, 0]],
    J: [[0, 1, 0], [1, 1, 0], [0, 0, 0]],
    7: [[0, 0, 0], [1, 1, 0], [0, 1, 0]],
    F: [[0, 0, 0], [0, 1, 1], [0, 1, 0]],
    '.': [[0, 0, 0], [0, 0, 0], [0, 0, 0]],
    // this is because I looked into  my input
    S: [[0, 1, 0], [0, 1, 0], [0, 1, 0]],
};

const constructNewLab = () => {
    const result = [];
    lines.forEach((line, row) => {
        result[3 * row] = [];
        result[3 * row + 1] = [];
        result[3 * row + 2] = [];
        line.split('').forEach(
            (char, col) => {
                const isInMainLoop = findInMainLoop({ row, col });
                const mapping = isInMainLoop ? newLabMap[char] : newLabMap['.'];
                result[3 * row] = [...result[3 * row], ...mapping[0]];
                result[3 * row + 1] = [...result[3 * row + 1], ...mapping[1]];
                result[3 * row + 2] = [...result[3 * row + 2], ...mapping[2]];
            },
        );
    });
    return result;
};

const newLabyrinth = constructNewLab();

const isInside = ({ col, row, labyrinth }) => _.sum(
    _.times(3 * row + 1, ind => labyrinth[ind][3 * col]),
) % 2 === 1;
const calculateNumberInside = () => {
    let numberInside = 0;
    lines.forEach((line, row) => line.split('').forEach((char, col) => {
        const isInMainLoop = findInMainLoop({ row, col });

        if (isInMainLoop) return;
        numberInside += +isInside({ col, row, labyrinth: newLabyrinth });
    }));

    return numberInside;
};

const answer2 = calculateNumberInside();

console.log('Part 2:', answer2);
*/

