const fs = require('fs');
const _ = require('lodash');

const lines = fs.readFileSync('./input.txt').toString().split('\n');

const parseLine = line => {
    const [symbols, numbers] = line.split(' ');
    return {
        symbols,
        numbers: numbers.split(',').map(num => +num),
    };
};

const integerPartition = (length, count) => {
    if (count === 1) {
        return [[length]];
    }
    return _.flatMap(
        _.range(0, length + 1),
        ind => integerPartition(length - ind, count - 1)
            .map(arr => [ind, ...arr]),
    );
};

const generateCombinations = (numbers, length) => {
    const baseCode = numbers.map(num => _.repeat('#', num));
    const numbedOfDotsToAdd = length - _.sum(numbers) - numbers.length + 1;

    const partitions = integerPartition(numbedOfDotsToAdd, numbers.length + 1);
    return _.map(partitions, partition => {
        let result = _.repeat('.', partition[0]);
        _.times(numbers.length, index => {
            result += `${baseCode[index]}.${_.repeat('.', partition[index + 1])}`;
        });
        return result.substring(0, result.length - 1);
    });
};

const checkCombination = (combination, symbols) => !combination || _.every(
    combination,
    (char, ind) => symbols[ind] === '?' || symbols[ind] === char,
);

const answer1 = _.chain(lines)
    .map(parseLine)
    .map(({ symbols, numbers }) => {
        const allCombinations = generateCombinations(numbers, symbols.length)
            .filter(combination => checkCombination(combination, symbols));
        return allCombinations.length;
    })
    .sum()
    .value();
console.log('Part 1:', answer1);

// part 2

const memo = {};

const countCombinations = ({ symbols, numbers }) => {
    const hash = JSON.stringify({ symbols, numbers });

    if (memo[hash]) {
        return memo[hash];
    }
    if (symbols.length === 0 && numbers.length === 0) {
        memo[hash] = 1;
        return 1;
    }
    if (symbols.length === 0 && numbers.length !== 0) {
        memo[hash] = 0;
        return 0;
    }

    if (symbols.length < _.sum(numbers) + numbers.length - 1) {
        memo[hash] = 0;
        return 0;
    }

    if (numbers.length === 0) {
        memo[hash] = _.every(symbols, symbol => symbol !== '#');
        return memo[hash];
    }

    if (symbols[0] === '.') {
        memo[hash] = countCombinations({ symbols: symbols.slice(1), numbers });
        return memo[hash];
    }
    const [firstNumber, ...otherNumbers] = numbers;

    if (symbols[0] === '#') {
        if (_.every(symbols.slice(0, firstNumber), symbol => symbol !== '.') && symbols[firstNumber] !== '#') {
            memo[hash] = countCombinations({
                symbols: symbols.slice(firstNumber + 1),
                numbers: otherNumbers,
            });
            return memo[hash];
        }
        memo[hash] = 0;
        return memo[hash];
    }

    memo[hash] = countCombinations({ symbols: `.${symbols.slice(1)}`, numbers })
        + countCombinations({ symbols: `#${symbols.slice(1)}`, numbers });

    return memo[hash];
};

const answer2 = _.chain(lines)
    .map(parseLine)
    .map(({ symbols, numbers }) => ({
        symbols: `${symbols}?${symbols}?${symbols}?${symbols}?${symbols}`,
        numbers: [...numbers, ...numbers, ...numbers, ...numbers, ...numbers],
    }))
    .map(({ symbols, numbers }, index) => {
        const countHere = countCombinations({ numbers, symbols });
        console.log('Step', index, countHere);
        return countHere;
    })
    .sum()
    .value();

console.log('Part 2:', answer2);
