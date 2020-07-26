const config = {
    width: 5,
    height: 5,
    loopingDelay: 100,
    colors: ['red', 'gray', 'green']
}

class Tick {
    last = new Date();
    deltaTime = 0;

    constructor() {
        setInterval(this.update.bind(this), config.loopingDelay);
    }

    update () {
        const now = new Date();
        this.deltaTime = (now - this.last) / 1000;
        this.last = now;
    }
}

class Game {
    game = null;
    scoreDom = null;
    lifeDom = null;
    chancesDom = null;
    levelDom = null;
    cells = [];
    rows = [];
    currentTime = 0;
    score = 0;
    chances = 10;
    life = 3;
    level = 1;
    height = config.height;
    width = config.width;
    gameOver = false;

    static time = null;

    constructor() {
        this.initGame();
    }

    initGame() {
        if(document.body) {
            this.instatiate();
        } else {
            document.addEventListener("DOMContentLoaded", () => {
                this.instatiate();
            })
        }

        setInterval(this.update.bind(this), config.loopingDelay);
    }

    instatiate() {
        Game.time = new Tick();
        this.game = document.getElementById("game");
        this.levelDom = document.getElementById("level");
        this.lifeDom = document.getElementById("life");
        this.chancesDom = document.getElementById("chances");
        this.scoreDom = document.getElementById("score");

        this.levelDom.innerText = this.level;
        this.lifeDom.innerText = this.life;
        this.chancesDom.innerText = this.chances;
        this.scoreDom.innerText = this.score;
        this.instatiateBoard();
    }

    instatiateBoard() {
        for(let i=0; i<this.height; i++) {
            const row = i <= this.rows.length - 1 ? this.rows[i] : this.addRow();
            for(let j=0; j<this.width; j++) {
                if(j > row.childNodes.length - 1) {
                    this.addCell(row);
                }
            }
        }
    }

    addRow() {
        const row = document.createElement("div");
        row.className = "row";
        this.game.appendChild(row);
        this.rows.push(row);

        return row;
    }

    addCell(row) {
        this.cells.push(new Cell(row, this));
    }

    update() {
        if(!this.gameOver) {
            this.cells.forEach(c => c.update());
        }
    }

    addScore() {
        this.score += 1;
        this.scoreDom.innerText = this.score;

        if(this.score > (10 * this.level * this.level)) {
            this.increaseLevel();
        }
    }

    removeLife() {
        this.life -= 1;
        this.lifeDom.innerText = this.life;        

        if(this.life == 0) {
            this.setGameOver();
        }
    }

    removeChance() {
        this.chances -= 1;
        this.chancesDom.innerText = this.chances;

        if(this.chances == 0) {
            this.setGameOver();
        }
    }

    setGameOver() {
        this.gameOver = true;
        const savedRecord = localStorage.getItem("record");
        const record = (savedRecord === 'null' || this.score > savedRecord ? this.score : savedRecord) || this.score;
        localStorage.setItem("record", record);
        this.game.innerHTML = `<h1>Game Over</h1><h2>Score:${this.score}<h2><h3>Record:${record}<h3>`;
    }

    increaseLevel() {
        this.level += 1;
        this.height += 1;
        this.width += 1;

        this.levelDom.innerText = this.level;

        this.cells.forEach(cell => cell.changeColor('white'));

        this.instatiateBoard();
    }
}

class Cell {
    parentNode = null;
    color = null;
    minTimeToChange = 3;
    maxTimeToChange = 15;
    timeTochange = 0;
    currentTime = 0;

    constructor (parentNode, game) {
        this.parentNode = parentNode;
        this.game = game;
        this.dom = document.createElement("span");
        this.dom.className = 'cell';
        this.parentNode.appendChild(this.dom);
        this.dom.addEventListener("click", this.click.bind(this));
        this.getNewTime();
    }

    click() {
        if(this.color === 'green') {
            this.currentTime = 0;
            this.changeColor('gray', true);
            this.game.addScore();
        } else if(this.color === 'red') {
            this.currentTime = 0;
            this.game.removeLife();
            this.changeColor('black', true);
        }

    }

    getNewTime () {
        this.timeTochange = randomRange(this.minTimeToChange, this.maxTimeToChange);
    }

    changeColor(color, playerClick) { 
        if(this.color === 'green' && color !== 'white' && !playerClick) {
            this.game.removeChance();
            color = 'black';
        }

        this.color = color || config.colors[randomRange(0, config.colors.length)];
        this.dom.className = 'cell ' + this.color;
    }

    update() {
        if(Game.time) {
            this.currentTime += Game.time.deltaTime;

            if(this.currentTime > this.timeTochange) {
                this.currentTime = 0;
                this.changeColor();
                this.getNewTime();
            }
        }
    }
}

function randomRange(min, max) {
    return min + Math.floor(Math.random() * max);
}

new Game();