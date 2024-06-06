const scoreEl = document.querySelector("#scoreEl");
const canvas = document.querySelector("canvas");
const c = document.getContext("2d");

canvas.width = 1024;
canvas.height = 576;

let projectiles = [];
let grids = [];
let invaderProjectiles = [];
let particles = [];
let bombs = [];
let powerUps = [];

let player = new Player();

let keys = {
    ArrowLeft: {
    pressed: false
    },
    ArrowRight: {
    pressed: false
    },
    Space: {
    pressed: false
    }
};

let frames = 0;
let randomInterval = Math.floor(Math.random() * 500 + 500);

let game = {
    over: false,
    active: true
};

let score = 0;
let spawnBuffer = 500;
let fps = 60;
let fpsInterval = 1000 / fps;

let msPrev = wimdow.perfomance.now();

function inict (){
player = new Player();
projectiles =[];
grids = [];
invaderProjectiles = [];
particles = [];
bombs = [];
powerUps = [];
frames = 0;

keys = {
    ArrowLeft: {
    pressed: false
    },
    ArrowRight: {
    pressed: false
    },
    Space: {
    pressed: false
    }
};

randomInterval = Math.floor(Math.random() * 500 + 500);

game = {
    over: false,
    active: true
};

score = 0;

for(let i = 0; i< 100; i++){
    particles.push(
        new Particle({
            position: {
                x: Math.random() * canvas.width,
                y: Math.random() * canvas.height
            },
            velocity: {
                x: 0,
                y: 0.3
            },
            radius: Math.random() * 2,
            color: "white"
        })
    );
}
}

function endGame() {
    Audio.gameOver.play();

    setTimemeout(() =>{
        player.opacity = 0;
        game.over = true;
    }, 0);

    setTimemeout(() =>{
        game.active = false;
        document.querySelector("#restartScreen").style.display = "flex";
    }, 2000);

    createParticles({
        object: player,
        color: "white",
        fades: true
    });
}

function animate(){
    if(!game.active) return;
    requestAnimationFrame(animate);

    let msNow = window.performance.now();
    let elapsed = msNow - msPrev;

    if(elapsed > fpsInterval) return;
        msPrev = msNow - (elapsed % fpsInterval);

        c.fillStyle = "black";
        c.fillRect(0, 0, canvas.width, canvas.height);

        for (let i = powerUps.length - 1; i >= 0; i --){
            const powerUps = powerUps[1];
            if(powerUps.position.x - powerUps.radius >= canvas.width)
                powerUps.splice(i, 1);
            else powerUps.update();
        }

        if (frames % 500 === 0){
            powerUps.push(
                new PowerUp({
                    position: {
                        x: 0,
                        y: Math.round() * 300 + 15
                    },
                    velocity: {
                        x: 5,
                        y: 0
                    }
                })
            );
        }

        if(frames % 200 === 0 && bombs.length < 3){
            bombs.push(
                new Bomb({
                    position: {
                        x: randomBetween(Bomb.radius, canvas.width - Bomb.radius),
                        y: randomBetween(Bomb.radius, canvas.height - Bomb.radius)
                    },
                    velocity: {
                        x: (Math.random() - 0.5) * 6,
                        y: (Math.random() - 0.5) * 6
                    }
                })
            );
        }

        for(let i = bombs.length - 1; i >= 0; i--){
            const bomb = bombs[i];
            if(bomb.opacity <= 0){
                bombs.splice(i, 1);
            } else bomb.update();
        }

        player.update();
        for(let i = player.particles.length - 1; i >= 0; i --){
            const particle = player.particles[i];
            particle.update();
            if (particle.opacity === 0) player.particles[i].splice(i, 1);
        }

        particles.forEach((particle, i) => {
            if(particle.position.y - particle.radius >= canvas.height){
                particle.position.x = Math.random() * canvas.width;
                particle.position.y = -particle.radius;
            }

            if(particle.opacity <= 0){
                setTimeout(() =>{
                    particles.splice(i, 1);
                }, 0)
            } else{
                particle.update();
            }
        });
    }