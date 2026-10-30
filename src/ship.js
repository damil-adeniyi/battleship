class Ship {
  constructor(name, length) {
    this.name = name;
    this.length = length;
    this.hitCount = 0;
    this.sunk = false;
  }

  hit() {
    this.hitCount++;
    this.isSunk(); // Automatically check if sunk on every hit
  }

  isSunk() {
    if (this.hitCount >= this.length) {
      this.sunk = true;
    }
    return this.sunk;
  }
}

export { Ship };