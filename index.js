const canvas = document.querySelector('canvas');
const ctx = canvas.getContext('2d');

const dim = 30;
const tileSize = 30 * 2;
canvas.width = dim * tileSize;
canvas.height = dim * tileSize;
class Tile {
    constructor(src, edges, rotation) {
        this.img = new Image();
        this.img.src = src;
        this.edges = edges;
        this.up = [];
        this.right = [];
        this.down = [];
        this.left = [];
        this.rotation = (rotation || 0) * Math.PI / 2;
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
tiles[0] = new Tile(`./tiles/0.png`, ["AAA", "AAA", "AAA", "AAA"]);
tiles[1] = new Tile(`./tiles/1.png`, ["ABA", "ABA", "AAA", "ABA"]);
tiles[2] = tiles[1].rotate(1);
tiles[3] = tiles[1].rotate(2);
tiles[4] = tiles[1].rotate(3);
/* tiles[5] = new Tile(`./tiles/2.png`, ["ABA", "AAA", "AAA", "AAA"]);
tiles[6] = tiles[5].rotate(1);
tiles[7] = tiles[5].rotate(2);
tiles[8] = tiles[5].rotate(3); */

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
            ctx.strokeStyle = "white";
            ctx.fillStyle = "rgba(128, 0, 255, 0.5)";
            ctx.lineWidth = 2;
            let cell = grid[index];
            ctx.save();
            ctx.translate(x * tileSize, y * tileSize)
            if (cell.collapsed) {
                let drawTile = cell.options[0];
                if (drawTile.rotation !== 0) {
                    ctx.translate(tileSize / 2, tileSize / 2)
                    ctx.rotate(drawTile.rotation);
                    ctx.drawImage(drawTile.img, -tileSize / 2, -tileSize / 2, tileSize, tileSize);
                } else ctx.drawImage(drawTile.img, 0, 0, tileSize, tileSize);
            }
            else ctx.fillRect(0, 0, tileSize, tileSize);
            ctx.restore();
            //ctx.strokeRect(x * tileSize, y * tileSize, tileSize, tileSize);
        }
    let leastEntropy = random(grid.filter(tile => !tile.collapsed).sort(({ options: a }, { options: b }) => a.length - b.length).filter((v, i, a) => v.options.length == a[0].options.length));
    if (leastEntropy) {
        leastEntropy.collapsed = true;
        leastEntropy.options = [random(leastEntropy.options)];
        grid = grid.map(cell => {
            cell.options[0] == null && (grid = new Array(dim * dim).fill(0).map((_, i) => new Cell(i)));
            cell.options[0] ||= tiles[0]
            return cell;
        })
    }
    const nextGrid = [];
    for (let j = 0; j < dim; j++) {
        for (let i = 0; i < dim; i++) {
            let index = i + j * dim;
            //console.log(grid[index].options)
            if (grid[index].collapsed) {
                nextGrid[index] = grid[index];
            }
            else {
                let options = new Array(tiles.length).fill(0).map((x, i) => i);
                //console.log(grid[i + (j - 1) * dim], grid[i + 1 + j * dim], grid[i + (j + 1) * dim], grid[i - 1 + j * dim])
                // Look up
                if (j > 0) {
                    let up = grid[i + (j - 1) * dim];
                    //console.log({ up, index })
                    let validOptions = [];
                    for (let option of up.options) {
                        let valid = option.down;
                        validOptions = validOptions.concat(valid);
                    }
                    checkValid(options, validOptions);
                }
                // Look right
                if (i < dim - 1) {
                    let right = grid[i + 1 + j * dim];
                    //console.log({ right, index })
                    let validOptions = [];
                    for (let option of right.options) {
                        let valid = option.left;
                        validOptions = validOptions.concat(valid);
                    }
                    checkValid(options, validOptions);
                }
                // Look down
                if (j < dim - 1) {
                    let down = grid[i + (j + 1) * dim];
                    //console.log({ down, index })
                    let validOptions = [];
                    for (let option of down.options) {
                        let valid = option.up;
                        validOptions = validOptions.concat(valid);
                    }
                    checkValid(options, validOptions);
                }
                // Look left
                if (i > 0) {
                    let left = grid[i - 1 + j * dim];
                    //console.log({ left, index })
                    let validOptions = [];
                    for (let option of left.options) {
                        let valid = option.right;
                        validOptions = validOptions.concat(valid);
                    }
                    checkValid(options, validOptions);
                }

                // I could immediately collapse if only one option left?
                nextGrid[index] = new Cell(index, options.map((x) => {
                    tiles[x] == undefined && console.log(x, tiles[x])
                    return tiles[x]
                }));
            }
        }
    }

    grid = nextGrid;
    requestAnimationFrame(animate);
}
animate()

function checkValid(arr, valid) {
    for (let i = arr.length - 1; i >= 0; i--) {
        // VALID: [BLANK, RIGHT]
        // ARR: [BLANK, UP, RIGHT, DOWN, LEFT]
        // result in removing UP, DOWN, LEFT
        let element = arr[i];
        if (!valid.includes(element)) {
            arr.splice(i, 1);
        }
    }
}