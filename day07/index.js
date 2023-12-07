const fs = require('fs');
const _ = require('lodash');

const hands = fs.readFileSync('./input.txt').toString().split('\n');

const parseHand = hand => {
    const [cards, bid] = hand.split(' ');
    return {
        cardsString: cards,
        cardsObject: _.reduce(cards, (summary, card) => {
            if (!summary[card]) return { ...summary, [card]: 1 };
            return { ...summary, [card]: summary[card] + 1 };
        }, {}),
        bid: +bid,
    };
};

const combinationRanks = {
    'High card': {
        rank: 0,
        pattern: '11111',
    },
    'One pair': {
        rank: 1,
        pattern: '1112',
    },
    'Two pair': {
        rank: 2,
        pattern: '122',
    },
    'Three of a kind': {
        rank: 3,
        pattern: '113',
    },
    'Full house': {
        rank: 4,
        pattern: '23',
    },
    'Four of a kind': {
        rank: 5,
        pattern: '14',
    },
    'Five of a kind': {
        rank: 6,
        pattern: '5',
    },
};

const calculateCombinationRank = cardsObject => {
    const cardsPattern = _.chain(cardsObject).map(_.identity).sort().value()
        .join('');
    const combinationName = _.findKey(
        combinationRanks,
        { pattern: cardsPattern },
    );

    return combinationRanks[combinationName].rank;
};

const cardsRanking = {
    2: 2,
    3: 3,
    4: 4,
    5: 5,
    6: 6,
    7: 7,
    8: 8,
    9: 9,
    T: 10,
    J: 11,
    Q: 12,
    K: 13,
    A: 14,
};

const numberOfDifferentCards = _.max(Object.values(cardsRanking));
const handSize = 5;
const calculateCardsHandRank = cardString => _.chain(cardString)
    .map((card, index) => cardsRanking[card] * (numberOfDifferentCards + 1) ** (handSize - index))
    .sum()
    .value();

const answer = _.chain(hands)
    .map(parseHand)
    .map(({ cardsString, cardsObject, bid }) => ({
        combinationRank: calculateCombinationRank(cardsObject),
        bid,
        cardsHandRank: calculateCardsHandRank(cardsString),
    }))
    .sortBy(['combinationRank', 'cardsHandRank'])
    .map(({ bid }, index) => bid * (index + 1))
    .sum()
    .value();

console.log('Part 1:', answer);

// part 2
cardsRanking.J = 1;

const calculateCombinationRank2 = cardsObject => {
    const numberOfJays = cardsObject.J || 0;
    if (numberOfJays === 5) {
        return combinationRanks['Five of a kind'].rank;
    }
    const cardsPattern = _.chain(cardsObject)
        .omit('J')
        .map(_.identity)
        .sort()
        .value();
    cardsPattern[cardsPattern.length - 1] += numberOfJays;

    const combinationName = _.findKey(
        combinationRanks,
        { pattern: cardsPattern.join('') },
    );

    return combinationRanks[combinationName].rank;
};

const answer2 = _.chain(hands)
    .map(parseHand)
    .map(({ cardsString, cardsObject, bid }) => ({
        combinationRank: calculateCombinationRank2(cardsObject),
        bid,
        cardsHandRank: calculateCardsHandRank(cardsString),
    }))
    .sortBy(['combinationRank', 'cardsHandRank'])
    .map(({ bid }, index) => bid * (index + 1))
    .sum()
    .value();

console.log('Part 2:', answer2);
