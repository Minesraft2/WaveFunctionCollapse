const { PATH_START, PATH, GRASS, TREES, PATH_END } = {
    PATH_START: 0,
    PATH: 1,
    GRASS: 2,
    TREES: 3,
    PATH_END: 4
}
class Tile {
    constructor(src) {
        this.img = new Image();
        this.img.src = src;
    }
}
const IMAGES = {
    [PATH_START]: new Tile('./Tiles/test/pathStart.png'),
    [PATH]: new Tile('./Tiles/test/path.png'),
    [GRASS]: new Tile('./Tiles/test/grass.png'),
    [TREES]: new Tile('./Tiles/test/trees.png'),
    [PATH_END]: new Tile('./Tiles/test/pathEnd.png'),
}
random(Object.values(IMAGES)).img.onload = animate;
const input = [
    [2, 2, 2, 2],
    [2, 3, 3, 2],
    [2, 3, 2, 2],
    [0, 1, 1, 4],
];
const tiles = [...new Set(input.flat())];
const OUTPUT_SIZE = 10;
const IMAGE_SIZE = 32;
//const patternSize = 1;
const weights = Object.fromEntries(tiles.map(x => [x, input.flat().filter(y => y === x).length]));
const patternMap = createPatternMap(input);

const patterns = {};

for (let tile of tiles) {
    patterns[tile] = { up: new Set(), down: new Set(), left: new Set(), right: new Set() };
    for (let row = 0; row < patternMap.length; row++)
        for (let col = 0; col < patternMap[row].length; col++) {
            const curTile = patternMap[row][col];
            if (curTile !== tile) continue;
            // up
            if (row > 0) patterns[tile].up.add(patternMap[row - 1][col]);
            // down
            if (row < patternMap.length - 1) patterns[tile].down.add(patternMap[row + 1][col]);
            // left
            if (col > 0) patterns[tile].left.add(patternMap[row][col - 1]);
            // right
            if (col < patternMap[row].length - 1) patterns[tile].right.add(patternMap[row][col + 1]);
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

const output = new Array(OUTPUT_SIZE * OUTPUT_SIZE).fill(0).map((x, i) => new Cell(i));
onclick = animate;

function animate() {
    const totalWeight = Object.values(weights).reduce((c, d) => c + d)
    const filtered = output.filter(x => !x.collapsed).sort((a, b) => a.options.length - b.options.length).filter((v, i, a) => v.options.length == a[0].options.length);
    let randomCell = random(filtered);
    if (!randomCell) return console.log("No more cells!");
    propagate(randomCell, true);
    drawOutput();
    // requestAnimationFrame(animate);
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
        hash = hash & hash; // Convert to 32bit integer
    }
    return hash;
}

function propagate(originCell, chooseRandom = false) {
    if (!chooseRandom) console.log(indexToPos(originCell.index), "sub prop")
    const randomOption = chooseRandom ? [weightedRandom(originCell.options.map(pattern => [pattern, weights[pattern]]))] : [...originCell.options];
    const { x, y } = { x: originCell.index % OUTPUT_SIZE, y: Math.floor(originCell.index / OUTPUT_SIZE) };
    let grid = [...output];
    for (const option of originCell.options) {
        if (chooseRandom) {
            if (randomOption.includes(option)) continue;
            originCell.options = originCell.options.filter(x => x !== option);
        }
        // up
        if (y > 0 && !grid[x + (y - 1) * OUTPUT_SIZE].collapsed) {
            const targetCell = grid[x + (y - 1) * OUTPUT_SIZE];
            if (targetCell.options.some(opt => !randomOption.some(o => patterns[opt].down.has(o)))) {
                targetCell.options = targetCell.options.filter(opt => randomOption.some(o => patterns[opt].down.has(o)));
                propagate(targetCell);
            }
        }
        // down
        if (y < OUTPUT_SIZE - 1 && !grid[x + (y + 1) * OUTPUT_SIZE]?.collapsed) {
            const targetCell = grid[x + (y + 1) * OUTPUT_SIZE];
            if (targetCell.options.some(opt => !randomOption.some(o => patterns[opt].up.has(o)))) {
                targetCell.options = targetCell.options.filter(opt => randomOption.some(o => patterns[opt].up.has(o)));
                propagate(targetCell);
            }
        }
        // left
        if (x > 0 && !grid[x - 1 + y * OUTPUT_SIZE]?.collapsed) {
            const targetCell = grid[x - 1 + y * OUTPUT_SIZE];
            if (targetCell.options.some(opt => !randomOption.some(o => patterns[opt].right.has(o)))) {
                targetCell.options = targetCell.options.filter(opt => randomOption.some(o => patterns[opt].right.has(o)));
                propagate(targetCell);
                // if (x - 1 > 0 && !grid[x - 2 + y * OUTPUT_SIZE]?.collapsed) {
                //     const subTarget = grid[x - 2 + y * OUTPUT_SIZE];
                //     if (subTarget.options.some(opt => !targetCell.options.some(o => patterns[opt].right.has(o)))) {
                //         subTarget.options = subTarget.options.filter(opt => targetCell.options.some(o => patterns[opt].right.has(o)));
                //         console.log(indexToPos(subTarget.index));
                //     }
                // }
            }
        }
        // right
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
        if (cell.collapsed) {
            ctx.drawImage(IMAGES[cell.options[0]]?.img, 0, 0, IMAGE_SIZE, IMAGE_SIZE)
            // ctx.fillStyle = `rgba(0, 255, 0, ${cell.options.length / tiles.length})`;
            // ctx.fillRect(0, 0, IMAGE_SIZE, IMAGE_SIZE);
            // ctx.fillStyle = "black";
            // ctx.fillText(cell.options[0], 13, 20)
        }
        else {
            ctx.fillStyle = `rgba(128, 0, 255, ${cell.options.length / tiles.length})`;
            ctx.fillRect(0, 0, IMAGE_SIZE, IMAGE_SIZE);
            ctx.fillStyle = "black";
            ctx.fillText(cell.options.length, 13, 20)
        }
        // ctx.strokeRect(0, 0, IMAGE_SIZE, IMAGE_SIZE)
        ctx.restore();
    }
}