import { Ship } from './index.js';

describe('Ship Class - Isolation Testing', () => {
  
  // Test 1: Isolate the initialization behavior
  test('initializes with correct properties and default states', () => {
    const ship = new Ship('Destroyer', 3);
    expect(ship.name).toBe('Destroyer');
    expect(ship.length).toBe(3);
    expect(ship.hitCount).toBe(0);
  });

  // Test 2: Isolate ONLY the hit() method behavior
  test('hit() increments the hitCount by 1', () => {
    const ship = new Ship('Destroyer', 3);
    ship.hit();
    expect(ship.hitCount).toBe(1);
    
    // Call it again to verify incremental behavior in isolation
    ship.hit();
    expect(ship.hitCount).toBe(2);
  });

  // Test 3: Isolate ONLY the isSunk() behavior when not sunk
  test('isSunk() returns false when hitCount is less than length', () => {
    const ship = new Ship('Destroyer', 3);
    ship.hitCount = 1; // Manually set state to isolate isSunk() from hit()
    expect(ship.isSunk()).toBe(false);
  });

  // Test 4: Isolate ONLY the isSunk() behavior when sunk
  test('isSunk() returns true when hitCount equals length', () => {
    const ship = new Ship('Destroyer', 2);
    ship.hitCount = 2; // Manually set state to isolate isSunk() from hit()
    expect(ship.isSunk()).toBe(true);
  });

});