import { Player } from './player.js';
import { Gameboard } from './gameboard.js';

describe('Player Class', () => {
  
  test('initializes with a player type and its own gameboard', () => {
    const realPlayer = new Player('real');
    const computerPlayer = new Player('computer');

    expect(realPlayer.type).toBe('real');
    expect(realPlayer.gameboard).toBeInstanceOf(Gameboard);

    expect(computerPlayer.type).toBe('computer');
    expect(computerPlayer.gameboard).toBeInstanceOf(Gameboard);
  });

  test('computer player can make a random attack on an enemy gameboard', () => {
    const computerPlayer = new Player('computer');
    const enemyGameboard = new Gameboard();

    // Call computer attack
    const attackCoords = computerPlayer.computerPlay(enemyGameboard);

    // Verify it returns valid 2D coordinates [x, y] between 0 and 9
    expect(attackCoords).toHaveLength(2);
    expect(attackCoords[0]).toBeGreaterThanOrEqual(0);
    expect(attackCoords[0]).toBeLessThan(10);
    expect(attackCoords[1]).toBeGreaterThanOrEqual(0);
    expect(attackCoords[1]).toBeLessThan(10);
  });

});