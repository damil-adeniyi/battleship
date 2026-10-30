import { Player } from './player.js';
import { Ship } from './ship.js';

// Initialize players
let player1 = new Player('real');
let player2 = new Player('computer'); // Will switch to 'real' if PvP mode is chosen

let gameMode = 'pvp'; // Default to 2-player pass & play
let gameStarted = false;
let currentOrientation = 'horizontal';

// Turn tracking for PvP: 'p1' or 'p2'
let currentTurn = 'p1';
let setupPhasePlayer = 'p1'; // 'p1' or 'p2' during placement

// Fleet tracking for placement
let p1ShipsToPlace = [
    { name: 'Destroyer', length: 3 },
    { name: 'Patroller', length: 2 },
];
let p2ShipsToPlace = [
    { name: 'Destroyer', length: 3 },
    { name: 'Patroller', length: 2 },
];

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

            if (orientation === 'horizontal' && x + length <= 10) {
                targetPlayer.gameboard.placeShip(new Ship(name, length), [x, y], orientation);
                placed = true;
            } else if (orientation === 'vertical' && y + length <= 10) {
                targetPlayer.gameboard.placeShip(new Ship(name, length), [x, y], orientation);
                placed = true;
            }
        }
    });
}

function setupGame() {
    gameStarted = false;
    currentTurn = 'p1';
    setupPhasePlayer = 'p1';
    
    player1.gameboard.ships = [];
    player1.gameboard.board.clear();
    player2.gameboard.ships = [];
    player2.gameboard.board.clear();

    p1ShipsToPlace = [{ name: 'Destroyer', length: 3 }, { name: 'Patroller', length: 2 }];
    p2ShipsToPlace = [{ name: 'Destroyer', length: 3 }, { name: 'Patroller', length: 2 }];

    if (gameMode === 'pve') {
        player2.type = 'computer';
        placeRandomShips(player2); // Computer places automatically
        document.getElementById('board-2-title').textContent = 'Computer Board';
    } else {
        player2.type = 'real';
        document.getElementById('board-2-title').textContent = 'Player 2 Board';
    }

    renderDock();
    renderBoards();
}

// Render a board onto a DOM element
function renderBoard(gameboard, boardElement, isEnemy = false, hideShips = false) {
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
            } else if (!hideShips && !isEnemy && ship) {
                cell.classList.add('ship');
            }

            // Drag and drop placement listeners
            if (!isEnemy && !gameStarted && !hideShips) {
                cell.addEventListener('dragover', (e) => e.preventDefault());
                cell.addEventListener('drop', (e) => handleShipDrop(e, x, y));
            }

            // Click attack listener
            if (isEnemy && gameStarted) {
                cell.addEventListener('click', () => handleCellClick(x, y));
            }

            boardElement.appendChild(cell);
        }
    }
}

function handleShipDrop(e, startX, startY) {
    e.preventDefault();
    if (gameStarted) return;

    const shipName = e.dataTransfer.getData('text/plain');
    let activeDock = setupPhasePlayer === 'p1' ? p1ShipsToPlace : p2ShipsToPlace;
    let activePlayer = setupPhasePlayer === 'p1' ? player1 : player2;

    const shipData = activeDock.find(s => s.name === shipName);
    if (!shipData) return;

    const length = shipData.length;

    if (currentOrientation === 'horizontal' && startX + length > 10) return;
    if (currentOrientation === 'vertical' && startY + length > 10) return;

    for (let i = 0; i < length; i++) {
        let checkX = startX;
        let checkY = startY;
        if (currentOrientation === 'horizontal') checkX += i;
        else checkY += i;

        if (activePlayer.gameboard.getShipAt([checkX, checkY])) {
            alert('Cannot place ship over another ship!');
            return;
        }
    }

    const newShip = new Ship(shipData.name, shipData.length);
    activePlayer.gameboard.placeShip(newShip, [startX, startY], currentOrientation);

    if (setupPhasePlayer === 'p1') {
        p1ShipsToPlace = p1ShipsToPlace.filter(s => s.name !== shipName);
    } else {
        p2ShipsToPlace = p2ShipsToPlace.filter(s => s.name !== shipName);
    }
    
    renderDock();
    renderBoards();

    // Check if current player finished placing
    if (p1ShipsToPlace.length === 0 && setupPhasePlayer === 'p1' && gameMode === 'pvp') {
        showPassDeviceScreen("Player 1 is done placing ships!", "Pass the device to Player 2 for ship placement.", () => {
            setupPhasePlayer = 'p2';
            renderDock();
            renderBoards();
        });
    } else if ((setupPhasePlayer === 'p2' && p2ShipsToPlace.length === 0) || (setupPhasePlayer === 'p1' && p1ShipsToPlace.length === 0 && gameMode === 'pve')) {
        document.getElementById('game-status').textContent = 'All ships placed! Click "Start Battle!" to begin.';
    }
}

let gameOver = false;

function handleCellClick(x, y) {
    if (gameOver || !gameStarted) return;

    const attackingPlayer = currentTurn === 'p1' ? player1 : player2;
    const defendingPlayer = currentTurn === 'p1' ? player2 : player1;

    const cellKey = `${x},${y}`;
    const targetCell = defendingPlayer.gameboard.board.get(cellKey);
    const isAlreadyMissed = defendingPlayer.gameboard.getMissedAttacks().some(([mx, my]) => mx === x && my === y);

    if ((targetCell && targetCell.isHit) || isAlreadyMissed) return;

    defendingPlayer.gameboard.receiveAttack([x, y]);

    // Check for win condition
    if (defendingPlayer.gameboard.allShipsSunk()) {
        gameOver = true;
        renderBoards();
        showWinScreen(`${currentTurn === 'p1' ? 'Player 1' : 'Player 2'} Wins! All enemy ships destroyed! 🎉`, 'win');
        return;
    }

    if (gameMode === 'pve') {
        // Computer immediate counter-attack
        player2.computerPlay(player1.gameboard);
        if (player1.gameboard.allShipsSunk()) {
            gameOver = true;
            renderBoards();
            showWinScreen('Game Over! The computer sank all your ships. 🤖', 'lose');
            return;
        }
        renderBoards();
    } else {
        // PvP Turn Pass
        const nextPlayerName = currentTurn === 'p1' ? 'Player 2' : 'Player 1';
        showPassDeviceScreen(
            `Turn ended for ${currentTurn === 'p1' ? 'Player 1' : 'Player 2'}.`,
            `Pass the device to ${nextPlayerName}. Do not peek!`,
            () => {
                currentTurn = currentTurn === 'p1' ? 'p2' : 'p1';
                renderBoards();
            }
        );
    }
}

function renderDock() {
    const listEl = document.getElementById('ship-list');
    const dockTitle = document.getElementById('dock-title');
    if (!listEl) return;
    listEl.innerHTML = '';

    let activeDock = setupPhasePlayer === 'p1' ? p1ShipsToPlace : p2ShipsToPlace;
    dockTitle.textContent = gameMode === 'pvp' 
        ? `${setupPhasePlayer === 'p1' ? 'Player 1' : 'Player 2'} Fleet (Drag to Board)` 
        : 'Your Fleet (Drag to Board)';

    activeDock.forEach(ship => {
        const item = document.createElement('div');
        item.textContent = `${ship.name} (${ship.length})`;
        item.draggable = true;
        item.style.padding = '8px 12px';
        item.style.backgroundColor = '#e0e0e0';
        item.style.border = '1px solid #ccc';
        item.style.borderRadius = '4px';
        item.style.cursor = 'grab';

        item.addEventListener('dragstart', (e) => {
            e.dataTransfer.setData('text/plain', ship.name);
        });

        listEl.appendChild(item);
    });
}

// Secure Pass Device Screen for 2-Player Mode
function showPassDeviceScreen(titleText, instructionText, onContinue) {
    if (document.getElementById('pass-overlay')) return;

    const overlay = document.createElement('div');
    overlay.id = 'pass-overlay';
    overlay.style.position = 'fixed';
    overlay.style.top = '0';
    overlay.style.left = '0';
    overlay.style.width = '100vw';
    overlay.style.height = '100vh';
    overlay.style.backgroundColor = '#1a1a1a';
    overlay.style.display = 'flex';
    overlay.style.justifyContent = 'center';
    overlay.style.alignItems = 'center';
    overlay.style.zIndex = '2000';

    const modal = document.createElement('div');
    modal.style.backgroundColor = '#ffffff';
    modal.style.padding = '40px';
    modal.style.borderRadius = '12px';
    modal.style.textAlign = 'center';
    modal.style.maxWidth = '450px';

    const heading = document.createElement('h2');
    heading.textContent = titleText;
    heading.style.color = '#1976d2';
    heading.style.marginBottom = '15px';

    const text = document.createElement('p');
    text.textContent = instructionText;
    text.style.fontSize = '16px';
    text.style.marginBottom = '25px';

    const continueBtn = document.createElement('button');
    continueBtn.textContent = "I'm Ready!";
    continueBtn.style.padding = '10px 25px';
    continueBtn.style.fontSize = '16px';
    continueBtn.style.backgroundColor = '#2e7d32';
    continueBtn.style.color = '#ffffff';
    continueBtn.style.border = 'none';
    continueBtn.style.borderRadius = '6px';
    continueBtn.style.cursor = 'pointer';

    continueBtn.addEventListener('click', () => {
        overlay.remove();
        onContinue();
    });

    modal.appendChild(heading);
    modal.appendChild(text);
    modal.appendChild(continueBtn);
    overlay.appendChild(modal);
    document.body.appendChild(overlay);
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

    if (!gameStarted) {
        // Setup phase
        const activePlayer = setupPhasePlayer === 'p1' ? player1 : player2;
        document.getElementById('board-1-title').textContent = gameMode === 'pvp' 
            ? `${setupPhasePlayer === 'p1' ? 'Player 1' : 'Player 2'} Placement Board` 
            : 'Your Board';
        computerBoardEl.parentElement.style.display = 'none'; // Hide enemy board during setup
        renderBoard(activePlayer.gameboard, playerBoardEl, false, false);
    } else {
        // Battle phase
        computerBoardEl.parentElement.style.display = 'block';
        
        if (gameMode === 'pve') {
            document.getElementById('board-1-title').textContent = 'Your Board';
            renderBoard(player1.gameboard, playerBoardEl, false, false);
            renderBoard(player2.gameboard, computerBoardEl, true, true);
        } else {
            // PvP Turn View: Show active player's ships on board-1, enemy board on board-2
            const activePlayer = currentTurn === 'p1' ? player1 : player2;
            const enemyPlayer = currentTurn === 'p1' ? player2 : player1;

            document.getElementById('board-1-title').textContent = `${currentTurn === 'p1' ? 'Player 1' : 'Player 2'} Board (Secret)`;
            document.getElementById('board-2-title').textContent = `${currentTurn === 'p1' ? 'Player 2' : 'Player 1'} Target Grid`;

            renderBoard(activePlayer.gameboard, playerBoardEl, false, false);
            renderBoard(enemyPlayer.gameboard, computerBoardEl, true, true);
        }
    }
}

function setupPlacementControls() {
    const container = document.getElementById('message-container');
    
    const controlDiv = document.createElement('div');
    controlDiv.style.marginTop = '10px';

    const rotateBtn = document.getElementById('rotate-btn');
    if (rotateBtn) {
        rotateBtn.addEventListener('click', () => {
            currentOrientation = currentOrientation === 'horizontal' ? 'vertical' : 'horizontal';
            rotateBtn.textContent = `Orientation: ${currentOrientation.charAt(0).toUpperCase() + currentOrientation.slice(1)}`;
        });
    }

    const startBtn = document.createElement('button');
    startBtn.textContent = 'Start Battle!';
    startBtn.style.padding = '8px 15px';
    startBtn.style.backgroundColor = '#2e7d32';
    startBtn.style.color = '#ffffff';
    startBtn.style.border = 'none';
    startBtn.style.borderRadius = '4px';
    startBtn.style.cursor = 'pointer';

    startBtn.addEventListener('click', () => {
        if (gameMode === 'pvp') {
            if (p1ShipsToPlace.length > 0 || p2ShipsToPlace.length > 0) {
                alert('Both players must place all their ships before starting!');
                return;
            }
        } else {
            if (p1ShipsToPlace.length > 0) {
                alert('Please place all ships before starting!');
                return;
            }
        }

        gameStarted = true;
        document.getElementById('ship-dock').style.display = 'none';
        controlDiv.style.display = 'none';
        document.getElementById('game-container').style.display = 'flex';

        if (gameMode === 'pvp') {
            showPassDeviceScreen("Battle Ready!", "Pass the device to Player 1 to take the first shot.", () => {
                currentTurn = 'p1';
                document.getElementById('game-status').textContent = "Player 1's Turn to attack!";
                renderBoards();
            });
        } else {
            document.getElementById('game-status').textContent = "Game on! Click the Computer Board to attack.";
            renderBoards();
        }
    });

    controlDiv.appendChild(startBtn);
    container.appendChild(controlDiv);

    // Mode Selector Handler
    document.getElementById('confirm-mode').addEventListener('click', () => {
        gameMode = document.getElementById('game-mode').value;
        document.getElementById('game-container').style.display = 'flex';
        document.getElementById('ship-dock').style.display = 'block';
        controlDiv.style.display = 'block';
        document.getElementById('game-status').textContent = gameMode === 'pvp' 
            ? "Player 1: Place your ships." 
            : "Place your ships.";
        setupGame();
    });
}

setupPlacementControls();
export { setupGame, renderBoards };