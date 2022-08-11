const canvas = document.querySelector('canvas');
const ctx = canvas.getContext('2d');

const dim = 30;
const tileSize = 30 * 2;
canvas.width = dim * tileSize;
canvas.height = dim * tileSize;
class Tile {
    constructor(src, edges, rotation, weight = 100) {
        this.img = new Image();
        this.img.src = src;
        this.edges = edges;
        this.up = [];
        this.right = [];
        this.down = [];
        this.left = [];
        this.rotation = (rotation || 0) * Math.PI / 2;
        this.weight = weight;
        this.index = tiles.indexOf(this);
    }
    analyze(tiles) {
        for (let i = 0; i < tiles.length; i++) {
            let tile = tiles[i];
            if (tile.edges[2] == this.edges[0].split('').reverse().join('')) this.up.push(i);
            if (tile.edges[0] == this.edges[2].split('').reverse().join('')) this.down.push(i);
            if (tile.edges[1] == this.edges[3].split('').reverse().join('')) this.left.push(i);
            if (tile.edges[3] == this.edges[1].split('').reverse().join('')) this.right.push(i);
        }
    }
    rotate(num) {
        const newEdges = [...this.edges];
        for (let i = 0; i < num; i++) newEdges.unshift(newEdges.pop());
        return new Tile(this.img.src, newEdges, num);
    }
}

let tiles = [];

// tiles[0] = new Tile('./tiles/buildings/0.png', ["0", "0", "0", "0"]);//sky
// tiles[1] = new Tile('./tiles/buildings/0.png', ["1", "0", "1", "0"]);//sky that connects to buildings
// tiles[2] = new Tile('./tiles/buildings/1.png', ["1", "2", "1", "2"]);//building
// tiles[3] = new Tile('./tiles/buildings/2.png', ["2", "2", "2", "2"]);//window

// tiles[0] = new Tile('./tiles/test/0.png', ["0", "0", "0", "0"]);
// tiles[1] = new Tile('./tiles/test/1.png', ["0", "1", "2", "1"]);
// tiles[2] = new Tile('./tiles/test/2.png', ["2", "2", "2", "2"]);

// A - dark grey
// B - green
// C - light blue
// D - grey

// tiles[0] = new Tile(`./tiles/circuit/0.png`, ["AAA", "AAA", "AAA", "AAA"]);
// tiles[1] = new Tile(`./tiles/circuit/1.png`, ["BBB", "BBB", "BBB", "BBB"]);
// tiles[2] = new Tile(`./tiles/circuit/2.png`, ["BBB", "BCB", "BBB", "BBB"]);
// tiles[3] = new Tile(`./tiles/circuit/3.png`, ["BBB", "BDB", "BBB", "BDB"]);
// tiles[4] = new Tile(`./tiles/circuit/4.png`, ["ABB", "BCB", "BBA", "AAA"]);
// tiles[5] = new Tile(`./tiles/circuit/5.png`, ["ABB", "BBB", "BBB", "BBA"]);
// tiles[6] = new Tile(`./tiles/circuit/6.png`, ["BBB", "BCB", "BBB", "BCB"]);
// tiles[7] = new Tile(`./tiles/circuit/7.png`, ["BDB", "BCB", "BDB", "BCB"]);
// tiles[8] = new Tile(`./tiles/circuit/8.png`, ["BDB", "BBB", "BCB", "BBB"]);
// tiles[9] = new Tile(`./tiles/circuit/9.png`, ["BCB", "BCB", "BBB", "BCB"]);
// tiles[10] = new Tile(`./tiles/circuit/10.png`, ["BCB", "BCB", "BCB", "BCB"]);
// tiles[11] = new Tile(`./tiles/circuit/11.png`, ["BCB", "BCB", "BBB", "BBB"]);
// tiles[12] = new Tile(`./tiles/circuit/12.png`, ["BBB", "BCB", "BBB", "BCB"]);

// for (let i = 2; i < 11; i++) {
//     for (let j = 0; j < 3; j++) {
//         tiles[7 + i * 3 + j] = tiles[i].rotate(j + 1);
//     }
// }

tiles[0] = new Tile(`./tiles/0.png`, ["AAA", "AAA", "AAA", "AAA"]);
tiles[1] = new Tile(`./tiles/1.png`, ["ABA", "ABA", "AAA", "ABA"]);
tiles[2] = tiles[1].rotate(1);
tiles[3] = tiles[1].rotate(2);
tiles[4] = tiles[1].rotate(3);
// tiles[5] = new Tile(`./tiles/3.png`, ["AAA", "ABA", "AAA", "ABA"]);
// tiles[6] = tiles[5].rotate(1);
tiles[5] = new Tile(`./tiles/2.png`, ["ABA", "AAA", "AAA", "AAA"]);
tiles[6] = tiles[5].rotate(1);
tiles[7] = tiles[5].rotate(2);
tiles[8] = tiles[5].rotate(3);

class Cell {
    constructor(index, options = [...tiles]) {
        this.index = index;
        this.collapsed = false;
        this.options = options;
    }
}

let grid = new Array(dim * dim).fill(0).map((_, i) => new Cell(i));
for (let i = 0; i < tiles.length; i++) {
    const tile = tiles[i];
    tile.analyze(tiles);
}
function random(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
}

function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    for (let y = 0; y < dim; y++)
        for (let x = 0; x < dim; x++) {
            let index = x + y * dim;
            let cell = grid[index];
            ctx.save();
            ctx.globalAlpha = 1 / 1 || cell.options.length
            ctx.translate(x * tileSize, y * tileSize)
            if (cell.collapsed) {
                let drawTile = cell.options[0];
                if (drawTile.rotation !== 0) {
                    ctx.translate(tileSize / 2, tileSize / 2)
                    ctx.rotate(drawTile.rotation);
                    ctx.drawImage(drawTile.img, -tileSize / 2, -tileSize / 2, tileSize, tileSize);
                } else ctx.drawImage(drawTile.img, 0, 0, tileSize, tileSize);
            } else {
                ctx.fillStyle = `rgba(128, 0, 255, ${cell.options.length / tiles.length})`
                ctx.font = '30px Ariel';
                ctx.fillRect(0, 0, tileSize, tileSize);
                ctx.fillStyle = "black"
                ctx.fillText(cell.options.length, tileSize / 3, tileSize / 1.5, tileSize);
                /* cell.options.forEach(tile => {
                    // ctx.fillStyle = 'black';
                    // ctx.fillRect(0, 0, tileSize, tileSize);
                    if (tile.rotation !== 0) {
                        ctx.translate(tileSize / 2, tileSize / 2)
                        ctx.rotate(tile.rotation);
                        ctx.drawImage(tile.img, -tileSize / 2, -tileSize / 2, tileSize, tileSize);
                        ctx.rotate(-tile.rotation);
                        ctx.translate(-tileSize / 2, -tileSize / 2)
                    } else ctx.drawImage(tile.img, 0, 0, tileSize, tileSize);
                    //ctx.strokeRect(0, 0, tileSize, tileSize);
                }); */
            }
            ctx.restore();
            ctx.strokeStyle = "white";
            ctx.lineWidth = 5;
            if (window.showGrid) ctx.strokeRect(x * tileSize, y * tileSize, tileSize, tileSize);
        }
    if (false &&window.testIndex) {
        ctx.strokeStyle = "red";
        ctx.strokeRect(testIndex?.x * tileSize, (testIndex?.y - 1) * tileSize, tileSize, tileSize);

        ctx.strokeStyle = "orange";
        ctx.strokeRect((testIndex?.x + 1) * tileSize, testIndex?.y * tileSize, tileSize, tileSize);

        ctx.strokeStyle = "green";
        ctx.strokeRect(testIndex?.x * tileSize, (testIndex?.y + 1) * tileSize, tileSize, tileSize);

        ctx.strokeStyle = "blue";
        ctx.strokeRect((testIndex?.x - 1) * tileSize, testIndex?.y * tileSize, tileSize, tileSize);

        ctx.strokeStyle = "white";
        ctx.strokeRect(testIndex?.x * tileSize, testIndex?.y * tileSize, tileSize, tileSize);
    }
    let leastEntropy = random(grid.filter(tile => !tile.collapsed).sort(({ options: a }, { options: b }) => a.length - b.length).filter((v, i, a) => v.options.length == a[0].options.length));
    if (leastEntropy) {
        leastEntropy.collapsed = true;
        leastEntropy.options = [random(leastEntropy.options)];
        let broke = false;
        grid = grid.map(cell => {
            if (cell.options[0] == undefined) broke = true;
            return cell;
        });
        if (broke) grid = new Array(dim * dim).fill(0).map((_, i) => new Cell(i));
    }
    const nextGrid = [];
    for (let j = 0; j < dim; j++) {
        for (let i = 0; i < dim; i++) {
            let index = i + j * dim;
            if (grid[index].collapsed) nextGrid[index] = grid[index];
            else checkNeighbors(i, j, nextGrid);
        }
    }
    propagate(leastEntropy?.index, nextGrid);

    grid = nextGrid;
    requestAnimationFrame(animate);
}
animate()
onclick = animate
function checkNeighbors(i, j, nextGrid) {
    let index = i + j * dim;
    let options = new Array(tiles.length).fill(0).map((x, i) => i);
    // Look up
    if (j > 0) {
        let up = grid[i + (j - 1) * dim];
        let validOptions = [];
        for (let option of up.options) validOptions = validOptions.concat(option.down);
        checkValid(options, validOptions);
    }
    // Look right
    if (i < dim - 1) {
        let right = grid[i + 1 + j * dim];
        let validOptions = [];
        for (let option of right.options) validOptions = validOptions.concat(option.left);
        checkValid(options, validOptions);
    }
    // Look down
    if (j < dim - 1) {
        let down = grid[i + (j + 1) * dim];
        let validOptions = [];
        for (let option of down.options) validOptions = validOptions.concat(option.up);
        checkValid(options, validOptions);
    }
    // Look left
    if (i > 0) {
        let left = grid[i - 1 + j * dim];
        let validOptions = [];
        for (let option of left.options) validOptions = validOptions.concat(option.right);
        checkValid(options, validOptions);
    }

    // I could immediately collapse if only one option left?
    nextGrid[index] = new Cell(index, options.map((x) => tiles[x]));
}

/*
    move up
        validOptions = take options from lower one
        
        set options to valid options
*/

function propagate(index) {
    window.testIndex = { x: index % dim, y: Math.floor(index / dim) };
}

function checkValid(neighborOptions, validOptions) {
    //if (neighborOptions.some(opt => typeof opt != "number")) neighborOptions = neighborOptions.forEach((x, i) => neighborOptions[i] = x.index);
    for (let i = neighborOptions.length - 1; i >= 0; i--) if (!validOptions.includes(neighborOptions[i])) neighborOptions.splice(i, 1);
}