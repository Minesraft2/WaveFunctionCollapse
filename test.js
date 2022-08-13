class Tile {
    constructor(src) {
        this.img = new Image();
        this.img.src = src;
    }
}
// const { PATH_START, PATH, GRASS, TREES, PATH_END } = {
//     PATH_START: 0,
//     PATH: 1,
//     GRASS: 2,
//     TREES: 3,
//     PATH_END: 4
// }
// const IMAGES = {
//     [PATH_START]: new Tile('./Tiles/test/pathStart.png'),
//     [PATH]: new Tile('./Tiles/test/path.png'),
//     [GRASS]: new Tile('./Tiles/test/grass.png'),
//     [TREES]: new Tile('./Tiles/test/trees.png'),
//     [PATH_END]: new Tile('./Tiles/test/pathEnd.png'),
// }
// const input = [
//     [2, 2, 2, 2, 2],
//     [2, 3, 3, 3, 2],
//     [2, 3, 3, 3, 2],
//     [2, 3, 3, 2, 2],
//     [0, 1, 1, 4, 2],
// ];

const { BLANK, T1, T2, T3, T4 } = {
    BLANK: 0,
    T1: 1,
    T2: 2,
    T3: 3,
    T4: 4,
}

const IMAGES = {
    [BLANK]: new Tile('./Tiles/0.png'),
    [T1]: new Tile('./Tiles/1.png'),
    [T2]: new Tile('./Tiles/4.png'),
    [T3]: new Tile('./Tiles/5.png'),
    [T4]: new Tile('./Tiles/6.png'),
}

const input = [
    [0, 1, 2, 3, 4]
]

random(Object.values(IMAGES)).img.onload = animate;
const tiles = [...new Set(input.flat())];
const OUTPUT_SIZE = 16;
const IMAGE_SIZE = 32;

const weights = Object.fromEntries(tiles.map(x => [x, input.flat().filter(y => y === x).length]));
const patternMap = createPatternMap(input);

let patterns = {};

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

patterns = {
    "0": {
        up: new Set([1, 0]),
        down: new Set([3, 0]),
        left: new Set([4, 0]),
        right: new Set([2, 0]),
    },
    "1": {
        up: new Set([2, 3, 4]),
        down: new Set([0, 3]),
        left: new Set([1, 2, 3]),
        right: new Set([1, 3, 4]),
    },
    "2": {
        up: new Set([2, 3, 4]),
        down: new Set([1, 2, 4]),
        left: new Set([0, 4]),
        right: new Set([1, 3, 4]),
    },
    "3": {
        up: new Set([0, 1]),
        down: new Set([1, 2, 4]),
        left: new Set([1, 2, 3]),
        right: new Set([1, 3, 4]),
    },
    "4": {
        up: new Set([2, 3, 4]),
        down: new Set([1, 2, 4]),
        left: new Set([1, 2, 3]),
        right: new Set([0, 2]),
    }
}

function createPatternMap(arr) {
    let rows = arr.map(row => [row[row.length - 1], ...row, row[0]]);
    return [rows[rows.length - 1], ...rows, rows[0]]
}

class Cell {
    constructor(index, options) {
        this.index = index;
        this.options = options || [...tiles];
    }
    get collapsed() {
        return this.options.length <= 1;
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
    const filtered = output.filter(x => !x.collapsed).sort((a, b) => a.options.length - b.options.length).filter((v, i, a) => v.options.length == a[0].options.length);
    let randomCell = random(filtered);
    if (!randomCell) return console.log("No more cells!");
    propagate(randomCell, true);
    drawOutput();
    frame = requestAnimationFrame(animate);
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

function propagate(originCell, chooseRandom = false) {
    const randomOption = chooseRandom ? [weightedRandom(originCell.options.map(pattern => [pattern, weights[pattern]]))] : [...originCell.options];
    const { x, y } = { x: originCell.index % OUTPUT_SIZE, y: Math.floor(originCell.index / OUTPUT_SIZE) };
    let grid = [...output];
    for (const option of originCell.options) {
        if (chooseRandom) {
            if (randomOption.includes(option)) continue;
            originCell.options = originCell.options.filter(x => x !== option);
        }
        if (y > 0 && !grid[x + (y - 1) * OUTPUT_SIZE].collapsed) {
            const targetCell = grid[x + (y - 1) * OUTPUT_SIZE];
            if (targetCell.options.some(opt => !randomOption.some(o => patterns[opt].down.has(o)))) {
                targetCell.options = targetCell.options.filter(opt => randomOption.some(o => patterns[opt].down.has(o)));
                propagate(targetCell);
            }
        }
        if (y < OUTPUT_SIZE - 1 && !grid[x + (y + 1) * OUTPUT_SIZE]?.collapsed) {
            const targetCell = grid[x + (y + 1) * OUTPUT_SIZE];
            if (targetCell.options.some(opt => !randomOption.some(o => patterns[opt].up.has(o)))) {
                targetCell.options = targetCell.options.filter(opt => randomOption.some(o => patterns[opt].up.has(o)));
                propagate(targetCell);
            }
        }
        if (x > 0 && !grid[x - 1 + y * OUTPUT_SIZE]?.collapsed) {
            const targetCell = grid[x - 1 + y * OUTPUT_SIZE];
            if (targetCell.options.some(opt => !randomOption.some(o => patterns[opt].right.has(o)))) {
                targetCell.options = targetCell.options.filter(opt => randomOption.some(o => patterns[opt].right.has(o)));
                propagate(targetCell);
            }
        }
        if (x < OUTPUT_SIZE - 1 && !grid[x + 1 + y * OUTPUT_SIZE]?.collapsed) {
            const targetCell = grid[x + 1 + y * OUTPUT_SIZE];
            if (targetCell.options.some(opt => !randomOption.some(o => patterns[opt].left.has(o)))) {
                targetCell.options = targetCell.options.filter(opt => randomOption.some(o => patterns[opt].left.has(o)));
                propagate(targetCell);
            }
        }
    }
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

function drawOutput() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (let index = 0; index < OUTPUT_SIZE * OUTPUT_SIZE; index++) {
        const cell = output[index];
        const [x, y] = [index % OUTPUT_SIZE, Math.floor(index / OUTPUT_SIZE)];
        ctx.save();
        ctx.translate(x * IMAGE_SIZE, y * IMAGE_SIZE);
        cell.options.forEach((opt, i) => {
            ctx.globalAlpha = i == 0 ? 1 : 1 / cell.options.length;
            ctx.drawImage(IMAGES[opt].img, 0, 0, IMAGE_SIZE, IMAGE_SIZE)
        });
        // ctx.strokeRect(0, 0, IMAGE_SIZE, IMAGE_SIZE)
        ctx.restore();
    }
}
// setTimeout((() => {
//     while (true) {
//         const filtered = output.filter(x => !x.collapsed).sort((a, b) => a.options.length - b.options.length).filter((v, i, a) => v.options.length == a[0].options.length);
//         let randomCell = random(filtered);
//         if (!randomCell) break;
//         propagate(randomCell, true);
//     }
//     console.log("No more cells!");
//     drawOutput();
// }), 500);