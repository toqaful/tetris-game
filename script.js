const canvas = document.getElementById('tetris');
const context = canvas.getContext('2d');
const scoreElement = document.getElementById('score');
context.scale(20, 20); // Scale the canvas by 20 to make each block larger

let score = 0;

// Create the grid (10x20)
const grid = createMatrix(10, 20);

// Colors for the blocks
const colors = [
    null,     // No block
    'cyan',    // I piece
    'blue',    // J piece
    'orange',  // L piece
    'yellow',  // O piece
    'green',   // S piece
    'purple',  // T piece
    'red',     // Z piece
];

// Create the player's piece
let player = {
    pos: { x: 0, y: 0 },
    matrix: null,
    color: 1,  // This will hold the current color index
    score: 0
};

// Function to create a matrix (grid or piece)
function createMatrix(w, h) {
    const matrix = [];
    while (h--) {
        matrix.push(new Array(w).fill(0));
    }
    return matrix;
}

// Function to create a new Tetrimino
function createPiece(type) {
    if (type === 'T') {
        return [
            [0, 7, 0],
            [7, 7, 7],
            [0, 0, 0],
        ];
    } else if (type === 'O') {
        return [
            [4, 4],
            [4, 4],
        ];
    } else if (type === 'L') {
        return [
            [0, 0, 3],
            [3, 3, 3],
            [0, 0, 0],
        ];
    } else if (type === 'J') {
        return [
            [2, 0, 0],
            [2, 2, 2],
            [0, 0, 0],
        ];
    } else if (type === 'I') {
        return [
            [0, 0, 0, 0],
            [1, 1, 1, 1],
            [0, 0, 0, 0],
        ];
    } else if (type === 'S') {
        return [
            [0, 5, 5],
            [5, 5, 0],
            [0, 0, 0],
        ];
    } else if (type === 'Z') {
        return [
            [6, 6, 0],
            [0, 6, 6],
            [0, 0, 0],
        ];
    }
}

// Function to draw the matrix on the canvas
function drawMatrix(matrix, offset) {
    matrix.forEach((row, y) => {
        row.forEach((value, x) => {
            if (value !== 0) {
                context.fillStyle = colors[value];
                context.fillRect(x + offset.x, y + offset.y, 1, 1);
            }
        });
    });
}

// Function to detect collision
function collide(grid, player) {
    const [matrix, offset] = [player.matrix, player.pos];
    for (let y = 0; y < matrix.length; ++y) {
        for (let x = 0; x < matrix[y].length; ++x) {
            if (matrix[y][x] !== 0 &&
                (grid[y + offset.y] &&
                 grid[y + offset.y][x + offset.x]) !== 0) {
                return true;
            }
        }
    }
    return false;
}

// Function to merge the player's piece with the grid
function merge(grid, player) {
    player.matrix.forEach((row, y) => {
        row.forEach((value, x) => {
            if (value !== 0) {
                grid[y + player.pos.y][x + player.pos.x] = value;
            }
        });
    });
}

// Function to draw the entire grid and the player's piece
function draw() {
    context.fillStyle = '#000';
    context.fillRect(0, 0, canvas.width, canvas.height);

    drawMatrix(grid, { x: 0, y: 0 });
    drawMatrix(player.matrix, player.pos);
}

// Function to drop the player's piece
function playerDrop() {
    player.pos.y++;
    if (collide(grid, player)) {
        player.pos.y--;
        merge(grid, player);
        resetPlayer();
        gridSweep();
        updateScore();
    }
    dropCounter = 0;
}

// **New Function** for Hard Drop (Space Bar)
function playerHardDrop() {
    while (!collide(grid, player)) {
        player.pos.y++;  // Keep moving down until collision
    }
    player.pos.y--;  // Move one step back to avoid overlap
    merge(grid, player);  // Merge the piece into the grid
    resetPlayer();  // Reset the player to the next piece
    gridSweep();  // Sweep the grid for full lines
    updateScore();  // Update the score after the drop
    dropCounter = 0;
}

// Function to move the player's piece left or right
function playerMove(dir) {
    player.pos.x += dir;
    if (collide(grid, player)) {
        player.pos.x -= dir;
    }
}

// Function to rotate the player's piece
function rotate(matrix) {
    const rotated = matrix.map((_, i) => matrix.map(row => row[i])).reverse();
    return rotated;
}

function playerRotate() {
    const pos = player.pos.x;
    let offset = 1;
    player.matrix = rotate(player.matrix);
    while (collide(grid, player)) {
        player.pos.x += offset;
        offset = -(offset + (offset > 0 ? 1 : -1));
        if (offset > player.matrix[0].length) {
            player.matrix = rotate(player.matrix);
            player.pos.x = pos;
            return;
        }
    }
}

// Function to reset the player's piece after it merges with the grid
function resetPlayer() {
    const pieces = 'TJLOSZI';
    const piece = pieces[Math.floor(pieces.length * Math.random())];
    player.matrix = createPiece(piece);
    player.pos.y = 0;
    player.pos.x = (grid[0].length / 2 | 0) - (player.matrix[0].length / 2 | 0);
    if (collide(grid, player)) {
        grid.forEach(row => row.fill(0));
        player.score = 0;
        updateScore();
    }
}

// Function to clear completed lines and update score
function gridSweep() {
    outer: for (let y = grid.length - 1; y > 0; --y) {
        for (let x = 0; x < grid[y].length; ++x) {
            if (grid[y][x] === 0) {
                continue outer;
            }
        }

        const row = grid.splice(y, 1)[0].fill(0);
        grid.unshift(row);
        ++y;

        player.score += 10;
    }
}

// Function to update the score
function updateScore() {
    scoreElement.innerText = `Score: ${player.score}`;
}

// Variables to handle timing of piece drop
let dropCounter = 0;
let dropInterval = 1000;

let lastTime = 0;

function update(time = 0) {
    const deltaTime = time - lastTime;
    lastTime = time;

    dropCounter += deltaTime;
    if (dropCounter > dropInterval) {
        playerDrop();
    }

    draw();
    requestAnimationFrame(update);
}

// Initialize the game
function startGame() {
    resetPlayer();
    updateScore();
    update();
}

document.addEventListener('keydown', event => {
    if (event.keyCode === 37) {
        playerMove(-1); // Left
    } else if (event.keyCode === 39) {
        playerMove(1); // Right
    } else if (event.keyCode === 40) {
        playerDrop(); // Down
    } else if (event.keyCode === 38) {
        playerRotate(); // Up (rotate)
    } else if (event.keyCode === 32) {
        playerHardDrop(); // Space (hard drop)
    }
});

// Start the game
startGame();
