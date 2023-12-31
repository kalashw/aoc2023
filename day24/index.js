const fs = require('fs');
const _ = require('lodash');
const math = require('mathjs');

const lines = fs.readFileSync('./input.txt').toString().split('\n');

const parseLine = line => {
    const [position, velocity] = line.split(' @ ');
    const [x, y, z] = position.split(', ').map(_.toNumber);
    const [vx, vy, vz] = velocity.split(', ').map(_.toNumber);

    return {
        position: {
            x, y, z,
        },
        velocity: {
            x: vx, y: vy, z: vz,
        },
    };
};
const twoVectorsCollide = (vector1, vector2, boundaries) => {
    const [x1, y1, vx1, vy1] = [vector1.position.x, vector1.position.y,
        vector1.velocity.x, vector1.velocity.y];
    const [x2, y2, vx2, vy2] = [vector2.position.x, vector2.position.y,
        vector2.velocity.x, vector2.velocity.y];
    if (vx1 * vy2 - vx2 * vy1 === 0) {
        return false;
    }

    const time1 = (vy2 * (x1 - x2) - vx2 * (y1 - y2)) / (vx2 * vy1 - vx1 * vy2);
    const time2 = (vy1 * (x2 - x1) - vx1 * (y2 - y1)) / (vx1 * vy2 - vx2 * vy1);

    const intersectionX = x1 + vx1 * time1;
    const intersectionY = y1 + vy1 * time1;

    return boundaries.low <= intersectionX && boundaries.high >= intersectionX
        && boundaries.low <= intersectionY && boundaries.high >= intersectionY
         && time1 > 0 && time2 > 0;
};

const part1 = boundaries => {
    const vectors = lines.map(parseLine);
    let counter = 0;

    vectors.forEach((vector1, index) => {
        vectors.slice(index + 1).forEach(vector2 => {
            if (twoVectorsCollide(vector1, vector2, boundaries)) {
            //    console.log(vector1, vector2);
                counter += 1;
            }
        });
    });

    return counter;
};

// part 1
const boundaries = {
    low: 200000000000000,
    high: 400000000000000,
};

// const boundaries = {
//     low: 7,
//     high: 27,
// };
const answer = part1(boundaries);
console.log('Part 1:', answer);

// part 2

const createCoefficients = vector1 => {
    const [x1, y1, vx1, vy1] = [vector1.position.x, vector1.position.y,
        vector1.velocity.x, vector1.velocity.y];
    return {
        coeff: [vy1, -vx1, -y1, x1, -1, 1],
        val: x1 * vy1 - y1 * vx1,
    };
};

const createCoefficients2 = vector1 => {
    const [x1, z1, vx1, vz1] = [vector1.position.x, vector1.position.z,
        vector1.velocity.x, vector1.velocity.z];
    return {
        coeff: [vz1, -vx1, -z1, x1, -1, 1],
        val: x1 * vz1 - z1 * vx1,
    };
};

const part2 = () => {
    const vectors = lines.map(parseLine);
    const matrix = [
        createCoefficients(vectors[0]).coeff,
        createCoefficients(vectors[1]).coeff,
        createCoefficients(vectors[2]).coeff,
        createCoefficients(vectors[3]).coeff,
        createCoefficients(vectors[4]).coeff,
        createCoefficients(vectors[0]).coeff,
    ];
    const val = [
        createCoefficients(vectors[0]).val,
        createCoefficients(vectors[1]).val,
        createCoefficients(vectors[2]).val,
        createCoefficients(vectors[3]).val,
        createCoefficients(vectors[4]).val,
        createCoefficients(vectors[0]).val,
    ];

    const solution = math.lusolve(matrix, val);

    const x = solution[0][0];
    const y = solution[1][0];

    // chose couple different versions of
    // random lines, and rounded solution down because computers can't with big numbers
    const matrix2 = [
        createCoefficients2(vectors[100]).coeff,
        createCoefficients2(vectors[11]).coeff,
        createCoefficients2(vectors[12]).coeff,
        createCoefficients2(vectors[13]).coeff,
        createCoefficients2(vectors[120]).coeff,
        createCoefficients2(vectors[100]).coeff,
    ];
    const val2 = [
        createCoefficients2(vectors[100]).val,
        createCoefficients2(vectors[11]).val,
        createCoefficients2(vectors[12]).val,
        createCoefficients2(vectors[13]).val,
        createCoefficients2(vectors[120]).val,
        createCoefficients2(vectors[100]).val,
    ];

    const solution2 = math.lusolve(matrix2, val2);

    const z = solution2[1][0];

    return x + y + z;
};
const answer2 = part2();
console.log('Part 2:', answer2);
