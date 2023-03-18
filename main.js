let rows;
let columns;
const cardsList = document.querySelector('.cards');
const timerDisplay = document.querySelector('.time');
const refreshBtn = document.querySelector('.btn');
const timerBox = document.querySelector('.elapsed-time');
const modal = document.querySelector('.modal');
const modalMessage = document.querySelector('.modal-message');
const closeBtn = document.querySelector('.modal-close');
const startBtn = document.querySelector('.modal-btn');
const instructionsModal = document.querySelector('.modal-instructions');

let cardsArr = [];
let flippedCards = [];
let matchedCards = [];
let timeLeft = 30;
let timerStarted = false;
let gameStarted = false;
let timer;
let defaultColor = '#c5c2c2';
let currentDifficulty = 'medium';

refreshBtn.addEventListener('click', resetGame);

startBtn.addEventListener('click', startGame);

vkBridge.send("VKWebAppCheckNativeAds", { "ad_format": "interstitial" });

// Кнопки выбора сложности
const difficultyBtns = document.querySelectorAll('.difficulty__btn');

difficultyBtns.forEach((btn) => {
	btn.addEventListener('click', (e) => {
		const difficulty = e.target.dataset.difficulty;
		console.log('выбор сложности')
		resetGame();
		setupGame(difficulty);
	});
});



// Настройка игрового поля
function setupGame(difficulty) {

	cardsList.innerHTML = '';

	currentDifficulty = difficulty;

	if (difficulty === "easy") {
		rows = 2;
		columns = 4;
		timeLeft = 15;
	} else if (difficulty === "medium") {
		rows = 4;
		columns = 4;
		timeLeft = 30;
	} else if (difficulty === "hard") {
		rows = 6;
		columns = 4;
		timeLeft = 60;
	}

	// Устанавливаем количество строк и столбцов для игрового поля
	cardsList.style.setProperty('--rows', rows);
	cardsList.style.setProperty('--columns', columns);

	cardsArr = [];
	game();
}


function startGame() {
	instructionsModal.style.display = 'none';

	vkBridge.send('VKWebAppShowBannerAd', {
		banner_location: 'bottom'
	})
		.then((data) => {
			if (data.result) {
				// Баннерная реклама отобразилась
			}
		})
		.catch((error) => {
			// Ошибка
			console.log(error);
		});
}

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

	// Если карточка уже перевернута или она уже совпала, то не реагируем на нажатие
	if (clickedCard.classList.contains('flipped') || clickedCard.classList.contains('matched')) {
		return;
	}

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
	numArray();
	shuffleCards(cardsArr);

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

// Если пользователь победил
function checkWin() {
	if (matchedCards.length === cardsArr.length) {
		showModal("Вы выиграли!");
		resetGame();
	}
}

// сброс игры
function resetGame() {
	// Остановить таймер, если он был запущен
	if (timerStarted) {
		clearInterval(timer);
	}
	gameStarted = false;
	timerStarted = false;
	timeLeft = 30;
	timerDisplay.textContent = timeLeft;
	timerBox.style.background = defaultColor;
	setupGame(currentDifficulty);
}

// вызываем setupGame с начальной сложностью "средне"
setupGame('medium');

// модальное окно
function showModal(message) {

	modalMessage.textContent = message;
	modal.style.display = 'flex';

	closeBtn.addEventListener('click', () => {
		modal.style.display = 'none';
		setTimeout(addAds, 300);
	});
}

function addAds() {
	vkBridge.send("VKWebAppShowNativeAds", { ad_format: "interstitial" })
		.then(data => console.log(data.result))
		.catch(error => console.log(error));
}