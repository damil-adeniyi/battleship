import { Player } from './player.js';
import { Ship } from './ship.js';

// Initialize players
const player = new Player('real');
const computer = new Player('computer');

// For now, populate with predetermined ships (e.g., length 3 and 2)
function setupGame() {
    const playerShip1 = new Ship('Destroyer', 3);
    const playerShip2 = new Ship('Destroyer', 3);
    const playerShip3 = new Ship('Patroller', 2);
    const playerShip4 = new Ship('Patroller', 2);
    player.gameboard.placeShip(playerShip1, [0, 0], 'horizontal');
    player.gameboard.placeShip(playerShip2, [0, 3], 'vertical');
    player.gameboard.placeShip(playerShip3, [4, 6], 'horizontal');
    player.gameboard.placeShip(playerShip4, [6, 0], 'vertical');

    const compShip1 = new Ship('Destroyer', 3);
    const compShip2 = new Ship('Destroyer', 3);
    const compShip3 = new Ship('Patroller', 2);
    const compShip4 = new Ship('Patroller', 2);
    computer.gameboard.placeShip(compShip1, [2, 2], 'horizontal');
    computer.gameboard.placeShip(compShip2, [5, 5], 'vertical');
    computer.gameboard.placeShip(compShip3, [0, 8], 'horizontal');
    computer.gameboard.placeShip(compShip4, [8, 0], 'vertical');
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

            // Check if this cell was hit
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
                // Show player's own ships so they can see them
                cell.classList.add('ship');
            }

            // Add click listener only to the enemy board
            if (isEnemy) {
                cell.addEventListener('click', () => handleCellClick(x, y));
            }

            boardElement.appendChild(cell);
        }
    }
}

let gameOver = false;

function handleCellClick(x, y) {
    if (gameOver) return;

    // Check if the move was already played against computer board
    // (Simple guard against clicking already hit/missed cells)
    const cellKey = `${x},${y}`;
    const targetCell = computer.gameboard.board.get(cellKey);
    const isAlreadyMissed = computer.gameboard.getMissedAttacks().some(([mx, my]) => mx === x && my === y);

    if ((targetCell && targetCell.isHit) || isAlreadyMissed) {
        return; // Already attacked this spot
    }

    // 1. Player attacks computer board
    computer.gameboard.receiveAttack([x, y]);
    
    // Check for player win condition
    if (computer.gameboard.allShipsSunk()) {
        document.getElementById('game-status').textContent = 'You Win! All computer ships destroyed! 🎉';
        gameOver = true;
        renderBoards();
        return;
    }

    // 2. Computer takes a turn attacking player board
    computer.computerPlay(player.gameboard);

    // Check for computer win condition
    if (player.gameboard.allShipsSunk()) {
        document.getElementById('game-status').textContent = 'Game Over! The computer sank all your ships.';
        gameOver = true;
        renderBoards();
        return;
    }

    // Re-render both boards to reflect changes
    renderBoards();
}

function renderBoards() {
    const playerBoardEl = document.getElementById('player-board');
    const computerBoardEl = document.getElementById('computer-board');

    renderBoard(player.gameboard, playerBoardEl, false);
    renderBoard(computer.gameboard, computerBoardEl, true);
}

// Initialize and render on load
setupGame();
renderBoards();

export { setupGame, renderBoards };