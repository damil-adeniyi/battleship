 class Gameboard {
  constructor() {
    // Maps coordinate strings like "x,y" to ship objects or hit states
    this.board = new Map();
    this.ships = [];
    this.missedAttacks = [];
  }

  // Places a ship at specified coordinates ('horizontal' or 'vertical')
  placeShip(ship, coordinates, orientation) {
    const [startX, startY] = coordinates;
    const shipCoordinates = [];

    for (let i = 0; i < ship.length; i++) {
      let x = startX;
      let y = startY;

      if (orientation === 'horizontal') {
        x += i;
      } else if (orientation === 'vertical') {
        y += i;
      }

      const key = `${x},${y}`;
      shipCoordinates.push({ x, y });
      
      // Store reference to the ship at this coordinate
      this.board.set(key, { ship, isHit: false });
    }

    // Keep track of all ships placed on this board
    this.ships.push(ship);
  }

  // Returns the ship object located at given coordinates, if any
  getShipAt(coordinates) {
    const [x, y] = coordinates;
    const cell = this.board.get(`${x},${y}`);
    return cell ? cell.ship : null;
  }

  // Takes coordinates, determines hit or miss, and routes the hit to the ship
  receiveAttack(coordinates) {
    const [x, y] = coordinates;
    const key = `${x},${y}`;
    const cell = this.board.get(key);

    // Check if coordinate has already been attacked or missed
    // (Optional: add protection against double-attacks if desired)

    if (cell) {
      // It's a hit!
      cell.isHit = true;
      cell.ship.hit();
      return 'hit';
    } else {
      // It's a miss! Record the coordinates
      this.missedAttacks.push([x, y]);
      return 'miss';
    }
  }

  // Returns an array of all missed attack coordinates
  getMissedAttacks() {
    return this.missedAttacks;
  }

  // Reports whether all ships placed on the board have been sunk
  allShipsSunk() {
    if (this.ships.length === 0) return false;
    return this.ships.every((ship) => ship.isSunk());
  }
}


export { Gameboard };