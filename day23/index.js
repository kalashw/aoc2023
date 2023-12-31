const fs = require('fs');
const _ = require('lodash');

const lines = fs.readFileSync('./input.txt').toString().split('\n');
const map = lines.map(line => line.split(''));
const hash = ({ row, col }) => `${row}_${col}`;

const parseGraph = () => {
    const startCol = _.findIndex(map[0], el => el === '.');
    const endCol = _.findIndex(_.last(map), el => el === '.');
    map[map.length - 2][endCol] = 'v';

    const graph = {
        [hash({ row: 0, col: startCol })]: {
            edgesIn: [],
            edgesOut: [],
        },
        [hash({ row: map.length - 1, col: endCol })]: {
            edgesIn: [],
            edgesOut: [],
        },
    };

    const queue = [
        {
            row: 0,
            col: startCol,
            lastDirection: null,
            currentEdgeWeight: 0,
            edgeStart: {
                row: 0,
                col: startCol,
            },
        },
    ];

    while (queue.length > 0) {
        const {
            row, col, lastDirection, currentEdgeWeight, edgeStart,
        } = queue.shift();
        if (map[row][col] === '.') {
            if (row > 0 && lastDirection !== 'S' && map[row - 1][col] !== '#') {
                queue.unshift({
                    row: row - 1,
                    col,
                    lastDirection: 'N',
                    currentEdgeWeight: currentEdgeWeight + 1,
                    edgeStart,
                });
            }
            if (row < map.length - 1 && lastDirection !== 'N' && map[row + 1][col] !== '#') {
                queue.unshift({
                    row: row + 1,
                    col,
                    lastDirection: 'S',
                    currentEdgeWeight: currentEdgeWeight + 1,
                    edgeStart,
                });
            }
            if (col > 0 && lastDirection !== 'E' && map[row][col - 1] !== '#') {
                queue.unshift({
                    row,
                    col: col - 1,
                    lastDirection: 'W',
                    currentEdgeWeight: currentEdgeWeight + 1,
                    edgeStart,
                });
            }
            if (col < map[0].length - 1 && lastDirection !== 'W' && map[row][col + 1] !== '#') {
                queue.unshift({
                    row,
                    col: col + 1,
                    lastDirection: 'E',
                    currentEdgeWeight: currentEdgeWeight + 1,
                    edgeStart,
                });
            }
        }
        let edgeEnd;

        if (map[row][col] === '<' && lastDirection !== 'E') {
            edgeEnd = {
                row,
                col: col - 1,
            };
        }
        if (map[row][col] === '^' && lastDirection !== 'S') {
            edgeEnd = {
                row: row - 1,
                col,
            };
        }
        if (map[row][col] === '>' && lastDirection !== 'W') {
            edgeEnd = {
                row,
                col: col + 1,
            };
        }
        if (map[row][col] === 'v' && lastDirection !== 'N') {
            edgeEnd = {
                row: row + 1,
                col,
            };
        }

        if (edgeEnd) {
            if (edgeEnd.row === map.length - 1) {
                graph[hash(edgeEnd)] = {
                    ...edgeEnd,
                    edgesIn: [{
                        end: edgeStart,
                        weight: currentEdgeWeight + 1,
                    }],
                    edgesOut: [],
                };
            }
            if (graph[hash(edgeEnd)]) {
                graph[hash(edgeEnd)] = {
                    ...graph[hash(edgeEnd)],
                    edgesIn: [
                        ...graph[hash(edgeEnd)].edgesIn,
                        {
                            end: edgeStart,
                            weight: currentEdgeWeight + 1,
                        }],
                };
            }
            if (!graph[hash(edgeEnd)]) {
                graph[hash(edgeEnd)] = {
                    ...edgeEnd,
                    edgesIn: [{
                        end: edgeStart,
                        weight: currentEdgeWeight + 1,
                    }],
                    edgesOut: [],
                };

                if (col > 1 && map[edgeEnd.row][edgeEnd.col - 1] === '<') {
                    queue.push({
                        row: edgeEnd.row,
                        col: edgeEnd.col - 2,
                        lastDirection: 'W',
                        currentEdgeWeight: 2,
                        edgeStart: {
                            row: edgeEnd.row,
                            col: edgeEnd.col,
                        },
                    });
                }

                if (col < map[0].length - 2 && map[edgeEnd.row][edgeEnd.col + 1] === '>') {
                    queue.push({
                        row: edgeEnd.row,
                        col: edgeEnd.col + 2,
                        lastDirection: 'E',
                        currentEdgeWeight: 2,
                        edgeStart: {
                            row: edgeEnd.row,
                            col: edgeEnd.col,
                        },
                    });
                }

                if (row > 1 && map[edgeEnd.row - 1][edgeEnd.col] === '^') {
                    queue.push({
                        row: edgeEnd.row - 2,
                        col: edgeEnd.col,
                        lastDirection: 'N',
                        currentEdgeWeight: 2,
                        edgeStart: {
                            row: edgeEnd.row,
                            col: edgeEnd.col,
                        },
                    });
                }

                if (row < map.length - 2 && map[edgeEnd.row + 1][edgeEnd.col] === 'v') {
                    queue.push({
                        row: edgeEnd.row + 2,
                        col: edgeEnd.col,
                        lastDirection: 'S',
                        currentEdgeWeight: 2,
                        edgeStart: {
                            row: edgeEnd.row,
                            col: edgeEnd.col,
                        },
                    });
                }
            }
            graph[hash(edgeStart)] = {
                ...graph[hash(edgeStart)],
                edgesOut: [
                    ...graph[hash(edgeStart)].edgesOut,
                    {
                        end: edgeEnd,
                        weight: currentEdgeWeight + 1,
                    },
                ],
            };
        }
    }

    return graph;
};

const part1 = () => {
    const graph = parseGraph();
    const start = {
        row: 0,
        col: _.findIndex(map[0], el => el === '.'),
    };
    const end = {
        row: map.length - 1,
        col: _.findIndex(_.last(map), el => el === '.'),
    };

    const queue = [];
    const unvisitedHashes = new Set(_.keys(graph));

    const currentWeights = _.mapValues(graph, el => (el.row === 0 ? 0 : 1));
    queue.push(start);

    // I can do dijkstra because there are no negative cycles, because that's how the input works!

    while (queue.length) {
        const current = queue.shift();
        const { edgesOut } = graph[hash(current)];
        _.forEach(edgesOut, edgeOut => {
            if (-edgeOut.weight + currentWeights[hash(current)]
                < currentWeights[hash(edgeOut.end)]) {
                currentWeights[hash(edgeOut.end)] = -edgeOut.weight
                    + currentWeights[hash(current)];
            }
            if (unvisitedHashes.has(hash(edgeOut.end))) {
                queue.push(edgeOut.end);
            }
        });
        unvisitedHashes.delete(hash(current));
    }

    return -currentWeights[hash(end)] + 1;
};

// this is sooooo slooooow, like an hour to run. need to optimize

const part2 = () => {
    const graph = parseGraph();
    const start = {
        row: 0,
        col: _.findIndex(map[0], el => el === '.'),
    };
    const end = {
        row: map.length - 1,
        col: _.findIndex(_.last(map), el => el === '.'),
    };

    const queue = [{
        ...start,
        visited: _.mapValues(graph, () => false),
        currentLength: 0,
    }];

    queue[0].visited[hash(start)] = true;
    let currentMaxLength = 0;
    while (queue.length > 0) {
        console.log(currentMaxLength);
        const {
            visited, row, col, currentLength,
        } = queue.shift();

        visited[hash({ row, col })] = true;

        if (row === end.row && col === end.col) {
            currentMaxLength = Math.max(currentLength, currentMaxLength);
        } else {
            [...graph[hash({ row, col })].edgesIn, ...graph[hash({ row, col })].edgesOut]
                .filter(edge => !visited[hash(edge.end)])
                .forEach(edge => queue.push({
                    row: edge.end.row,
                    col: edge.end.col,
                    currentLength: currentLength + edge.weight,
                    visited: {
                        ...visited,
                    },
                }));
        }
    }

    return currentMaxLength;
};
// part 1
const answer = part1();
console.log('Part 1:', answer);

// part 2
const answer2 = part2();
console.log('Part 2:', answer2);
