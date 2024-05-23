class Grid {
    constructor() {
        this.proom = {
            x: 0,
            y: 0
        };
        this.velocity = {
            x: 3,
            y: 0
        };

        this.invaders = [];

        const columns = Math.floor(Math.random() * 18 + 5);
        const rows = Math.floor(Math.random() * 10 + 2);
        this.width = columns * 30;

        for (let i = 0; i < columns; i++){
            for (let j = 0; j < rows; j++){
                this.invaders.push(new this.invaders({
                    position: {
                        i: i * 30,
                        j: j * 30
                    }
                }))
            }
        }
    }
}