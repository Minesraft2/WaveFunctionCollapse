const key = {
    PATH_START: 0,
    PATH: 1,
    GRASS: 2,
    TREES: 3
}
const input = [
    [2, 3, 3],
    [2, 3, 3],
    [0, 1, 1],
];
const OUTPUT_SIZE = 10;
const IMAGE_SIZE = 32;
const patternSize = 2;
const weights = Object.fromEntries([...new Set(input.flat())].map(x => [x, input.flat().filter(y => y === x).length]));
const patternMap = createPatternMap(input);
console.log(patternMap)

function createPatternMap(arr) {
    let rows = arr.map(row => [row[row.length - 1], ...row, row[0]]);
    return [rows[rows.length - 1], ...rows, rows[0]]
}

class Cell {
    constructor(index, options) {
        this.index = index;
        this.options = options || [...new Set(input.flat())];
    }
    get collapsed() {
        return this.options.length <= 1;
    }
}

const output = new Array(OUTPUT_SIZE * OUTPUT_SIZE).fill(0).map((x, i) => new Cell(i));
onclick = animate;

function animate() {
    let randomCell = random(output.filter(x => !x.collapsed).sort((a, b) => a.options.length - b.options.length));
    randomCell.options = [weightedRandom(randomCell.options.map(pattern => [pattern, weights[pattern]]))];
    console.log(randomCell.options[0]);
    drawOutput();
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
        if (random < weighed / totalWeight) return item;
    }
}

const canvas = document.querySelector('canvas');
const ctx = canvas.getContext('2d');
canvas.width = canvas.height = IMAGE_SIZE * OUTPUT_SIZE;

function drawOutput() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (let index = 0; index < OUTPUT_SIZE * OUTPUT_SIZE; index++) {
        const cell = output[index];
        const [x, y] = [index % OUTPUT_SIZE, Math.floor(index / OUTPUT_SIZE)];
        ctx.save();
        ctx.translate(x*IMAGE_SIZE, y*IMAGE_SIZE);
        ctx.fillStyle = "rgba(128, 0, 255, 0.5)";
        ctx.fillRect(0, 0, IMAGE_SIZE, IMAGE_SIZE);
        ctx.fillStyle = "black";
        ctx.fillText(cell.options.length, 13, 20)
        ctx.strokeRect(0, 0, IMAGE_SIZE, IMAGE_SIZE)
        ctx.restore();
    }
}
animate();