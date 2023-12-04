const fs = require('fs');
const _ = require('lodash'); //

const cards = fs.readFileSync('./input.txt').toString().split('\n');

const parseCard = card => {
    const [gameString, numbers] = card.split(': ');
    const [winningNumbersString, scratchNumbersString] = numbers.split('| ');

    const winningNumbers = _.filter(winningNumbersString.trim().split(' '));
    const scratchNumbers = _.filter(scratchNumbersString.trim().split(' '));
    const gameId = gameString.substring(5).trim();

    return {
        gameId: +gameId,
        winningNumbers,
        scratchNumbers,
    };
};

const countPoints = ({ winningNumbers, scratchNumbers }) => (_.intersection(winningNumbers, scratchNumbers).length > 0
    ? 2 ** (_.intersection(winningNumbers, scratchNumbers).length - 1)
    : 0);

const answer = _.chain(cards)
    .map(parseCard)
    .map(countPoints)
    .sum()
    .value();

console.log('Part 1:', answer);

// part 2
const winningScratchCardsCount = {};
_.times(cards.length, index => {
    winningScratchCardsCount[index + 1] = 1;
});

const countScratchCard = gameId => {
    const { winningNumbers, scratchNumbers } = parseCard(cards[gameId - 1]);
    const nextCardsCount = _.intersection(winningNumbers, scratchNumbers).length;
    _.times(nextCardsCount, index => {
        if (gameId + index + 1 <= cards.length) {
            winningScratchCardsCount[gameId + index + 1] += winningScratchCardsCount[gameId];
        }
    });
};

let gameId = 1;

while (winningScratchCardsCount[gameId] && gameId <= cards.length) {
    countScratchCard(gameId);
    gameId += 1;
}

const answer2 = _.chain(winningScratchCardsCount)
    .map(x => x)
    .sum()
    .value();

console.log(winningScratchCardsCount);

console.log('Part 2:', answer2);
