const fs = require('fs');
const _ = require('lodash');

const almanacLines = fs.readFileSync('./input.txt').toString().split('\n');

const almanacWords = [
    'seed',
    'soil',
    'fertilizer',
    'water',
    'light',
    'temperature',
    'humidity',
    'location',
];

const values = {};

values[almanacWords[0]] = almanacLines[0].substring(7).split(' ').map(_.toNumber);

const maps = {};
const parseAlmanac = wordIndex => {
    const previousWord = almanacWords[wordIndex - 1];
    const currentWord = almanacWords[wordIndex];
    const nextWord = almanacWords[wordIndex + 1];
    const startLineIndex = _.findIndex(almanacLines, lines => _.startsWith(lines, `${previousWord}-to-${currentWord}`));
    const endLineIndex = _.findIndex(almanacLines, lines => _.startsWith(lines, `${currentWord}-to-${nextWord}`));
    const linesToParse = almanacLines.slice(startLineIndex + 1, endLineIndex - 1);

    maps[currentWord] = linesToParse.map(line => {
        const [destinationStart, sourceStart, length] = line.split(' ');
        return {
            destinationStart: +destinationStart,
            sourceStart: +sourceStart,
            sourceEnd: (+sourceStart) + +length,
        };
    });
};

_.times(almanacWords.length - 1, i => parseAlmanac(i + 1));

const calculateValues = wordIndex => {
    const previousValues = values[almanacWords[wordIndex - 1]];
    const currentWord = almanacWords[wordIndex];
    const map = maps[currentWord];
    values[almanacWords[wordIndex]] = previousValues.map(value => {
        const specificMap = map.find(
            m => m.sourceStart <= value && value < m.sourceEnd,
        );
        return specificMap
            ? specificMap.destinationStart + value - specificMap.sourceStart
            : value;
    });
};

_.times(almanacWords.length - 1, i => calculateValues(i + 1));

console.log('Part 1:', _.min(values.location));

// part 2

const values2 = {};

values2[almanacWords[0]] = _.chain(almanacLines[0].substring(7))
    .split(' ')
    .map(_.toNumber)
    .chunk(2)
    .map(([start, length]) => ({
        start,
        end: start + length,
    }))
    .value();

const calculateValues2 = wordIndex => {
    const previousValues = values2[almanacWords[wordIndex - 1]];
    const currentWord = almanacWords[wordIndex];
    values2[currentWord] = [];
    const map = maps[currentWord];
    previousValues.forEach(value => {
        let currentValues = [value];
        _.each(
            map,
            m => {
                const newValues = [];
                _.each(currentValues, val => {
                    if (m.sourceStart < val.end && val.start < m.sourceEnd) {
                        const delta = m.destinationStart - m.sourceStart;
                        values2[currentWord].push({
                            start: _.max([m.sourceStart, val.start]) + delta,
                            end: _.min([val.end, m.sourceEnd]) + delta,
                        });
                        if (m.sourceStart > val.start) {
                            newValues.push({
                                start: val.start,
                                end: m.sourceStart,
                            });
                        }
                        if (m.sourceEnd < val.end) {
                            newValues.push({
                                start: m.sourceEnd,
                                end: val.end,
                            });
                        }
                    } else {
                        newValues.push(val);
                    }
                });
                currentValues = newValues;
            },
        );
        values2[currentWord] = [...values2[currentWord], ...currentValues];
    });
};

_.times(almanacWords.length - 1, i => calculateValues2(i + 1));

console.log('Part 2:', _.min(values2.location.map(loc => loc.start)));
