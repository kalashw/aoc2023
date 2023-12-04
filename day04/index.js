const fs = require('fs');
const _ = require('lodash');

const cards = fs.readFileSync('./input.txt').toString().split('\n');

const parseCard = card => {
    const [gameString, numbers] = card.split(': ');
    const [winningNumbersString, scratchNumbersString] = numbers.split('| ');

    const winningNumbers = _.filter(winningNumbersString.trim().split(' '));
    const scratchNumbers = _.filter(scratchNumbersString.trim().split(' '));
    const gameId = +gameString.substring(5).trim();

    return {
        gameId,
        winningNumbers,
        scratchNumbers,
    };
};

const countPoints = ({ winningNumbers, scratchNumbers }) => (_.intersection(
    winningNumbers,
    scratchNumbers,
).length > 0 ? 2 ** (_.intersection(winningNumbers, scratchNumbers).length - 1) : 0);

const answer = _.chain(cards)
    .map(parseCard)
    .map(countPoints)
    .sum()
    .value();

console.log('Part 1:', answer);

// part 2

// creates an object { "1": 1, "2": 1, "3": 1, ... } in a weird way,
// because we hate forEach and times
const cardsInMyHand = _.chain(Array(cards.length))
    .map((val, index) => [index + 1, 1])
    .fromPairs()
    .value();

const countScratchCards = ({ gameId, winningNumbers, scratchNumbers }) => {
    const cardPoints = _.intersection(winningNumbers, scratchNumbers).length;
    _.times(cardPoints, index => {
        cardsInMyHand[gameId + index + 1] += cardsInMyHand[gameId];
    });
    return cardsInMyHand[gameId];
};

const answer2 = _.chain(cards)
    .map(parseCard)
    .map(countScratchCards)
    .sum()
    .value();

console.log('Part 2:', answer2);
