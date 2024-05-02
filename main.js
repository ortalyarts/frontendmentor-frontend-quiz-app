// Toggle theme switch

const toggleSwitch = document.querySelector('#theme-toggle-button');
const btnToggleText = document.querySelector('#toggle-announce');

//function that changes the theme, and sets a localStorage variable to track the theme between page loads
const switchToDarkTheme = () => {
    localStorage.setItem('theme', 'dark');
    document.documentElement.setAttribute('data-theme', 'dark');
    toggleSwitch.checked = true;
    btnToggleText.innerText = "switch to light theme";
}
const switchToLightTheme = () => {
    localStorage.setItem('theme', 'light');
    document.documentElement.setAttribute('data-theme', 'light');
    toggleSwitch.checked = false;
    btnToggleText.innerText = "switch to dark theme";
}
function switchTheme(e) {
    if (e.target.checked) {
        switchToDarkTheme();
    } else {
        switchToLightTheme();
    }    
}

//listener for changing themes
toggleSwitch.addEventListener('change', switchTheme, false);

//pre-check if the user has set dark color scheme in computer preferences
const mediaQueryDarkMode = window.matchMedia('(prefers-color-scheme: dark)');
if (mediaQueryDarkMode && mediaQueryDarkMode.matches) {
    switchToDarkTheme();
};


// Get data from JSON


let storedData; // stores the data from the JSON

async function fetchData(){
    try{
        const response = await fetch(`./data.json`)

        if(!response.ok){
            throw new Error("Could not fetch resource")
        }

        const data = await response.json();

        // ==== if json data ok:
        storedData = data; 
        // ======

    }
    catch(error){
        console.log(error);
    }
}
fetchData();

const texts = {
    startPageH1 : "Welcome to the",
    startPageBold : "Frontend Quiz!",
    resultPageH1 : "Quiz completed",
    resultPageBold : "You scored...",
    errorMessage1 : "Please select an answer",
    buttonRight : "Correct! Next Question.",
    buttonWrong : "Wrong! Next Question."
}
const elements = {
    sectionHeaderQuestionPage : document.querySelector('#question-page'),
    scoreHeading : document.querySelector('.score'),
    homepageH1 : document.querySelector('#page-title'),
    resultAnnouncement : document.querySelector('#result-announcement'),
    animatedElements : document.querySelectorAll(".js-slide")
}

const mainTitlePart1 = document.querySelector('#main-title-part1');
const mainTitlePart2 = document.querySelector('#main-title-part2');
const subTitle = document.querySelector('#sub-title');
const headingSelectedSubject = document.querySelector('.heading-selected-subject');

let selectedSubject = null; // stores object with questions of the selected subject
let index = 0; // question number
let score = 0;

const populateQuestion = (index) => {
    questionNumber.innerText = `Question ${index + 1} of ${selectedSubject.questions.length}`;
    questionText.innerText = selectedSubject.questions[index].question;
    answerOptions.forEach((label, optionNumber) => {
        label.querySelector('span.headingS').innerText = selectedSubject.questions[index].options[optionNumber];
    })
    // Fallback if 'prefers-reduced-motion' in CSS is not supported
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
      if (mediaQuery && !mediaQuery.matches) {
        questionsAnimation();
      }
   }


const questionNumber = document.querySelector('#question-page h1');
const questionText = document.querySelector('#question-page h2');
const answerOptions = Array.from(document.querySelectorAll('.radio-label'));

const subjectButtons = Array.from(document.querySelectorAll('.subject'));

subjectButtons.forEach((subject, i) => {
    subject.addEventListener('click', (event) => {
        event.preventDefault(); // prevents refreshing the page
        const subjectTitle = subject.querySelector('span.headingS').innerText; // get selected subject
        selectedSubject = storedData.quizzes.find(({ title }) => title === subjectTitle);

        headingSelectedSubject.classList.add(`bg-${selectedSubject.title.toLowerCase()}`)
        headingSelectedSubject.innerHTML = `
          <div class="icon-holder">
            <img src="${selectedSubject.icon}" aria-hidden="true" alt="" width="40" height="40" />
          </div>
          <h3 class="headingS">${selectedSubject.title}</h3>
        `

        // change start-page to question-page
        document.querySelector('#start-page').classList.add('hide');
        elements.sectionHeaderQuestionPage.classList.remove('hide');
        document.querySelector('#subjects').classList.add('hide');
        document.querySelector('#questions').classList.remove('hide');

        populateQuestion(index);
        elements.sectionHeaderQuestionPage.focus();
    })
    subject.style.animation = `.3s ease-out forwards 0.${i}s grow`;
})

const btnSubmitAnswer = document.querySelector('#check-answer');
const btnNext = document.querySelector('#next-question');
const btnViewScore = document.querySelector('#view-score');
const btnPlayAgain = document.querySelector('#play-again');
const invalidMessage = document.querySelector('#invalid-message');

btnSubmitAnswer.addEventListener('click', () => {
    const selectedRadio = document.querySelector('.radio-input:checked');
    const rightAnswer = selectedSubject.questions[index].answer; 
    if(selectedRadio){
        if(selectedRadio.parentElement.querySelector('span.headingS').innerText === rightAnswer){
            // If the answer is right
            score++;
            selectedRadio.parentElement.classList.add('answer-correct');
            elements.resultAnnouncement.innerText = "Correct!"; // for screenreader announcement
        }else{
            selectedRadio.parentElement.classList.add('answer-incorrect');
            const rightAnswerIndex = selectedSubject.questions[index].options.indexOf(rightAnswer);
            document.querySelector(`label[for="option-${rightAnswerIndex}"]`).classList.add('right-answer');
            elements.resultAnnouncement.innerText = "Wrong!"; // for screenreader announcement
        }
        if(index < (selectedSubject.questions.length - 1)){
            btnSubmitAnswer.classList.add('hide');
            btnNext.classList.remove('hide');
        }else {
            //btnViewScore.focus(); // for screenreader announcement
            btnViewScore.classList.remove('hide');
            btnSubmitAnswer.classList.add('hide');
        }
        invalidMessage.innerText = "";
        invalidMessage.classList.remove('activeMessage');
        selectedRadio.checked = false;
        progressBarAnimation();
    } else {
        invalidMessage.innerText = `${texts.errorMessage1}`;
        invalidMessage.classList.add('activeMessage');
    }
    clearQuestionsAnimation();
})
//remove correct / incorrect hints
const clearHints = () => {
    const answerCorrect = document.querySelector('.answer-correct');
    if(answerCorrect){answerCorrect.classList.remove('answer-correct');}
    const answerIncorrect = document.querySelector('.answer-incorrect');
    if(answerIncorrect){answerIncorrect.classList.remove('answer-incorrect');}
    const rightAnswer = document.querySelector('.right-answer');
    if(rightAnswer){rightAnswer.classList.remove('right-answer');}
}

btnNext.addEventListener('click', () => {
    index++;
    btnSubmitAnswer.classList.remove('hide');
    btnNext.classList.add('hide');
    
    clearHints();

    populateQuestion(index);
    elements.sectionHeaderQuestionPage.focus(); 
})

btnViewScore.addEventListener('click', () => {
    mainTitlePart1.innerText = texts.resultPageH1;
    mainTitlePart2.innerText = texts.resultPageBold;
    document.querySelector('#result-selected-subject').innerText = selectedSubject.title;
    document.querySelector('#score-number').innerText = score;
    document.querySelector('.result-subject').classList.add(`bg-${selectedSubject.title.toLowerCase()}`)
    document.querySelector('.result-subject img').setAttribute("src", `${selectedSubject.icon}`);

    // change question-page to result-page
    elements.sectionHeaderQuestionPage.classList.add('hide');
    document.querySelector('#questions').classList.add('hide');
    document.querySelector('#result').classList.remove('hide');
    document.querySelector('#start-page').classList.remove('hide'); // page headings
    subTitle.classList.add('hide');
    elements.scoreHeading.focus();

    sparkleAnimation();
})

btnPlayAgain.addEventListener('click', () => {

    btnViewScore.classList.add('hide');
    btnSubmitAnswer.classList.remove('hide');
    headingSelectedSubject.innerHTML = "";

    mainTitlePart1.innerText = texts.startPageH1;
    mainTitlePart2.innerText = texts.startPageBold;

    index = 0;
    score = 0;
    selectedSubject = null;
    clearHints();

    // Reeset Progress bar
    document.getElementById("progress-bar").style.width = "0%"
    width = 0;
    newWidth = 0;

    // change result-page to start-page
    document.querySelector('#result').classList.add('hide');
    document.querySelector('#subjects').classList.remove('hide');
    subTitle.classList.remove('hide');

    elements.homepageH1.focus();

    clearSparkleAnimation();
})

// Progress bar

let width = 0; //start point
let currentBacke;
let newWidth;

function progressBarAnimation() {

    const elem = document.getElementById("progress-bar");
    const elemContainerWidth = document.querySelector('.progress-bar-holder').clientWidth;
 
    let currentBackePercent = 10;

    let totalBacked = width + currentBackePercent; 

    // Animation for the progress bar
    document.querySelector(".progress-bar-animation").animate(
        [
            { opacity:1, transform: "translateX(0)" },
            { opacity:0, transform: "translateX(100%)" }
        ], {
            duration: 2000,
          }
    )

    let id = setInterval(frame, 10);
    function frame() {
        if (width >= totalBacked || width >= 100) {
        clearInterval(id);
        } else {
        width++; 
        elem.style.width = width + '%';
        }
    }
    newWidth = elem.clientWidth;
}

// Animating appearance of questions

const questionsAnimation = () => {
    questionText.style.animation = "blur-in-out 0.3s linear both";
    elements.animatedElements.forEach((el, index) => {
    el.style.animation = `slide-in-right 0.3s ease-out 0.${index}s both`
  })
}
const clearQuestionsAnimation = () => {
    questionText.style.animation = "";
    elements.animatedElements.forEach((el) => {
        el.style.animation = '';
  })
}

// Sparkles animation to show the Score

const sparkleAnimation = () => {
    const sparklesHolder = Array.from(document.querySelectorAll('.sparkles-holder span'));
    sparklesHolder.forEach((item, index) => {
        item.style.animation = `sparkles 1s .${index}s forwards`;
    })
}
const clearSparkleAnimation = () => {
    const sparklesHolder = Array.from(document.querySelectorAll('.sparkles-holder span'));
    sparklesHolder.forEach((item, index) => {
        item.style.animation = ``;
    })
}

