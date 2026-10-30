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
    computer.gameboard.placeShip(compShip1, [2, 3], 'horizontal');
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

    const cellKey = `${x},${y}`;
    const targetCell = computer.gameboard.board.get(cellKey);
    const isAlreadyMissed = computer.gameboard.getMissedAttacks().some(([mx, my]) => mx === x && my === y);

    if ((targetCell && targetCell.isHit) || isAlreadyMissed) {
        return; 
    }

    // 1. Player attacks computer board
    computer.gameboard.receiveAttack([x, y]);
    renderBoards();

    // Check for player win condition
    if (computer.gameboard.allShipsSunk()) {
        gameOver = true;
        showWinScreen('You Win! All computer ships destroyed! 🎉', 'win');
        return;
    }

    // 2. Computer takes a turn attacking player board
    computer.computerPlay(player.gameboard);
    renderBoards();

    // Check for computer win condition
    if (player.gameboard.allShipsSunk()) {
        gameOver = true;
        showWinScreen('Game Over! The computer sank all your ships. 🤖', 'lose');
        return;
    }
}

// Function to display a dedicated win/game-over screen overlay or banner
function showWinScreen(message, resultType) {
    // Update text status element if it exists
    const statusEl = document.getElementById('game-status');
    if (statusEl) {
        statusEl.textContent = message;
    }

    // Prevent creating multiple overlays if clicked repeatedly
    if (document.getElementById('game-over-overlay')) return;

    // Create a styled overlay modal container
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
    modal.style.boxShadow = '0 10px 25px rgba(0,0,0,0.3)';
    modal.style.maxWidth = '400px';

    const heading = document.createElement('h2');
    heading.textContent = resultType === 'win' ? 'Victory! 🏆' : 'Defeat 💥';
    heading.style.color = resultType === 'win' ? '#2e7d32' : '#c62828';
    heading.style.marginBottom = '15px';
    heading.style.fontSize = '28px';

    const text = document.createElement('p');
    text.textContent = message;
    text.style.fontSize = '16px';
    text.style.color = '#333333';
    text.style.marginBottom = '25px';

    const restartBtn = document.createElement('button');
    restartBtn.textContent = 'Play Again';
    restartBtn.style.padding = '10px 20px';
    restartBtn.style.fontSize = '16px';
    restartBtn.style.backgroundColor = '#1976d2';
    restartBtn.style.color = '#ffffff';
    restartBtn.style.border = 'none';
    restartBtn.style.borderRadius = '6px';
    restartBtn.style.cursor = 'pointer';
    
    restartBtn.addEventListener('click', () => {
        window.location.reload(); // Simple page refresh to reset the game state
    });

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

export { setupGame, renderBoards };