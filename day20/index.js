const fs = require('fs');
const _ = require('lodash');

const lines = fs.readFileSync('./input.txt').toString().split('\n');

const parseInstruction = instruction => {
    const [moduleName, destinations] = instruction.split(' -> ');

    if (moduleName === 'broadcaster') {
        return {
            name: 'broadcaster',
            type: 'broadcaster',
            destinations: destinations.split(', '),
        };
    }

    if (moduleName[0] === '%') {
        return {
            name: moduleName.substring(1, moduleName.length),
            type: 'flip-flop',
            destinations: destinations.split(', '),
        };
    }

    return {
        name: moduleName.substring(1, moduleName.length),
        type: 'conjunction',
        destinations: destinations.split(', '),
    };
};

const instructions = _.keyBy(lines.map(parseInstruction), 'name');

const createInitialState = () => {
    const initialState = {};

    _.filter(instructions, { type: 'conjunction' })
        .forEach(conjunction => {
            const inputModules = _.filter(
                instructions,
                instruction => _.indexOf(instruction.destinations, conjunction.name) !== -1,
            );

            initialState[conjunction.name] = _.mapValues(_.keyBy(inputModules, 'name'), () => 'low');
        });

    _.filter(instructions, { type: 'flip-flop' })
        .forEach(flipFlop => {
            initialState[flipFlop.name] = 'off';
        });

    return initialState;
};

const processSignal = ({ signal: { from, to, signalType }, state }) => {
    const toInstruction = instructions[to];
    if (!toInstruction) {
        return {
            newSignals: [],
            stateToUpdate: {},
        };
    }

    if (toInstruction.type === 'broadcaster') {
        return {
            newSignals: _.map(toInstruction.destinations, destination => ({
                from: toInstruction.name,
                to: destination,
                signalType,
            })),
            stateToUpdate: {},
        };
    }

    if (toInstruction.type === 'flip-flop') {
        if (signalType === 'low') {
            return {
                newSignals: _.map(toInstruction.destinations, destination => ({
                    from: toInstruction.name,
                    to: destination,
                    signalType: state[to] === 'off' ? 'high' : 'low',
                })),
                stateToUpdate: {
                    [toInstruction.name]: state[to] === 'on' ? 'off' : 'on',
                },
            };
        }
    }

    if (toInstruction.type === 'conjunction') {
        const newState = {
            ...state[to],
            [from]: signalType,
        };
        return {
            newSignals: _.map(toInstruction.destinations, destination => ({
                from: toInstruction.name,
                to: destination,
                signalType: _.every(newState, val => val === 'high') ? 'low' : 'high',
            })),
            stateToUpdate: {
                [toInstruction.name]: newState,
            },
        };
    }
    return {
        newSignals: [],
        stateToUpdate: {},
    };
};

const pushButtonOnce = initialState => {
    let state = initialState;
    const signalsQueue = [{
        from: 'button',
        to: 'broadcaster',
        signalType: 'low',
    }];

    const signalsCount = {
        low: 0,
        high: 0,
    };
    while (signalsQueue.length > 0) {
        const signalToResolve = signalsQueue.shift();
        signalsCount[signalToResolve.signalType] += 1;
        const { newSignals, stateToUpdate } = processSignal({ signal: signalToResolve, state });
        state = {
            ...state,
            ...stateToUpdate,
        };
        newSignals.forEach(signal => signalsQueue.push(signal));
    }

    return {
        state,
        signalsCount,
    };
};

// part 1
const solvePart1 = (length = 1000) => {
    const state = {
        state: createInitialState(),
        stepCount: {
            low: 0,
            high: 0,
        },
    };

    const memory = [];
    let repeatIndex = -1;
    let numberOfSteps = 0;
    while (repeatIndex === -1 && numberOfSteps < 1000) {
        const newState = pushButtonOnce(memory.length ? _.last(memory).state : state.state);

        repeatIndex = _.findIndex(memory, value => _.isEqual(value, newState));
        numberOfSteps += 1;

        if (repeatIndex === -1) {
            memory.push(newState);
        }
    }

    if (repeatIndex === -1) {
        const countHead = _.range(0, length).reduce(
            (sum, ind) => ({
                low: sum.low + memory[ind].signalsCount.low,
                high: sum.high + memory[ind].signalsCount.high,

            }),
            { low: 0, high: 0 },
        );

        return countHead.low * countHead.high;
    }

    const headLength = repeatIndex;
    const cycleLength = memory.length - repeatIndex;

    const countHead = _.range(0, headLength).reduce(
        (sum, ind) => ({
            low: sum.low + memory[ind].signalsCount.low,
            high: sum.high + memory[ind].signalsCount.high,

        }),
        { low: 0, high: 0 },
    );

    const countCycle = _.range(headLength, headLength + cycleLength).reduce(
        (sum, ind) => ({
            low: sum.low + memory[ind].signalsCount.low,
            high: sum.high + memory[ind].signalsCount.high,

        }),
        { low: 0, high: 0 },
    );

    const countTail = _.range(headLength, headLength + (length % cycleLength)).reduce(
        (sum, ind) => ({
            low: sum.low + memory[ind].signalsCount.low,
            high: sum.high + memory[ind].signalsCount.high,

        }),
        { low: 0, high: 0 },
    );

    const low = countHead.low + countTail.low
        + countCycle.low * Math.floor(length / cycleLength);
    const high = countHead.high + countTail.high
        + countCycle.high * Math.floor(length / cycleLength);

    return low * high;
};
const answer = solvePart1();
console.log('Part 1:', answer);

// part 2
const solvePart2 = () => {
    const importantComs = ['gk', 'fv', 'sl', 'rt'];

    const generateSubstate = comName => {
        const queue = [comName];
        const result = [comName];
        while (queue.length > 0) {
            const newName = queue.shift();
            if (instructions[newName]) {
                _.each(instructions[newName].destinations, val => {
                    if (instructions[val].type === 'flip-flop' && result.indexOf(val) === -1) {
                        result.push(val);
                        queue.push(val);
                    }
                });
            }
        }
        return result;
    };

    const substates = _.fromPairs(_.map(importantComs, com => [com, generateSubstate(com)]));

    const stateDef = {
        state: createInitialState(),
        stepCount: {
            low: 0,
            high: 0,
        },
    };

    const memory = [];
    const repeatIndexes = _.fromPairs(_.map(importantComs, com => [com, -1]));

    let numberOfSteps = 0;
    while (_.some(repeatIndexes, i => i === -1) && numberOfSteps < 10000) {
        const newState = pushButtonOnce(memory.length ? _.last(memory).state : stateDef.state);

        _.forEach(importantComs, comName => {
            if (repeatIndexes[comName] === -1) {
                repeatIndexes[comName] = _.findIndex(
                    memory,
                    value => _.isEqual(
                        _.pick(value.state, substates[comName]),
                        _.pick(newState.state, substates[comName]),
                    ),
                ) !== -1 ? numberOfSteps : -1;
            }
        });

        numberOfSteps += 1;

        memory.push(newState);
    }

    return repeatIndexes;
};

const answer2 = _.reduce(solvePart2(), (prod, val) => prod * val, 1);

console.log('Part 2:', answer2);
