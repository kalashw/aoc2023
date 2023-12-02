const fs = require('fs');
const _ = require('lodash');

const games = fs.readFileSync('./input.txt').toString().split('\n');

// part 1
const gameState = {
    red: 12,
    green: 13,
    blue: 14,
};

const parseGame = gameString => {
    const [gameName, roundStrings] = gameString.split(':');
    const gameId = +gameName.substring(5);

    const rounds = roundStrings
        .trim()
        .split('; ')
        .map(r => r.split(', '));
    return {
        gameId,
        result: _.every(rounds, oneRound => _.every(oneRound, oneColor => {
            const [num, color] = oneColor.split(' ');
            return gameState[color] >= +num;
        })),
    };
};

const answer = _.chain(games)
    .map(parseGame)
    .filter('result')
    .map('gameId')
    .sum()
    .value();

console.log('Part 1:', answer);

// part2
const parseGame2 = gameString => {
    const [, roundStrings] = gameString.split(': ');
    const rounds = roundStrings
        .split('; ')
        .map(r => r.split(', '));

    const minGame = {
        red: 0,
        blue: 0,
        green: 0,
    };

    _.each(rounds, oneRound => _.each(oneRound, r => {
        const [num, color] = r.split(' ');
        if (minGame[color] <= +num) {
            minGame[color] = +num;
        }
    }));
    return minGame.red * minGame.blue * minGame.green;
};

const answer2 = _.chain(games)
    .map(parseGame2)
    .sum()
    .value();

console.log('Part 2:', answer2);
