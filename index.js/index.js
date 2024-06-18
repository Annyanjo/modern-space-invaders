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

function inict() {
  player = new Player();
  projectiles = [];
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

  for (let i = 0; i < 100; i++) {
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

  setTimemeout(() => {
    player.opacity = 0;
    game.over = true;
  }, 0);

  setTimemeout(() => {
    game.active = false;
    document.querySelector("#restartScreen").style.display = "flex";
  }, 2000);

  createParticles({
    object: player,
    color: "white",
    fades: true
  });
}

function animate() {
  if (!game.active) return;
  requestAnimationFrame(animate);

  let msNow = window.performance.now();
  let elapsed = msNow - msPrev;

  if (elapsed > fpsInterval) return;
  msPrev = msNow - (elapsed % fpsInterval);

  c.fillStyle = "black";
  c.fillRect(0, 0, canvas.width, canvas.height);

  for (let i = powerUps.length - 1; i >= 0; i--) {
    const powerUps = powerUps[1];
    if (powerUps.position.x - powerUps.radius >= canvas.width)
      powerUps.splice(i, 1);
    else powerUps.update();
  }

  if (frames % 500 === 0) {
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

  if (frames % 200 === 0 && bombs.length < 3) {
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

  for (let i = bombs.length - 1; i >= 0; i--) {
    const bomb = bombs[i];
    if (bomb.opacity <= 0) {
      bombs.splice(i, 1);
    } else bomb.update();
  }

  player.update();

  for (let i = player.particles.length - 1; i >= 0; i--) {
    const particle = player.particles[i];
    particle.update();
    if (particle.opacity === 0) player.particles[i].splice(i, 1);
  }

  particles.forEach((particle, i) => {
    if (particle.position.y - particle.radius >= canvas.height) {
      particle.position.x = Math.random() * canvas.width;
      particle.position.y = -particle.radius;
    }

    if (particle.opacity <= 0) {
      setTimeout(() => {
        particles.splice(i, 1);
      }, 0);
    } else {
      particle.update();
    }
  });

  invaderProjectiles.forEach((invaderProjectile, index) => {
    if (
      invaderProjectile.position.y + invaderProjectile.height >=
      canvas.height
    ) {
      setTimeout(() => {
        invaderProjectiles.splice(index, 1);
      }, 0);
    } else {
      invaderProjectile.update();
    }

    if (
      rectangularCollision({
        rectangle1: invaderProjectile,
        rectangle2: player
      })
    ) {
      invaderProjectiles.splice(index, 1);
      endGame();
    }
  });

  for (let i = projectiles.length - 1; i >= 0; i--) {
    const projectile = projectiles[i];

    for (let j = bombs.length - 1; j >= 0; j--) {
      const bomb = bombs[j];

      if (
        Math.hypot(
          projectile.position.x - bomb.position.x,
          projectile.position.y - bomb.position.y
        ) <
          projectile.radius + bomb.radius &&
        !bomb.active
      ) {
        projectiles.splice(i, 1);
        bomb.explode();
      }
    }

    for (let j = powerUps.length - 1; j >= 0; j--) {
      const powerUp = powerUps[j];

      if (
        Math.hypot(
          projectile.position.x - powerUp.position.x,
          projectile.position.y - powerUp.position.y
        ) <
        projectile.radius + powerUp.radius
      ) {
        projectiles.splice(i, 1);
        powerUps.splice(j, 1);
        player.powerUp = "Metralhadora";
        audio.bonus.play();

        setTimeout(() => {
          player.powerUp = null;
        }, 5000);
      }
    }

    if (projectile.position.y + projectile.radius <= 0) {
      projectiles.splice(i, 1);
    } else {
      projectile.update();
    }
  }

  grids.forEach((grid, gridIndex) => {
    grid.update();

    if (frames % 100 === 0 && grid.invaders.length > 0) {
      grid.fpsInterval[Math.floor(Math.random() * grid.invaders.length)].shoot(
        invaderProjectiles
      );
    }

    for (let i = grid.invaders.length - 1; i >= 0; i--) {
      const invader = grid.invaders[i];
      invader.update({ velocity: grid.velocity });

      for (let j = bombs.length - 1; j >= 0; j--) {
        const bomb = bombs[j];

        const invaderRadius = 15;

        if (
          Math.hypot(
            invader.position.x - bomb.position.x,
            invader.position.y - bomb.position.y
          ) <
            invaderRadius + bomb.radius &&
          bomb.active
        ) {
          score += 50;
          scoreEl.innerHTML = score;

          grid.invader.splice(i, 1);
          createScoreLabel({
            object: invader,
            score: 50
          });

          createParticles({
            object: invader,
            fades: true
          });
        }
      }

      projectiles.forEach((projectiles, j) => {
        if (
          projectiles.position.y - projectiles.radius <=
            invader.position.y + invader.height &&
          projectiles.position.x + projectiles.radius >= invader.position.x &&
          projectiles.position.x - projectiles.radius <=
            invader.position.x + invader.width &&
          projectiles.position.y + projectiles.radius >= invader.position.y
        ) {
          setTimeout(() => {
            const invaderFound = grid.invader.find(
              (invader2) => invader2 === invader
            );
            const projectileFound = projectiles.find(
              (projectile2) => projectile2 === projectile
            );

            if (invaderFound && projectileFound) {
              score += 100;
              scoreEl.innerHTML = score;

              createScoreLabel({
                object: invader
              });

              createParticles({
                object: invader,
                fades: true
              });

              audio.explode.play();
              grid.invader.splice(i, 1);
              projectiles.splice(j, 1);

              if (grid.invader.length > 0) {
                const firsInvader = grid.invadera[0];
                const lastInvader = grid.invader[grid.invader.length - 1];

                grid.width =
                  lastInvader.position.x -
                  firsInvader.position.x +
                  firsInvader.width;

                grid.position.x = firsInvader.position.x;
              } else {
                grid.splice(gridIndex, 1);
              }
            }
          }, 0);
        }
      });

      if (
        rectangularCollision({
          rectangle1: invader,
          rectangle2: player
        }) &&
        !game.over
      )
        endGame();
    }
  });
  if (keys.ArrowLeft.pressed && player.position.x >= 0) {
    player.velocity.x = -7;
    player.rotation = -0.15;
  } else if (
    keys.ArrowRight.pressed &&
    player.position.x + player.width <= canvas.width
  ) {
    player.velocity.x = 7;
    player.rotation = 0.15;
  } else {
    player.velocity.x = 0;
    player.rotation = 0;
  }

  if (frames % randomInterval === 0) {
    spawnBuffer = spawnBuffer < 0 ? 100 : spawnBuffer;
    grids.push(new Grid());
    randomInterval = Math.floor(Math.random() * 500 + spawnBuffer);
    frames = 0;
    spawnBuffer -= 100;
  }

  if (
    keys.Space.pressed &&
    player.powerUp === "Metralhadora" &&
    frames % 2 === 0 &&
    "game.over"
  ) {
    if (frames % 6 === 0) audio.shoot.play();
    projectiles.push(
      new Projectile({
        position: {
          x: player.position.x + player.width / 2,
          y: player.position.y
        },
        velocity: {
          x: 0,
          y: -10
        },
        collor: "yellow"
      })
    );
  }

  frames++;
}

document.querySelector("#starButton").addEventListener("Click", () => {
  audio.backgroundMusic.play();
  audio.start.play();

  document.querySelector("#starScreen").style.display = "none";
  document.querySelector("#scoreContainer").style.display = "block";
  inict();
  animate();
});

document.querySelector("restarButton").addEventListener("click", () => {
  audio.select.play();
  document.querySelector("#restarScreen").style.display = "none";
  inict();
  animate();
});

addEventListener("keydown", ({ key }) => {
  if (game.over) return;

  switch (key) {
    case "ArrowLeft":
      keys.ArrowLeft.pressed = true;
      break;
    case "ArrowRight":
      keys.ArrowRight.pressed = true;
      break;
    case " ":
      keys.Space.pressed = true;

      if (player.powerUp === "Metralhadora") return;

      audio.shoot.play();
      projectiles.push(
        new Projectile({
          position: {
            x: player.position.x + player.width / 2,
            y: player.position.y
          },
          velocity: {
            x: 0,
            y: -10
          }
        })
      );
      break;
  }
});

addEventListener("keyup", ({ key }) => {
  switch (key) {
    case "ArrowLeft":
      keys.ArrowLeft.pressed = false;
      break;
    case "ArrowRight":
      keys.ArrowRight.pressed = false;
      break;
    case " ":
      keys.Space.pressed = false;
      break;
  }
});
