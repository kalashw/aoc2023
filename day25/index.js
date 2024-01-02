const fs = require('fs');
const _ = require('lodash');

const lines = fs.readFileSync('./input.txt').toString().split('\n');

const parseLines = () => {
    const edges = [];
    const edgesMap = {};
    const vertices = [];
    lines.forEach(line => {
        const [start, ends] = line.split(': ');
        vertices.push(start);
        _.each(ends.split(' '), end => {
            edges.push([start, end]);
            if (!edgesMap[start]) {
                edgesMap[start] = { [end]: 1 };
            } else {
                edgesMap[start][end] = 1;
            }
            if (!edgesMap[end]) {
                edgesMap[end] = { [start]: 1 };
            } else {
                edgesMap[end][start] = 1;
            }

            vertices.push(end);
        });
    });
    return {
        edges,
        edgesMap,
        vertices: _.uniq(vertices),
    };
};

const maximumAdjacencySearch = graph => {
    const vertices = _.keys(graph);
    const start = vertices[0];
    const found = [];
    found.push(start);
    const cutWeight = [];
    const candidates = new Set(vertices);
    candidates.delete(start);
    while (candidates.size > 0) {
        let maxNextVertex = null;
        let maxWeight = -1;
        candidates.forEach(next => {
            let weightSum = 0;
            found.forEach(vert => {
                const weight = graph[vert][next];
                if (weight) {
                    weightSum += weight;
                }
            });

            if (weightSum > maxWeight) {
                maxNextVertex = next;
                maxWeight = weightSum;
            }
        });

        candidates.delete(maxNextVertex);
        found.push(maxNextVertex);
        cutWeight.push(maxWeight);
    }

    return {
        s: found[found.length - 2],
        t: _.last(found),
        weight: _.last(cutWeight),
    };
};

const mergeVerticesFromCut = (graph, { s, t }) => {
    let result = {
        ..._.omit(graph, t),
    };
    const combinedST = { ..._.omit(graph[s], t) };
    _.each(graph[t], (weight, vert) => {
        if (!combinedST[vert]) {
            combinedST[vert] = weight;
        } else {
            combinedST[vert] += weight;
        }
        result[vert][s] = (result[vert][s] || 0) + weight;
    });

    result = {
        ...result,
        [s]: _.omit(combinedST, s),
    };

    return _.mapValues(result, el => _.omit(el, t));
};

const minCut = incomingGraph => {
    let currentBestPartition = null;
    const partitions = _.mapValues(incomingGraph, (val, key) => [key]);
    let currentBestCut = null;
    let graph = { ...incomingGraph };
    while (_.keys(graph).length > 1 && (!currentBestCut || currentBestCut.weight > 3)) {
        console.log('GraphSize', _.keys(graph).length, 'Current time', new Date().toString());
        const cutOfThePhase = maximumAdjacencySearch(graph);
        if (currentBestCut == null || cutOfThePhase.weight < currentBestCut.weight) {
            currentBestCut = cutOfThePhase;
            currentBestPartition = [...partitions[cutOfThePhase.t]];
        }
        partitions[cutOfThePhase.s] = [
            ...partitions[cutOfThePhase.s],
            ...partitions[cutOfThePhase.t],
        ];
        graph = mergeVerticesFromCut(graph, cutOfThePhase);
    }
    return {
        partition: currentBestPartition,
        bestCut: currentBestCut,
    };
};

const constructMinCutResult = (partitionArray, edges, vertices) => {
    const partition = new Set(partitionArray);
    const first = [];
    const second = [];
    const cutEdges = [];

    vertices.forEach(v => {
        if (partition.has(v)) {
            first.push(v);
        } else {
            second.push(v);
        }
    });
    edges.forEach(([start, end]) => {
        if ((first.indexOf(start) !== -1 && second.indexOf(end) !== -1)
            || (first.indexOf(end) !== -1 && second.indexOf(start) !== -1)) {
            cutEdges.push([start, end]);
        }
    });

    return {
        first,
        second,
        cutEdges,
    };
};

const part1 = () => {
    const { edges, edgesMap, vertices } = parseLines();

    const { partition } = minCut(edgesMap);

    const { first, second, cutEdges } = constructMinCutResult(partition, edges, vertices);

    console.log(cutEdges);

    return first.length * second.length;
};
// part 1
const answer = part1();
console.log('Part 1:', answer);

// part 2
const answer2 = 0;
console.log('Part 2:', answer2);
