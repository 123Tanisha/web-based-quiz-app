const apiEndpoint = 'data.json';

const scoreText = document.getElementById('score-text');
const questionText = document.getElementById('question-text');
const optionsList = document.getElementById('options');
const startBtn = document.getElementById('start-btn');
const nextBtn = document.getElementById('next-btn');
const quizContainer = document.getElementById('quiz');
const resultsSection = document.getElementById('results');
const timerDisplay = document.getElementById('time-left');
const progressBar = document.getElementById('progress-bar');

let currentQuestionIndex = 0;
let score = 0;
let questions = [];
let timeLeft = 10;
let timer;

async function fetchQuizData() {
    try {
        const response = await fetch(apiEndpoint);
        if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
        const data = await response.json();
        questions = data.questions;
        displayQuestion();
    } catch (error) {
        console.error('Failed to load quiz data:', error);
    }
}

function startTimer() {
    timeLeft = 10;
    timerDisplay.textContent = timeLeft;
    clearInterval(timer);
    timer = setInterval(() => {
        timeLeft--;
        timerDisplay.textContent = timeLeft;
        if (timeLeft <= 0) {
            clearInterval(timer);
            nextQuestion();
        }
    }, 1000);
}

function updateProgressBar() {
    let progress = ((currentQuestionIndex + 1) / questions.length) * 100;
    progressBar.innerHTML = `<span style="width: ${progress}%;"></span>`;
}

function displayQuestion() {
    if (currentQuestionIndex >= questions.length) {
        showResults();
        return;
    }

    const currentQuestion = questions[currentQuestionIndex];
    questionText.textContent = currentQuestion.description;
    optionsList.innerHTML = '';
    
    currentQuestion.options.forEach(option => {
        const optionItem = document.createElement('li');
        optionItem.textContent = option.description;
        optionItem.onclick = () => checkAnswer(option.description, optionItem);
        optionsList.appendChild(optionItem);
    });

    startTimer();
    updateProgressBar();
}

function checkAnswer(selectedOption, optionElement) {
    clearInterval(timer);
    
    const currentQuestion = questions[currentQuestionIndex];
    const correctOption = currentQuestion.options.find(option => option.is_correct);

    if (selectedOption === correctOption.description) {
        optionElement.classList.add('correct');
        score++;
    } else {
        optionElement.classList.add('wrong');
    }

    document.querySelectorAll('#options li').forEach(btn => btn.style.pointerEvents = 'none');
    nextBtn.style.display = 'block';
}

function showResults() {
    quizContainer.style.display = 'none';
    resultsSection.style.display = 'block';
    scoreText.textContent = `You scored ${score} out of ${questions.length}`;

    updateLeaderboard();
}

function updateLeaderboard() {
    let leaderboard = JSON.parse(localStorage.getItem('leaderboard')) || [];
    leaderboard.push(score);
    leaderboard.sort((a, b) => b - a);
    leaderboard = leaderboard.slice(0, 3);
    localStorage.setItem('leaderboard', JSON.stringify(leaderboard));

    const leaderboardElement = document.getElementById('leaderboard');
    leaderboardElement.innerHTML = '';
    leaderboard.forEach((s, index) => {
        leaderboardElement.innerHTML += `<li>#${index + 1} - Score: ${s}</li>`;
    });
}

function startQuiz() {
    startBtn.style.display = 'none'; 
    quizContainer.style.display = 'block';
    nextBtn.style.display = 'none';
    fetchQuizData();
}

function nextQuestion() {
    currentQuestionIndex++;
    if (currentQuestionIndex < questions.length) {
        displayQuestion();
        nextBtn.style.display = 'none';
    } else {
        showResults();
    }
}

function restartQuiz() {
    currentQuestionIndex = 0;
    score = 0;
    resultsSection.style.display = 'none';
    quizContainer.style.display = 'block';
    displayQuestion();
}

document.addEventListener("DOMContentLoaded", function() {
    startBtn.addEventListener('click', startQuiz);
    nextBtn.addEventListener('click', nextQuestion);
});

