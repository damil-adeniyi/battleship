import { Player } from './player.js';
import { Ship } from './ship.js';

// Initialize players
const player = new Player('real');
const computer = new Player('computer');

let gameStarted = false;

// Function to setup predetermined or random ships for a player board
function placeRandomShips(targetPlayer) {
    targetPlayer.gameboard.ships = [];
    targetPlayer.gameboard.board.clear();

    const shipConfigs = [
        { name: 'Destroyer', length: 3 },
        { name: 'Patroller', length: 2 },
    ];

    shipConfigs.forEach(({ name, length }) => {
        let placed = false;
        while (!placed) {
            const x = Math.floor(Math.random() * 10);
            const y = Math.floor(Math.random() * 10);
            const orientation = Math.random() < 0.5 ? 'horizontal' : 'vertical';

            // Basic boundary check before placing
            if (orientation === 'horizontal' && x + length <= 10) {
                const ship = new Ship(name, length);
                targetPlayer.gameboard.placeShip(ship, [x, y], orientation);
                placed = true;
            } else if (orientation === 'vertical' && y + length <= 10) {
                const ship = new Ship(name, length);
                targetPlayer.gameboard.placeShip(ship, [x, y], orientation);
                placed = true;
            }
        }
    });
}

function setupGame() {
    // Initially randomize player and computer ships
    placeRandomShips(player);
    placeRandomShips(computer);
}

// Render a board onto a DOM element
function renderBoard(gameboard, boardElement, isEnemy = false) {
    boardElement.innerHTML = '';

    for (let y = 0; y < 10; y++) {
        for (let x = 0; x < 10; x++) {
            const cell = document.createElement('div');
            cell.classList.add('cell');
            cell.dataset.x = x;
            cell.dataset.y = y;

            const ship = gameboard.getShipAt([x, y]);
            const isMiss = gameboard.getMissedAttacks().some(([mx, my]) => mx === x && my === y);

            const cellKey = `${x},${y}`;
            const boardMapCell = gameboard.board.get(cellKey);
            const isHit = boardMapCell ? boardMapCell.isHit : false;

            if (isHit) {
                cell.classList.add('hit');
                cell.textContent = 'X';
            } else if (isMiss) {
                cell.classList.add('miss');
                cell.textContent = '•';
            } else if (!isEnemy && ship) {
                cell.classList.add('ship'); // Show player's own ships
            }

            if (isEnemy && gameStarted) {
                cell.addEventListener('click', () => handleCellClick(x, y));
            }

            boardElement.appendChild(cell);
        }
    }
}

let gameOver = false;

function handleCellClick(x, y) {
    if (gameOver || !gameStarted) return;

    const cellKey = `${x},${y}`;
    const targetCell = computer.gameboard.board.get(cellKey);
    const isAlreadyMissed = computer.gameboard.getMissedAttacks().some(([mx, my]) => mx === x && my === y);

    if ((targetCell && targetCell.isHit) || isAlreadyMissed) {
        return; 
    }

    // 1. Player attacks computer board
    computer.gameboard.receiveAttack([x, y]);
    renderBoards();

    if (computer.gameboard.allShipsSunk()) {
        gameOver = true;
        showWinScreen('You Win! All computer ships destroyed! 🎉', 'win');
        return;
    }

    // 2. Computer takes a turn attacking player board
    computer.computerPlay(player.gameboard);
    renderBoards();

    if (player.gameboard.allShipsSunk()) {
        gameOver = true;
        showWinScreen('Game Over! The computer sank all your ships. 🤖', 'lose');
        return;
    }
}

function showWinScreen(message, resultType) {
    const statusEl = document.getElementById('game-status');
    if (statusEl) statusEl.textContent = message;

    if (document.getElementById('game-over-overlay')) return;

    const overlay = document.createElement('div');
    overlay.id = 'game-over-overlay';
    overlay.style.position = 'fixed';
    overlay.style.top = '0';
    overlay.style.left = '0';
    overlay.style.width = '100vw';
    overlay.style.height = '100vh';
    overlay.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
    overlay.style.display = 'flex';
    overlay.style.justifyContent = 'center';
    overlay.style.alignItems = 'center';
    overlay.style.zIndex = '1000';

    const modal = document.createElement('div');
    modal.style.backgroundColor = '#ffffff';
    modal.style.padding = '30px 40px';
    modal.style.borderRadius = '12px';
    modal.style.textAlign = 'center';

    const heading = document.createElement('h2');
    heading.textContent = resultType === 'win' ? 'Victory! 🏆' : 'Defeat 💥';
    heading.style.color = resultType === 'win' ? '#2e7d32' : '#c62828';

    const text = document.createElement('p');
    text.textContent = message;

    const restartBtn = document.createElement('button');
    restartBtn.textContent = 'Play Again';
    restartBtn.style.padding = '10px 20px';
    restartBtn.style.backgroundColor = '#1976d2';
    restartBtn.style.color = '#ffffff';
    restartBtn.style.border = 'none';
    restartBtn.style.borderRadius = '6px';
    restartBtn.style.cursor = 'pointer';
    
    restartBtn.addEventListener('click', () => window.location.reload());

    modal.appendChild(heading);
    modal.appendChild(text);
    modal.appendChild(restartBtn);
    overlay.appendChild(modal);
    document.body.appendChild(overlay);
}

function renderBoards() {
    const playerBoardEl = document.getElementById('player-board');
    const computerBoardEl = document.getElementById('computer-board');

    renderBoard(player.gameboard, playerBoardEl, false);
    renderBoard(computer.gameboard, computerBoardEl, true);
}

// Add a control panel for ship placement UI controls
function setupPlacementControls() {
    const container = document.getElementById('message-container');
    
    const controlDiv = document.createElement('div');
    controlDiv.style.marginTop = '10px';

    const randomizeBtn = document.createElement('button');
    randomizeBtn.textContent = 'Randomize Ships';
    randomizeBtn.style.marginRight = '10px';
    randomizeBtn.style.padding = '8px 15px';
    randomizeBtn.style.cursor = 'pointer';

    randomizeBtn.addEventListener('click', () => {
        if (gameStarted) return;
        placeRandomShips(player);
        renderBoards();
    });

    const startBtn = document.createElement('button');
    startBtn.textContent = 'Start Battle!';
    startBtn.style.padding = '8px 15px';
    startBtn.style.backgroundColor = '#2e7d32';
    startBtn.style.color = '#white';
    startBtn.style.cursor = 'pointer';

    startBtn.addEventListener('click', () => {
        gameStarted = true;
        controlDiv.style.display = 'none';
        document.getElementById('game-status').textContent = 'Game on! Click the Computer Board to attack.';
        renderBoards();
    });

    controlDiv.appendChild(randomizeBtn);
    controlDiv.appendChild(startBtn);
    container.appendChild(controlDiv);
}

// Initialize setup, controls, and initial render
setupGame();
setupPlacementControls();
renderBoards();

export { setupGame, renderBoards };