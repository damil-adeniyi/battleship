import { Gameboard } from './gameboard.js';

 class Player {
  constructor(type) {
    this.type = type; // 'real' or 'computer'
    this.gameboard = new Gameboard();
    this.playedMoves = new Set(); // Track moves made by this player to avoid duplicates
  }

  // Generates a random, unique attack for the computer player
  computerPlay(enemyGameboard) {
    let x, y;
    let moveKey;

    do {
      x = Math.floor(Math.random() * 10);
      y = Math.floor(Math.random() * 10);
      moveKey = `${x},${y}`;
    } while (this.playedMoves.has(moveKey));

    // Record this move so the computer doesn't repeat it
    this.playedMoves.add(moveKey);

    // Execute the attack on the enemy gameboard
    enemyGameboard.receiveAttack([x, y]);

    return [x, y];
  }
}

export { Player };