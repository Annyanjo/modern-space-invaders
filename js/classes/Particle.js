class Particle {
    constructor({position, velocity, radius, color, fades}){
        this.position = position;
        this.velocity = velocity;
        this.radius = radius;
        this.color = color;
        this.opacity = 1;
        this.fades = fades;
    }
    draw() {
        c.save();
        c.globalAlpha = this.opacity;
        c.beginPath();
        c.arc(this.position.x, this.position.y, this.radius, 0, Math.PI * 2);
        c.closePath();
        c.fillStyle = this.color;
        c.fill();
        c.closePath();
        c.restore();
    }
}