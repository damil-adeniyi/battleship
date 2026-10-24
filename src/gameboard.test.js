import { Gameboard } from './gameboard.js';
import { Ship } from './ship.js';

describe('Gameboard Class - TDD', () => {

  test('places a ship at specific coordinates and retrieves it', () => {
    const gameboard = new Gameboard();
    const ship = new Ship('Destroyer', 3);

    gameboard.placeShip(ship, [0, 0], 'horizontal');

    expect(gameboard.getShipAt([0, 0])).toBe(ship);
    expect(gameboard.getShipAt([1, 0])).toBe(ship);
    expect(gameboard.getShipAt([2, 0])).toBe(ship);
  });

  test('records a hit on a ship when attacked', () => {
    const gameboard = new Gameboard();
    const ship = new Ship('Destroyer', 3);

    gameboard.placeShip(ship, [0, 0], 'horizontal');
    const result = gameboard.receiveAttack([0, 0]);

    expect(result).toBe('hit');
    expect(ship.hitCount).toBe(1);
  });

  test('records coordinates of a missed attack', () => {
    const gameboard = new Gameboard();
    
    const result = gameboard.receiveAttack([5, 5]);

    expect(result).toBe('miss');
    expect(gameboard.getMissedAttacks()).toContainEqual([5, 5]);
  });

  test('reports whether all ships have been sunk', () => {
    const gameboard = new Gameboard();
    const ship = new Ship('Patroller', 1);

    gameboard.placeShip(ship, [0, 0], 'horizontal');

    // Initially not all sunk
    expect(gameboard.allShipsSunk()).toBe(false);

    // Attack the ship to sink it
    gameboard.receiveAttack([0, 0]);

    // Now all ships should be sunk
    expect(gameboard.allShipsSunk()).toBe(true);
  });

});