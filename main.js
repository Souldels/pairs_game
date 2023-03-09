const rows = 4;
const columns = 4;
const cardsList = document.querySelector('.cards');
const timerDisplay = document.querySelector('.time');
const refreshBtn = document.querySelector('.btn');
const timerBox = document.querySelector('.elapsed-time');
const modal = document.querySelector('.modal');
const modalMessage = document.querySelector('.modal-message');
const closeBtn = document.querySelector('.modal-close');

let cardsArr = [];
let flippedCards = [];
let matchedCards = [];
let timeLeft = 30;
let timerStarted = false;
let gameStarted = false;
let timer;
let defaultColor = '#c5c2c2';

refreshBtn.addEventListener('click', resetGame);

// функция таймера
function countdown() {

	if (gameStarted) {
		timerStarted = true;

		function updateTimer() {
			timeLeft--;
			timerDisplay.textContent = timeLeft;

			if (timeLeft === 0) {
				clearInterval(timer);
				showModal("Не повезло... Время вышло!");
				resetGame();
			}

			if (timeLeft < 10) {
				timerBox.style.background = '#dc3545';
			}
		}
		timer = setInterval(() => {
			if (timeLeft > 0) {
				updateTimer();
			}
		}, 1000);
	}
}

// Создание функции, генерирующей массив парных чисел.
function numArray() {
	for (let i = 1; i <= rows * columns / 2; i++) {
		cardsArr.push(i, i);
	}
	return cardsArr;
}

numArray();

// Создание функции перемешивания массива. 
function shuffleCards(arr) {
	for (let i = arr.length - 1; i > 1; i--) {
		const j = Math.floor(Math.random() * (i + 1));
		[arr[i], arr[j]] = [arr[j], arr[i]];
	}
	return arr;
}

shuffleCards(cardsArr);

// логика игры
function flipCard(e) {

	let clickedCard = e.currentTarget;
	gameStarted = true;

	if (flippedCards.length < 2) {

		flippedCards.push(clickedCard);
		clickedCard.classList.add('flipped');

		if (flippedCards.length === 2) {
			if (flippedCards[0].innerHTML === flippedCards[1].innerHTML) {
				matchedCards.push(flippedCards[0], flippedCards[1]);
				flippedCards = [];
				checkWin();
			} else {
				setTimeout(function () {
					flippedCards[0].classList.remove('flipped');
					flippedCards[1].classList.remove('flipped');
					flippedCards = [];
				}, 500);
			}
		}
	}

	if (!timerStarted) { // проверяем, запущен ли таймер
		countdown(); // запускаем таймер
	}
}

// рендер карточек
function game() {

	cardsArr.forEach((num) => {
		const card = document.createElement("li");
		card.classList.add('card');
		card.innerHTML = `<div class="card__inner">
											<div class="card__front"></div>
											<div class="card__back">${num}</div>
										</div>`;
		cardsList.appendChild(card);
		timerDisplay.textContent = timeLeft;

		card.addEventListener('click', flipCard);
	});
}

game();

// Если пользователь победил
function checkWin() {
	if (matchedCards.length === cardsArr.length) {
		showModal("Вы выиграли!");
		resetGame();
	}
}

// сброс игры
function resetGame() {
	cardsArr = [];
	flippedCards = [];
	matchedCards = [];
	cardsList.innerHTML = '';

	// Остановить таймер, если он был запущен
	if (timerStarted) {
		clearInterval(timer);
	}
	gameStarted = false;
	timerStarted = false;
	timeLeft = 30;
	timerBox.style.background = defaultColor;
	numArray();
	shuffleCards(cardsArr);
	game();
}

// модальное окно
function showModal(message) {

	modalMessage.textContent = message;
	modal.style.display = 'flex';

	closeBtn.addEventListener('click', () => {
		modal.style.display = 'none';
	});
}
