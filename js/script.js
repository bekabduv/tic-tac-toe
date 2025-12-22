// Get references to DOM elements
const rollBtn = get(".roll");
const cells = get(".cell", true);
const tableElem = get("table");
const dialog = get("dialog");
const winnerMsg = get(".winner-msg");
const restartBtn = get(".restart-btn");
const randomNumberBoard = get("random-number-board");
const randomNumberBtn = get(".random-number-btn");
const installBtn = get("install-btn");

// Game state variables
let turn = "x";
let cellNumber;
let randomNumber = 9;
let randomNumberArray = new Set([1, 2, 3, 4, 5, 6, 7, 8, 9]);
let isGameOver = false;
let isUsingRollBtn = false;
let gameOverMsg;
let interval;

// Set a random hue for board color
let hueRotate = Math.random() * 360;
document.documentElement.style.setProperty("--hue", hueRotate);

// PWA Install functionality
let deferredPrompt;

window.addEventListener("beforeinstallprompt", (e) => {
	e.preventDefault();
	deferredPrompt = e;
	installBtn.style.display = "block";
});

installBtn.addEventListener("click", async () => {
	if (!deferredPrompt) return;

	deferredPrompt.prompt();
	const { outcome } = await deferredPrompt.userChoice;

	if (outcome === "accepted") {
		installBtn.style.display = "none";
	}

	deferredPrompt = null;
});

window.addEventListener("appinstalled", () => {
	installBtn.style.display = "none";
});

// All possible winning combinations
const winningCombinations = [
	[0, 1, 2],
	[3, 4, 5],
	[6, 7, 8],
	[0, 3, 6],
	[1, 4, 7],
	[2, 5, 8],
	[0, 4, 8],
	[2, 4, 6],
];

// Main game logic class
class Play {
	constructor(
		rollBtn,
		cells,
		tableElem,
		dialog,
		winnerMsg,
		randomNumberBoard,
		randomNumberBtn,
	) {
		this.rollBtn = rollBtn;
		this.cells = [...cells];
		this.parent = tableElem;
		this.dialog = dialog;
		this.winnerMsg = winnerMsg;
		this.randomNumberBoard = randomNumberBoard;
		this.randomNumberBtn = randomNumberBtn;
		this.handleHover();
	}
	// Toggle hover class for X/O
	handleHover() {
		if (this.parent.classList.contains("x")) {
			this.parent.classList.remove("x");
			this.parent.classList.add("o");
		} else {
			this.parent.classList.remove("o");
			this.parent.classList.add("x");
		}
	}
	// Handle cell click or key event
	handleClick(e) {
		if (isGameOver) return;
		if (e.code == "Space") return;
		if (e.key == 0) return;
		if (e.type !== "click" && isNaN(e.key)) return;
		document.documentElement.style.setProperty("--hue", (hueRotate += 10));
		cellNumber = parseInt(e.target.id) - 1;
		if (Number(e.key)) {
			cellNumber = parseInt(e.key) - 1;
			if (!randomNumberArray.has(cellNumber + 1)) return;
		}
		this.cells[cellNumber].classList.add(turn);
		randomNumberArray.delete(cellNumber + 1);
		if (this.isWin()) {
			gameOverMsg = `${turn.toUpperCase()} has WON`;
			this.handleGameOver();
			return;
		}
		turn = turn == "x" ? "o" : "x";
		this.handleHover();
		if (this.isDraw()) {
			gameOverMsg = "DRAW";
			this.handleGameOver();
		}
	}
	isDraw() {
		return this.cells.every((cell) => {
			return cell.classList.contains("x") || cell.classList.contains("o");
		});
	}
	isWin() {
		return winningCombinations.some((combination) => {
			return combination.every((c) => {
				return this.cells[c].classList.contains(turn);
			});
		});
	}
	handleGameOver() {
		isGameOver = true;
		this.winnerMsg.innerText = gameOverMsg;
		setTimeout(() => {
			this.dialog.showModal();
		}, 200);
	}
	roll() {
		isUsingRollBtn = true;
		if (isGameOver) return;
		this.randomNumberBtn.addEventListener(
			"click",
			this.handleRandomNumberBtnClick.bind(this),
			{ once: true },
		);
		this.randomNumberBtn.innerText = this.getRandomNumber();
		if (randomNumberArray.size == 1) {
			return this.handleRandomNumberBtnClick();
		}
		this.randomNumberBoard.style.setProperty("display", "grid");
		this.randomNumberBtn.focus();
		interval = setInterval(() => {
			this.randomNumberBtn.innerText = this.getRandomNumber();
		}, 40);
	}
	handleRandomNumberBtnClick() {
		clearInterval(interval);
		setTimeout(() => {
			this.randomNumberBoard.style.setProperty("display", "none");
		}, 500);
		setTimeout(() => {
			this.handleClick({
				key: randomNumber,
				target: {
					id: randomNumber,
				},
			});
			randomNumberArray.delete(randomNumber);
		}, 1000);
		setTimeout(this.roll.bind(this), 1000);
	}
	getRandomNumber() {
		const randomIndex = Math.floor(Math.random() * randomNumberArray.size);
		randomNumber = [...randomNumberArray][randomIndex];
		return randomNumber;
	}
	handleRestart() {
		window.location.reload(true);
	}
}

function get(elem, bool) {
	if (bool) return document.querySelectorAll(elem);
	if (elem.includes(".")) return document.querySelector(elem);
	return document.getElementById(elem);
}
function handleRollBtnClick() {
	cells.forEach((cell) => {
		cell.removeEventListener("click", handleClick);
	});
	rollBtn.blur();
	play.roll();
}
const passElems = [
	rollBtn,
	cells,
	tableElem,
	dialog,
	winnerMsg,
	randomNumberBoard,
	randomNumberBtn,
];
const play = new Play(...passElems);
var handleClick = play.handleClick.bind(play);
cells.forEach((cell) => {
	cell.addEventListener("click", handleClick, { once: true });
});
rollBtn.addEventListener("click", handleRollBtnClick, { once: true });
document.addEventListener("keydown", play.handleClick.bind(play));
restartBtn.addEventListener("click", play.handleRestart.bind(play));
