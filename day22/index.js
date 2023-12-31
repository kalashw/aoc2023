const fs = require('fs');
const _ = require('lodash');

const lines = fs.readFileSync('./input.txt').toString().split('\n');

const parseLine = line => {
    const [cubeString1, cubeString2] = line.split('~');
    const [startX, startY, startZ] = cubeString1.split(',');
    const [endX, endY, endZ] = cubeString2.split(',');

    const isXLength = startX !== endX;
    const isYLength = startY !== endY;

    return {
        // eslint-disable-next-line no-nested-ternary
        orientation: isXLength ? 'x' : (isYLength ? 'y' : 'z'),
        start: {
            x: +startX,
            y: +startY,
            z: +startZ,
        },
        end: {
            x: +endX,
            y: +endY,
            z: +endZ,
        },
        hash: line,
    };
};

const fall = () => {
    const bricks = _.sortBy(lines.map(parseLine), 'start.z');
    const maxX = _.max(bricks.map(brick => _.max([brick.start.x, brick.end.x])));
    const maxY = _.max(bricks.map(brick => _.max([brick.start.y, brick.end.y])));
    const xyView = [...Array(maxX + 1)].map(() => [...Array(maxY + 1)].fill({
        height: 0,
        lastBrickHash: null,
    }));

    const supportedByList = {};
    const stayingOnList = {};

    const dropOneBrick = brick => {
        const {
            orientation, start, end, hash,
        } = brick;

        if (orientation === 'z') {
            const prevBrickHash = xyView[start.x][start.y].lastBrickHash;
            xyView[start.x][start.y] = {
                height: xyView[start.x][start.y].height + end.z - start.z + 1,
                lastBrickHash: hash,
            };
            supportedByList[hash] = [prevBrickHash];
        } else if (orientation === 'x') {
            let maxXHeight = 0;
            let prevBrickHashes = [];
            _.range(start.x, end.x + 1).forEach(x => {
                if (xyView[x][start.y].height > maxXHeight) {
                    maxXHeight = xyView[x][start.y].height;
                    prevBrickHashes = [xyView[x][start.y].lastBrickHash];
                }
                if (xyView[x][start.y].height === maxXHeight) {
                    prevBrickHashes.push(xyView[x][start.y].lastBrickHash);
                }
            });
            _.range(start.x, end.x + 1).forEach(x => {
                xyView[x][start.y] = {
                    height: maxXHeight + 1,
                    lastBrickHash: hash,
                };
            });
            supportedByList[hash] = _.uniq(prevBrickHashes);
        } else if (orientation === 'y') {
            let maxYHeight = 0;
            let prevBrickHashes = [];
            _.range(start.y, end.y + 1).forEach(y => {
                if (xyView[start.x][y].height > maxYHeight) {
                    maxYHeight = xyView[start.x][y].height;
                    prevBrickHashes = [xyView[start.x][y].lastBrickHash];
                }
                if (xyView[start.x][y].height === maxYHeight) {
                    prevBrickHashes.push(xyView[start.x][y].lastBrickHash);
                }
            });
            _.range(start.y, end.y + 1).forEach(y => {
                xyView[start.x][y] = {
                    height: maxYHeight + 1,
                    lastBrickHash: hash,
                };
            });
            supportedByList[hash] = _.uniq(prevBrickHashes);
        }

        _.forEach(supportedByList[hash], el => {
            if (!stayingOnList[el]) {
                stayingOnList[el] = [hash];
            } else {
                stayingOnList[el].push(hash);
            }
        });
    };

    bricks.forEach(dropOneBrick);

    return {
        bricks,
        supportedByList,
        stayingOnList,
    };
};

// // part 1
const part1 = () => {
    const {
        bricks,
        supportedByList,
    } = fall();

    const isImportantBrick = brickHash => _.some(
        supportedByList,
        supportedBy => _.isEqual(supportedBy, [brickHash]),
    );

    return bricks.map(brick => brick.hash).filter(brick => !isImportantBrick(brick)).length;
};

const answer = part1();
console.log('Part 1:', answer);

// part 2
const part2 = () => {
    const {
        bricks,
        supportedByList,
        stayingOnList,
    } = fall();

    return _.sum(bricks.reverse().map(brick => brick.hash).map(brickHash => {
        const currentlyFalling = [brickHash];
        let queue = [
            ...stayingOnList[brickHash] ? stayingOnList[brickHash] : [],
        ];
        while (queue.length) {
            const nextBrick = queue.shift();
            if (_.difference(supportedByList[nextBrick], currentlyFalling).length === 0) {
                if (_.indexOf(currentlyFalling, nextBrick) === -1) {
                    currentlyFalling.push(nextBrick);
                }
                const nextFalling = _.filter(
                    stayingOnList[nextBrick],
                    bHash => _.indexOf(currentlyFalling, bHash) === -1,
                );
                if (nextFalling.length > 0) {
                    queue = [...queue, ...nextFalling];
                }
            }
        }

        return currentlyFalling.length - 1;
    }));
};
const answer2 = part2();
console.log('Part 2:', answer2);
