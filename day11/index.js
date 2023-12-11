const fs = require('fs');
const _ = require('lodash');

const lines = fs.readFileSync('./input.txt').toString().split('\n');

const parseLines = () => lines.map(line => line.split(''));

const getAllGalaxyIndexes = galaxyMap => {
    const galaxyRowIndexes = [];
    const galaxyColumnIndexes = [];
    galaxyMap.forEach((galaxyLine, row) => galaxyLine.forEach((el, col) => {
        if (el === '#') {
            galaxyRowIndexes.push(row);
            galaxyColumnIndexes.push(col);
        }
    }));

    return {
        rowIndexes: galaxyRowIndexes,
        colIndexes: galaxyColumnIndexes,
    };
};

const findIndexesToExpand = parsedLines => {
    const colCount = parsedLines[0].length;
    const rowCount = parsedLines.length;
    const emptyRowIndexes = _.map(_.range(0, rowCount), row => {
        const noGalaxy = parsedLines[row].map(char => char === '.').find(bool => !bool);
        return noGalaxy === false ? false : row;
    }).filter(index => index !== false);
    const emptyColIndexes = _.map(_.range(0, colCount), col => {
        const noGalaxy = lines.map(line => line[col] === '.').find(bool => !bool);
        return noGalaxy === false ? false : col;
    }).filter(index => index !== false);

    return {
        emptyRowIndexes,
        emptyColIndexes,
    };
};
const findDifferencesWithExpansion = (galaxies, expansions, expansionMultiple) => {
    const mappedGalaxies = galaxies.map(
        value => ({ value, isGalaxy: true, isExpansion: false }),
    );
    const mappedExpansions = expansions.map(
        value => ({ value, isGalaxy: false, isExpansion: true }),
    );

    const galaxiesAndExpansions = _.sortBy([...mappedGalaxies, ...mappedExpansions], 'value');

    let currentAdditive = 0;
    let galaxiesIndex = 0;
    let result = 0;

    _.each(galaxiesAndExpansions, elem => {
        if (elem.isGalaxy) {
            result += (elem.value + currentAdditive) * (-galaxies.length + 1 + 2 * galaxiesIndex);
            galaxiesIndex += 1;
        } else {
            currentAdditive += expansionMultiple;
        }
    });

    return result;
};

const { rowIndexes, colIndexes } = getAllGalaxyIndexes(parseLines(lines));
const { emptyRowIndexes, emptyColIndexes } = findIndexesToExpand(parseLines(lines));

const answer1 = findDifferencesWithExpansion(rowIndexes, emptyRowIndexes, 1)
    + findDifferencesWithExpansion(colIndexes, emptyColIndexes, 1);

console.log('Part 1:', answer1);

const answer2 = findDifferencesWithExpansion(rowIndexes, emptyRowIndexes, 999999)
    + findDifferencesWithExpansion(colIndexes, emptyColIndexes, 999999);
console.log('Part 2:', answer2);
