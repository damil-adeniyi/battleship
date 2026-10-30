import { Ship } from "./ship.js"; 

class Gameboard {
  constructor() {
    this.board = new Map();
    this.ships = [];
    this.missedAttacks = [];
  }

  placeShip(ship, coordinates, orientation) {
    const [startX, startY] = coordinates;

    for (let i = 0; i < ship.length; i++) {
      let x = startX;
      let y = startY;

      if (orientation === 'horizontal') {
        x += i;
      } else if (orientation === 'vertical') {
        y += i;
      }

      const key = `${x},${y}`;
      this.board.set(key, { ship, isHit: false });
    }

    this.ships.push(ship);
  }

  getShipAt(coordinates) {
    const [x, y] = coordinates;
    const cell = this.board.get(`${x},${y}`);
    return cell ? cell.ship : null;
  }

  receiveAttack(coordinates) {
    const [x, y] = coordinates;
    const key = `${x},${y}`;
    const cell = this.board.get(key);

    if (cell) {
      // Prevent double-counting hits if the same spot is clicked twice
      if (cell.isHit) return 'hit';

      cell.isHit = true;
      cell.ship.hit();
      return 'hit';
    } else {
      // Avoid duplicate entries in missed attacks
      if (!this.missedAttacks.some(([mx, my]) => mx === x && my === y)) {
        this.missedAttacks.push([x, y]);
      }
      return 'miss';
    }
  }

  getMissedAttacks() {
    return this.missedAttacks;
  }

  allShipsSunk() {
    if (this.ships.length === 0) return false;
    // Force a check on every ship's current status
    return this.ships.every((ship) => ship.isSunk());
  }
}

export { Gameboard };