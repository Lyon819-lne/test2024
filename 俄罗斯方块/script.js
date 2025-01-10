const canvas = document.getElementById('tetris');
const context = canvas.getContext('2d');
context.scale(20, 20);

let dropCounter = 0;
let dropInterval = 1000;
let lastTime = 0;
let isPaused = false;
let score = 0;
let upgraded = false;

function drawGrid() {
    context.strokeStyle = 'rgba(255, 255, 255, 0.1)';
    for (let x = 0; x < canvas.width / 20; x++) {
        context.beginPath();
        context.moveTo(x, 0);
        context.lineTo(x, canvas.height / 20);
        context.stroke();
    }
    for (let y = 0; y < canvas.height / 20; y++) {
        context.beginPath();
        context.moveTo(0, y);
        context.lineTo(canvas.width / 20, y);
        context.stroke();
    }
}

function drawMatrix(matrix, offset) {
    matrix.forEach((row, y) => {
        row.forEach((value, x) => {
            if (value !== 0) {
                context.fillStyle = `hsl(${Math.random() * 360}, 100%, 50%)`;
                context.fillRect(x + offset.x, y + offset.y, 1, 1);
                context.fillStyle = 'white';
                context.font = '1px Arial';
                context.fillText(value, x + offset.x + 0.1, y + offset.y + 0.9);
            }
        });
    });
}

function draw() {
    context.clearRect(0, 0, canvas.width, canvas.height);
    drawGrid();
    drawMatrix(arena, {x: 0, y: 0});
    drawMatrix(player.matrix, player.pos);
}

function merge(arena, player) {
    player.matrix.forEach((row, y) => {
        row.forEach((value, x) => {
            if (value !== 0) {
                arena[y + player.pos.y][x + player.pos.x] = value;
            }
        });
    });
}

function createMatrix(w, h) {
    const matrix = [];
    while (h--) {
        matrix.push(new Array(w).fill(0));
    }
    return matrix;
}

function createPiece(type) {
    const characters = ['0', '1', '+'];
    const randomChar = characters[Math.floor(Math.random() * characters.length)];

    switch (type) {
        case 'T':
            return [
                [0, randomChar, 0],
                [randomChar, randomChar, randomChar],
                [0, 0, 0],
            ];
        case 'O':
            return [
                [randomChar, randomChar],
                [randomChar, randomChar],
            ];
        case 'L':
            return [
                [0, randomChar, 0],
                [0, randomChar, 0],
                [0, randomChar, randomChar],
            ];
        case 'J':
            return [
                [0, randomChar, 0],
                [0, randomChar, 0],
                [randomChar, randomChar, 0],
            ];
        case 'I':
            return [
                [0, randomChar, 0, 0],
                [0, randomChar, 0, 0],
                [0, randomChar, 0, 0],
                [0, randomChar, 0, 0],
            ];
        case 'S':
            return [
                [0, randomChar, randomChar],
                [randomChar, randomChar, 0],
                [0, 0, 0],
            ];
        case 'Z':
            return [
                [randomChar, randomChar, 0],
                [0, randomChar, randomChar],
                [0, 0, 0],
            ];
        default:
            return [
                [0, 0, 0],
                [0, 0, 0],
                [0, 0, 0],
            ];
    }
}

function playerReset() {
    const pieces = 'TJLOSZI';
    const randomIndex = Math.floor(Math.random() * pieces.length);
    player.matrix = createPiece(pieces[randomIndex]);
    player.pos.y = 0;
    player.pos.x = (arena[0].length / 2 | 0) - (player.matrix[0].length / 2 | 0);
    if (collide(arena, player)) {
        arena.forEach(row => row.fill(0));
        score = 0;
        updateScore();
        document.getElementById('gameOverMessage').style.display = 'block';
    }
}

function collide(arena, player) {
    const [m, o] = [player.matrix, player.pos];
    for (let y = 0; y < m.length; ++y) {
        for (let x = 0; x < m[y].length; ++x) {
            if (m[y][x] !== 0 &&
               (arena[y + o.y] &&
                arena[y + o.y][x + o.x]) !== 0) {
                return true;
            }
        }
    }
    return false;
}

function playerDrop() {
    player.pos.y++;
    if (collide(arena, player)) {
        player.pos.y--;
        merge(arena, player);
        arenaSweep();
        playerReset();
    }
    dropCounter = 0;
}

function playerRotate() {
    const pos = player.pos.x;
    let offset = 1;
    rotate(player.matrix);
    while (collide(arena, player)) {
        player.pos.x += offset;
        offset = -(offset + (offset > 0 ? 1 : -1));
        if (offset > player.matrix[0].length) {
            rotate(player.matrix);
            player.pos.x = pos;
            return;
        }
    }
}

function rotate(matrix) {
    for (let y = 0; y < matrix.length; ++y) {
        for (let x = 0; x < y; ++x) {
            [
                matrix[x][y],
                matrix[y][x],
            ] = [
                matrix[y][x],
                matrix[x][y],
            ];
        }
    }
    matrix.forEach(row => row.reverse());
}

function arenaSweep() {
    outer: for (let y = arena.length - 1; y > 0; --y) {
        for (let x = 0; x < arena[y].length; ++x) {
            if (arena[y][x] === 0) {
                continue outer;
            }
        }
        const row = arena.splice(y, 1)[0].fill(0);
        arena.unshift(row);
        ++y;
        score += 10;
        updateScore();
    }
}

function updateScore() {
    document.getElementById('score').innerText = `分数: ${score}`;
    if (score >= 150 && !upgraded) {
        upgradeDifficulty();
    }
}

function upgradeDifficulty() {
    dropInterval = 200;
    canvas.width = 240;
    canvas.height = 400;
    context.scale(1, 1);
    upgraded = true;
    drawMatrix = function(matrix, offset) {
        matrix.forEach((row, y) => {
            row.forEach((value, x) => {
                if (value !== 0) {
                    context.fillStyle = `hsl(${value * 36 + 180}, 100%, 50%)`;
                    context.fillRect(x + offset.x, y + offset.y, 1, 1);
                }
            });
        });
    };
}

function update(time = 0) {
    if (isPaused) return;
    const deltaTime = time - lastTime;
    lastTime = time;

    dropCounter += deltaTime;
    if (dropCounter > dropInterval) {
        playerDrop();
    }

    draw();
    requestAnimationFrame(update);
}

const arena = createMatrix(12, 20);
const player = {
    pos: {x: 0, y: 0},
    matrix: null,
};

document.addEventListener('keydown', event => {
    if (event.keyCode === 37) {
        player.pos.x--;
        if (collide(arena, player)) {
            player.pos.x++;
        }
    } else if (event.keyCode === 39) {
        player.pos.x++;
        if (collide(arena, player)) {
            player.pos.x--;
        }
    } else if (event.keyCode === 40) {
        playerDrop();
    } else if (event.keyCode === 32) {
        event.preventDefault();
        playerRotate();
    }
});

document.getElementById('start').addEventListener('click', () => {
    isPaused = false;
    update();
});

document.getElementById('pause').addEventListener('click', () => {
    isPaused = true;
});

document.getElementById('restart').addEventListener('click', () => {
    arena.forEach(row => row.fill(0));
    playerReset();
    draw();
});

document.getElementById('speed').addEventListener('change', (event) => {
    dropInterval = parseInt(event.target.value);
});

playerReset();
update();
