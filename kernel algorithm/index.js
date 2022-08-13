class Tile {
    constructor(src) {
        this.img = new Image();
        this.img.src = src;
    }
}
const { PATH_START, PATH, GRASS, TREES, PATH_END } = {
    PATH_START: 0,
    PATH: 1,
    GRASS: 2,
    TREES: 3,
    PATH_END: 4
}
const IMAGES = {
    [PATH_START]: new Tile('./Tiles/test/pathStart.png'),
    [PATH]: new Tile('./Tiles/test/path.png'),
    [GRASS]: new Tile('./Tiles/test/grass.png'),
    [TREES]: new Tile('./Tiles/test/trees.png'),
    [PATH_END]: new Tile('./Tiles/test/pathEnd.png'),
}
const input = [
    [2, 2, 2, 2, 2],
    [2, 3, 3, 3, 2],
    [2, 3, 3, 3, 2],
    [2, 3, 3, 3, 2],
    [0, 1, 1, 4, 2]
];

// const { SKY, BUILDING, WINDOW } = {
//     SKY: 0,
//     BUILDING: 1,
//     WINDOW: 2
// }
// const IMAGES = {
//     [SKY]: new Tile('./tiles/buildings/0.png'),
//     [BUILDING]: new Tile('./tiles/buildings/1.png'),
//     [WINDOW]: new Tile('./tiles/buildings/2.png')
// }
// const input =
//     `
// 22222
// 21112
// 21012
// 21112
// 22222`.split('\n').map(x => x.split('').map(Number)).filter(x => x.length);
const patternSize = 2;
const patternOffset = patternSize - 1
random(Object.values(IMAGES)).img.onload = animate;
const tiles = [...new Set(input.flat())];
const OUTPUT_SIZE = 16;
const IMAGE_SIZE = 32;

const weights = Object.fromEntries(tiles.map(x => [x, input.flat().filter(y => y === x).length]));
const patternMap = /* [...input].map(x => [...x])// */createPatternMap(input, patternOffset);

const patterns = {};


for (let tile of tiles) {
    patterns[tile] = { up: new Set(), down: new Set(), left: new Set(), right: new Set() };
    for (let row = 0; row < patternMap.length; row++)
        for (let col = 0; col < patternMap[row].length; col++) {
            const curTile = patternMap[row][col];
            if (curTile !== tile) continue;
            if (row > 0) patterns[tile].up.add(patternMap[row - 1][col]);
            if (row < patternMap.length - 1) patterns[tile].down.add(patternMap[row + 1][col]);
            if (col > 0) patterns[tile].left.add(patternMap[row][col - 1]);
            if (col < patternMap[row].length - 1) patterns[tile].right.add(patternMap[row][col + 1]);
        }
}

let patternMatrix = new Set();

for (let y = 0; y < input.length; y++)
    for (let x = 0; x < input[y].length; x++) {
        const pattern = new Array(patternSize).fill(0).map((row, i) => {
            return [...patternMap[patternOffset + i + y]].slice(x + patternOffset, patternSize + (x + patternOffset));
        });
        patternMatrix.add(JSON.stringify(pattern));
    }
patternMatrix = [...patternMatrix].map(x => JSON.parse(x));
function createPatternMap(arr, offset = 1) {
    let rows = arr.map(row => [...[...row].splice(row.length - 1 - offset, offset), ...row, ...[...row].splice(0, offset)]);
    let topPadding = [...rows].splice(rows.length - 1 - offset, offset)
    let lowPadding = [...rows].splice(0, offset);
    let result = [...topPadding, ...rows, ...lowPadding];
    return result;
}

class Cell {
    constructor(index, options, patterns) {
        this.index = index;
        this.options = options || [...tiles];
        this.patterns = patterns || [...patternMatrix];
    }
    get collapsed() {
        return this.options.length <= 1 || this.patterns.length <= 1;
    }
}

let output = new Array(OUTPUT_SIZE * OUTPUT_SIZE).fill(0).map((x, i) => new Cell(i));
let frame;
onclick = animate;
onclick = () => {
    output = new Array(OUTPUT_SIZE * OUTPUT_SIZE).fill(0).map((x, i) => new Cell(i));
    cancelAnimationFrame(frame);
    animate();
}

function animate() {
    const filtered = output.filter(x => !x.collapsed).sort((a, b) => a.patterns.length - b.patterns.length).filter((v, i, a) => v.patterns.length == a[0].patterns.length);
    const randomCell = random(filtered);
    if (randomCell == null) return console.log("No more cells!")
    collapse(randomCell, true);
    drawOutput(indexToPos(randomCell.index));
    frame = requestAnimationFrame(animate);
}

const compare = (a, b) => JSON.stringify(a) === JSON.stringify(b);
function checkOverlap(origin, target, dir) {
    switch (dir) {
        case 'up': {
            const res = new Array(patternSize - 1).fill(0).map((x, i) => {
                return compare(origin[0], target[target.length - 1]);
            });
            return res.some(Boolean);
        }
        case 'down': {
            const res = new Array(patternSize - 1).fill(0).map((x, i) => {
                return compare(origin[origin.length - 1], target[0]);
            });
            return res.some(Boolean);
        }
        case 'left': {
            const res = compare(origin.flatMap(x => x[0]), target.flatMap(x => x[x.length - 1]));
            return res;
        }
        case 'right': {
            const res = compare(origin.flatMap(x => x[x.length - 1]), target.flatMap(x => x[0]));
            return res;
        }
        default: return false;
    }
}

function collapse(originCell, toCollapse = false) {
    const randomPattern = toCollapse ? [random(originCell.patterns)] : [...originCell.patterns];
    const { x, y } = indexToPos(originCell.index);
    const grid = [...output];
    if (toCollapse) originCell.patterns = originCell.patterns.filter(pattern => randomPattern.some(ptn => compare(pattern, ptn)));
    // UP
    if (y > 0 && !grid[posToIndex({ x, y: y - 1 })].collapsed) {
        const target = grid[posToIndex({ x, y: y - 1 })];
        const targetLength = target.patterns.length;
        target.patterns = target.patterns.filter(pattern => originCell.patterns.some(ptn => checkOverlap(ptn, pattern, 'down')));
        if (targetLength !== target.patterns.length) {
            collapse(target);
        }
    }
    // DOWN
    if (y < OUTPUT_SIZE - 1 && !grid[posToIndex({ x, y: y + 1 })].collapsed) {
        const target = grid[posToIndex({ x, y: y + 1 })];
        const targetLength = target.patterns.length;
        target.patterns = target.patterns.filter(pattern => originCell.patterns.some(ptn => checkOverlap(ptn, pattern, 'up')));
        if (targetLength !== target.patterns.length) {
            collapse(target);
        }
    }
    // LEFT
    if (x > 0 && !grid[posToIndex({ x: x - 1, y })].collapsed) {
        const target = grid[posToIndex({ x: x - 1, y })];
        const targetLength = target.patterns.length;
        target.patterns = target.patterns.filter(pattern => originCell.patterns.some(ptn => checkOverlap(ptn, pattern, 'left')));
        if (targetLength !== target.patterns.length) {
            collapse(target);
        }
    }
    // RIGHT
    if (x < OUTPUT_SIZE - 1 && !grid[posToIndex({ x: x + 1, y })].collapsed) {
        const target = grid[posToIndex({ x: x + 1, y })];
        const targetLength = target.patterns.length;
        target.patterns = target.patterns.filter(pattern => originCell.patterns.some(ptn => checkOverlap(ptn, pattern, 'right')));
        if (targetLength !== target.patterns.length) {
            collapse(target);
        }
    }
}

function random(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
}

function weightedRandom(arr) {
    const totalWeight = arr.map(([item, weight]) => weight).reduce((a, b) => a + b, 0);
    const random = Math.random();
    let weighed = 0;
    for (let i = 0; i < arr.length; i++) {
        let [item, weight] = arr.sort((a, b) => b[1] - a[1])[i];
        weighed += weight;
        if (random <= weighed / totalWeight) return item;
    }
}

function randomRange(min, max) {
    return Math.random() * (max - min) + min;
}

function hashCode(string) {
    var hash = 0;
    for (var i = 0; i < string.length; i++) {
        var code = string.charCodeAt(i);
        hash = ((hash << 5) - hash) + code;
        hash = hash & hash;
    }
    return hash;
}

function indexToPos(index) {
    return { x: index % OUTPUT_SIZE, y: Math.floor(index / OUTPUT_SIZE) };
}

function posToIndex({ x, y }) {
    return x + y * OUTPUT_SIZE;
}

// DRAWING STUFF

const canvas = document.querySelector('canvas');
const ctx = canvas.getContext('2d');
canvas.width = canvas.height = IMAGE_SIZE * OUTPUT_SIZE;

function drawOutput(pos) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (let index = 0; index < OUTPUT_SIZE * OUTPUT_SIZE; index++) {
        const cell = output[index];
        const [x, y] = [index % OUTPUT_SIZE, Math.floor(index / OUTPUT_SIZE)];
        ctx.save();
        ctx.translate(x * IMAGE_SIZE, y * IMAGE_SIZE);
        cell.patterns.forEach((pattern, i) => {
            ctx.globalAlpha = 1 / (i && cell.patterns.length);
            for (let y = 0; y < pattern.length; y++)
                for (let x = 0; x < pattern[y].length; x++) {
                    const ptn = IMAGES[pattern[y][x]];
                    ctx.drawImage(ptn.img, x * IMAGE_SIZE, y * IMAGE_SIZE, IMAGE_SIZE, IMAGE_SIZE);
                }
        });
        ctx.restore();
    }
    ctx.strokeRect(pos.x * IMAGE_SIZE, pos.y * IMAGE_SIZE, IMAGE_SIZE * patternSize, IMAGE_SIZE * patternSize)
}