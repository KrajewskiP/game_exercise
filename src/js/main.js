const config = {
	width: 5,
	height: 5,
	loopingDelay: 1000,
	greenCellPossibilityInPercentage: 30
}

class Tick {
	last = new Date();
	deltaTime = 0;

	constructor() {
		setInterval(this.update.bind(this), config.loopingDelay);
	}

	update() {
		const now = new Date();
		this.deltaTime = (now - this.last) / 1000;
		this.last = now;
	}
}

class Game {
	game = null;
	cells = [];
	currentTime = 0;
	width = config.width;
	height = config.height;
	score = 0;
	chances = 10;
	life = 3;
	level = 1;
	scoreToLevelUp = 10;
	gameEnded = false;

	scoreElement = null;
	chancesElement = null;
	levelElement = null;
	lifeElement = null;

	static time = null;

	constructor() {
		this.initGame();
	}

	initGame() {
		if (document.body) {
			this.instatiate();
		} else {
			document.addEventListener("DOMContentLoaded", () => {
				console.log("Test");
				this.instatiate();
			})
		}

		setInterval(this.update.bind(this), config.loopingDelay);
	}

	instatiate() {
		this.setInitial();

		this.drawBoard();

		Game.time = new Tick();
	}

	drawBoard() {
		for (let i = 0; i < this.height; i++) {
			this.addRow();
		}
	}

	updateBoard() {
		this.cells.forEach(c => c.clearClasses());
		this.game.childNodes.forEach(e => this.cells.push(new Cell(e, this)));
		this.addRow();
	}

	addRow() {
		const row = document.createElement("div");
		this.game.appendChild(row);
		for (let j = 0; j < this.width; j++) {
			this.cells.push(new Cell(row, this));
		}
	}

	update() {
		if (!this.gameEnded) {
			this.currentTime += Game.time.deltaTime;

			this.cells.forEach(c => c.update());
		}
	}

	setInitial() {
		this.game = document.getElementById("game");
		this.scoreElement = document.getElementById('score');
		this.chancesElement = document.getElementById('chances');
		this.levelElement = document.getElementById('level');
		this.lifeElement = document.getElementById('life');

		this.scoreElement.innerText = this.score;
		this.levelElement.innerText = this.level;
		this.chancesElement.innerText = this.chances;
		this.lifeElement.innerText = this.life;
	}

	levelUp() {
		this.width++;
		this.height++;
		this.levelElement.innerText = ++this.level;
		this.updateBoard();
	}

	addScore() {
		this.scoreElement.innerText = ++this.score;
		if (this.score > this.scoreToLevelUp) {
			this.levelUp();
			this.scoreToLevelUp = this.scoreToLevelUp * 2;
		}
	}

	decreaseChances() {
		this.chancesElement.innerText = --this.chances;

	}

	decreaseLife() {
		this.lifeElement.innerText = --this.life;
		if (this.life < 1) {
			this.endGame();
		}
	}

	endGame() {
		this.gameEnded = true;
		let bestResult = localStorage.getItem('bestResult');
		if (this.score > bestResult) {
			localStorage.setItem('bestResult', this.score);
			bestResult = this.score;
		}
		this.game.innerText = `Game over! Your score: ${this.score} | Your best result: ${bestResult}`;
	}
}

class Cell {
	parentNode = null;
	timeToChange = 0;
	currentTime = 0;
	greenPossibility = config.greenCellPossibilityInPercentage / 100;

	constructor(parentNode, game) {
		this.parentNode = parentNode;
		this.dom = document.createElement("span");
		this.dom.className = 'cell';
		this.timeToChange = this.setTimeToChange();
		this.parentNode.appendChild(this.dom);
		this.dom.addEventListener("click", this.click.bind(this));
		this.game = game;
	}

	setTimeToChange() {
		return Math.random() * 10 + 3;
	}

	click() {
		let classList = this.dom.classList;
		if (classList.contains('green')) {
			this.dom.classList.replace('green', 'grey');
			this.game.addScore();
		} else if (classList.contains('red')) {
			this.decreaseChances(true);
		}
	}

	update() {
		this.currentTime += Game.time.deltaTime;
		if (this.currentTime > this.timeToChange) {
			this.currentTime = 0;
			this.changeColor();
			this.timeToChange = this.setTimeToChange();
		}
	}

	changeColor() {
		let random = Math.random();
		if (this.dom.classList.contains('green')) {
			this.decreaseChances(false);
		} else {
			this.clearClasses();
			let green = 1 - this.greenPossibility;
			let otherColor = green / 2;
			if (random > green) {
				this.dom.classList.add('green');
			} else if (random <= green && random > otherColor) {
				this.dom.classList.add('red');
			} else if (random <= otherColor) {
				this.dom.classList.add('grey');
			}
		}
	}

	decreaseChances(clicked) {
		this.clearClasses();
		this.dom.classList.add('black');
		if (clicked) {
			this.game.decreaseChances();
		} else {
			this.game.decreaseLife();
		}
	}

	clearClasses() {
		this.dom.className = 'cell';
	}
}

new Game();