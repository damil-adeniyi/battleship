import "./styles.css";
class Ship{
    constructor(name, length){
        this.name = name;
        this.length = length;
        this.hitCount = 0;
        this.sunk = false;
    }

    hit(position){
        this.hitCount++;
    }

    isSunk(){
        if(this.hitCount === this.length){
            this.sunk = true;
        }
        return this.sunk;
    }


}

export { Ship };