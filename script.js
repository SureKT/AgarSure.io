// import {player} from './classes/player.js';
// import {enemy} from './classes/enemy.js';

var myPlayer;
var myEnemies = [];
var colors = [];
var myScore;
var gameOver;
var x;
var y;

/*
TODO: TEACH SOUMIA NICELY.

GAMEPLAY
    TODO: Velocidad aleatoria
    TODO: Sistema de despawn
    TODO: Balanceo de tamaño
    TODO: Game over por encima de las bolas

UI/UX
    TODO: Redimensionado de ventana
    TODO: Boton de start
    TODO: ESC = Pausa
    TODO: Boton de restart
    TODO: Esconder el tamaño al perder

CODE
    TODO: Limpiar codigo

BUGS
*/

function startGame() {
    myGameArea.start();
    myScore = new component("30px", "Verdana", "white", 20, 40, "text");
    myPlayer = new player(4, "white", "white", -100, -100);
    colors = ["#0074D9", "#7FDBFF", "#39CCCC", "#B10DC9", "#F012BE", "#FF4136", "#FF851B", "#FFDC00", "#3D9970", "#2ECC40", "#01FF70", "yellow", "yellowgreen", "green", "#00AEAE", "blueviolet", "violet", "red", "orangered", "orange", "#FF7F00"];
}

var myGameArea = {
    canvas: document.createElement("canvas"),
    start: function () {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
        this.canvas.style.cursor = "none"; //hide the original cursor
        this.context = this.canvas.getContext("2d");
        document.body.insertBefore(this.canvas, document.body.childNodes[0]);

        this.interval = setInterval(this.update, 20);

        window.addEventListener('mousemove', function (e) {
            myGameArea.x = e.pageX;
            myGameArea.y = e.pageY;
        })

        window.addEventListener('resize', function () {
            this.canvas.width = window.innerWidth;
            this.canvas.height = window.innerHeight;
        });


        this.frameNo = 0;
    },
    resize: function () {
    },
    update: function () {

        myGameArea.clear();
        myGameArea.frameNo += 1;

        // Colision enemiga
        myEnemies.forEach(e => {
            if (myPlayer.crashWith(e)) {
                myPlayer.tryEat(e);
                return;
            }
        });

        myScore.text = "SIZE: " + myPlayer.radius;

        // Spawn enemigo
        if (myGameArea.frameNo == 1 || everyinterval(8)) {
            x = myGameArea.canvas.width;
            y = myGameArea.canvas.height;
            var offsetX = 0;
            var offsetY = 0;
            var speedX;
            var speedY;

            // Tamaño del enemigo
            radius = randNum(myPlayer.radius - (myPlayer.radius / 2), myPlayer.radius + 10);

            // Posiciones x,y inicio / x,y final de arriba, izquierda, derecha, abajo
            var spawnPos = [[0, 0, x, 0], [x, 0, x, y], [0, y, x, y], [0, 0, 0, y]];
            pos = randNum(0, 3);

            speed = randFloat(0.5, 1);
            offset = randFloat(-speed, speed);

            switch (pos) {
                // Spawned from top
                case 0:
                    offsetY = -radius;
                    speedX = offset;
                    speedY = speed;
                    break;
                // Spawned from left
                case 1:
                    offsetX = radius;
                    speedX = -speed;
                    speedY = offset;
                    break;
                // Spawned from right
                case 2:
                    offsetY = radius;
                    speedX = offset;
                    speedY = -speed;
                    break;
                // Spawned from bottom
                case 3:
                    offsetX = -radius;
                    speedX = speed;
                    speedY = offset;
                    break;
            }

            console.log(speedX + " - " + speedY);

            enemyColor = colors[randNum(0, colors.length)];

            spawnEnemy(
                radius, enemyColor, enemyColor,
                randNum(spawnPos[pos][0], spawnPos[pos][2]) + offsetX,
                randNum(spawnPos[pos][1], spawnPos[pos][3]) + offsetY,
                speedX, speedY
            );
        }

        // Player movement
        if (myGameArea.x && myGameArea.y) {
            myPlayer.x = myGameArea.x;
            myPlayer.y = myGameArea.y;
            myPlayer.update();
        }

        // Enemy movement
        myEnemies.forEach(e => {
            e.move();
            e.update();
        });
        myScore.update();
    },
    clear: function () {
        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
    },
    stop: function () {
        myGameArea.clear();
        gameOver = new component("45px", "Verdana", "white", x / 2.75, y / 2, "text");
        gameOver.text = "Game Over - Size: " + myPlayer.radius;
        gameOver.update();
        this.canvas.style.cursor = ""; // show the original cursor
        clearInterval(this.interval);
    }
}

class player {
    constructor(radius, fill, border, x, y) {
        this.radius = radius;
        this.fill = fill;
        this.border = border;
        this.x = x;
        this.y = y;
    }

    update = function () {
        let ctx = myGameArea.context;
        drawCircle(ctx, this.x, this.y, this.radius, this.fill, this.border, 1)
    }

    crashWith = function (otherobj) {
        let x0 = this.x;
        let y0 = this.y;
        let R0 = this.radius;

        let x1 = otherobj.x;
        let y1 = otherobj.y;
        let R1 = otherobj.radius;

        let c1 = Math.pow((R0 - R1), 2);
        let c2 = Math.pow((x0 - x1), 2) + Math.pow((y0 - y1), 2);
        let c3 = Math.pow((R0 + R1), 2);

        let operacion = c2 <= c3;

        let crash = false;
        if (operacion) {
            crash = true;
        }
        return crash;
    }

    tryEat = function (otherobj) {
        if (this.radius > otherobj.radius) {
            this.radius += 0.5;
            otherobj.destroy();
        } else if (this.radius < otherobj.radius) {
            myGameArea.stop();
        }
    }
}

class enemy {
    constructor(radius, fill, border, x, y, speedX, speedY) {
        this.radius = radius;
        this.fill = fill;
        this.border = border;
        this.x = x;
        this.y = y;
        this.speedX = speedX;
        this.speedY = speedY;
        this.alive = true;
    }

    move = function () {
        this.x += this.speedX;
        this.y += this.speedY;
    }

    update = function () {
        let ctx = myGameArea.context;
        drawCircle(ctx, this.x, this.y, this.radius, this.fill, this.border, 1)
    }

    destroy = function () {
        let index = myEnemies.indexOf(this);
        myEnemies[index] = null;
        myEnemies.splice(index, 1);
    }
}


class component {
    constructor(width, height, color, x, y, type) {
        this.width = width;
        this.height = height;
        this.color = color;
        this.x = x;
        this.y = y;
        this.type = type;
    }

    update = function () {
        let ctx = myGameArea.context;
        if (this.type == "text") {
            ctx.font = this.width + " " + this.height;
            ctx.fillStyle = this.color;
            ctx.fillText(this.text, this.x, this.y);
        } else {
            ctx.fillStyle = color;
            ctx.fillRect(this.x, this.y, this.width, this.height);
        }
    }
}

function everyinterval(n) {
    if ((myGameArea.frameNo / n) % 1 == 0) { return true; }
    return false;
}

function spawnEnemy(radius, fill, border, x, y, speedX, speedY) {
    myEnemies.push(new enemy(radius, fill, border, x, y, speedX, speedY));
}

function spawnDummy() {
    myEnemies.push(new enemy(14, "red", "red", 100, 100, 0.3, 0.2));
}

function randNum(min, max) {
    return Math.floor(Math.random() * (max - min + 1) + min);
}

function randFloat(min, max) {
    return Math.random() * (max - min + 1) + min;
}

function drawCircle(ctx, x, y, radius, fill, stroke, strokeWidth) {
    ctx.beginPath()
    ctx.arc(x, y, radius, 0, 2 * Math.PI, false)
    if (fill) {
        ctx.fillStyle = fill
        ctx.fill()
    }
    if (stroke) {
        ctx.lineWidth = strokeWidth
        ctx.strokeStyle = stroke
        ctx.stroke()
    }
}