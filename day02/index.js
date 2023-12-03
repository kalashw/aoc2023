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
    const [gameName, roundString] = gameString.split(': ');
    const gameId = +gameName.substring(5);

    const rounds = roundString
        .split('; ')
        .map(r => r.split(', '));
    return {
        gameId,
        result: _.every(rounds, round => _.every(round, ball => {
            const [count, color] = ball.split(' ');
            return gameState[color] >= +count;
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
    const [, roundString] = gameString.split(': ');
    const rounds = roundString
        .split('; ')
        .map(r => r.split(', '));

    const minGame = {
        red: 0,
        blue: 0,
        green: 0,
    };

    _.each(rounds, round => _.each(round, ball => {
        const [count, color] = ball.split(' ');
        if (minGame[color] <= +count) {
            minGame[color] = +count;
        }
    }));
    return minGame.red * minGame.blue * minGame.green;
};

const answer2 = _.chain(games)
    .map(parseGame2)
    .sum()
    .value();

console.log('Part 2:', answer2);
