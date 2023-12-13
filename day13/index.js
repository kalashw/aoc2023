const fs = require('fs');
const _ = require('lodash');

const patterns = fs.readFileSync('./input.txt').toString().split('\n\n');

const parsePattern = pattern => {
    const linesPattern = pattern.split('\n');
    const splitLines = linesPattern.map(line => line.split(''));

    return {
        linesPattern,
        columnsPattern: _.unzip(splitLines).map(col => col.join('')),
    };
};

const findPatternSymmetry = (pattern, range) => {
    const checkIfIndexIsSymmetric = ind => _.every(
        _.range(0, ind + 1),
        index => 2 * ind - index - 1 >= pattern.length
            || pattern[index] === pattern[2 * ind - index - 1],
    );
    return _.find(range || _.range(1, pattern.length), checkIfIndexIsSymmetric);
};

// part 1
const answer = _.chain(patterns)
    .map(parsePattern)
    .map(({ linesPattern, columnsPattern }) => {
        const linesSymmetry = findPatternSymmetry(linesPattern);
        if (linesSymmetry) return 100 * linesSymmetry;
        return findPatternSymmetry(columnsPattern);
    })
    .sum()
    .value();

console.log('Part 1:', answer);

// part 2
const linesDifferByOneChar = (line1, line2) => {
    let numberOfDiff = false;
    const isNotVeryDifferent = _.every(line1, (char, ind) => {
        if (line2[ind] !== char) {
            if (numberOfDiff !== false) {
                return false;
            }
            numberOfDiff = ind;
            return true;
        }
        return true;
    });
    return {
        oneDifference: isNotVeryDifferent && numberOfDiff !== false,
        oneDifferenceIndex: numberOfDiff,
    };
};
const findPossibleSmudges = pattern => {
    const result = {};
    pattern.forEach((line, lineIndex) => {
        pattern.forEach((line2, line2Index) => {
            const { oneDifference, oneDifferenceIndex } = linesDifferByOneChar(line, line2);
            if (oneDifference) {
                const sortedIndexes = _.sortBy([lineIndex, line2Index]);
                result[`${sortedIndexes[0]}_${sortedIndexes[1]}`] = {
                    rowIndexes: sortedIndexes,
                    charIndex: oneDifferenceIndex,
                };
            }
        });
    });
    return _.map(result, _.identity);
};

const fixSmudge = (pattern, { rowIndexes, charIndex }) => {
    const newPattern1 = [
        ...pattern,
    ];
    newPattern1[rowIndexes[0]] = `${pattern[rowIndexes[0]].substring(0, charIndex)}${
        pattern[rowIndexes[1]][charIndex]
    }${pattern[rowIndexes[0]].substring(charIndex + 1, pattern[0].length)}`;

    const newPattern2 = [...pattern];
    newPattern2[rowIndexes[1]] = `${pattern[rowIndexes[1]].substring(0, charIndex)}${
        pattern[rowIndexes[0]][charIndex]
    }${pattern[rowIndexes[1]].substring(charIndex + 1, pattern[0].length)}`;
    return [newPattern1, newPattern2];
};

const findPatternSymmetryWithSmudges = pattern => {
    const smudges = findPossibleSmudges(pattern);
    let result;
    smudges.find(smudge => {
        const [minInd, maxInd] = smudge.rowIndexes;

        const minRange = Math.max(minInd, Math.ceil((maxInd + 1) / 2));
        const maxRange = Math.min(maxInd + 1, Math.ceil((pattern.length + minInd + 1) / 2));

        const [smudgeFixedPattern1, smudgeFixedPattern2] = fixSmudge(pattern, smudge);
        result = findPatternSymmetry(smudgeFixedPattern1, _.range(minRange, maxRange))
            || findPatternSymmetry(smudgeFixedPattern2, _.range(minRange, maxRange));
        return result;
    });
    return result;
};
const answer2 = _.chain(patterns)
    .map(parsePattern)
    .map(({ linesPattern, columnsPattern }) => {
        const linesSymmetry = findPatternSymmetryWithSmudges(linesPattern);
        if (linesSymmetry) return 100 * linesSymmetry;
        return findPatternSymmetryWithSmudges(columnsPattern);
    })
    .sum()
    .value();
console.log('Part 2:', answer2);
