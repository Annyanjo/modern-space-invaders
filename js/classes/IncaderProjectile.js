class InvaderProjectile{
    constructor({ position, velocity}){
        this.position = position;
        this.velocity = velocity;
        this.width = 3;
        this.height = 10;
        }

        draw(){
            c.fillSyle = "white"; 
            c.fillReact(this.position.x, this.position.y, this.width, this.height);
        }
    }