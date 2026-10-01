const screens = Array.from(document.querySelectorAll('.question-screen'));
const dots = Array.from(document.querySelectorAll('.progress-dots span'));
const answers = {
  grip: '',
  fingers: '',
  release: '',
  alignment: '',
};

let currentScreen = 0;
let hasStartedQuiz = false;

const answerLabels = {
  grip: {
    front: 'Front',
    middle: 'Middle',
    rear: 'Rear',
  },
  fingers: {
    2: '2',
    3: '3',
    4: '4+',
  },
  release: {
    clean: 'Clean',
    loose: 'Loose',
    inconsistent: 'Inconsistent',
    tight: 'Tight',
  },
  alignment: {
    level: 'Level',
    'not-level': 'Not Level',
  },
};

function trackEvent(name, params) {
  if (typeof window.trackDartsDnaEvent === 'function') {
    window.trackDartsDnaEvent(name, params);
    return;
  }
  if (typeof window.gtag === 'function') {
    window.gtag('event', name, params || {});
  }
}

function showScreen(index) {
  currentScreen = Math.max(0, Math.min(index, screens.length - 1));
  screens.forEach((screen, screenIndex) => {
    screen.classList.toggle('is-active', screenIndex === currentScreen);
  });
  updateProgress();
}

function updateProgress() {
  dots.forEach((dot, index) => {
    dot.classList.toggle('is-filled', index < Math.min(currentScreen + 1, 4));
    dot.classList.remove('is-half');
  });
}

function buildResultKey() {
  return [answers.grip, answers.fingers, answers.release, answers.alignment].join('|');
}

function handleAnswer(button) {
  const key = button.dataset.key;
  answers[key] = button.dataset.value;

  if (!hasStartedQuiz) {
    hasStartedQuiz = true;
    trackEvent('quiz_start');
  }

  trackEvent('quiz_answer', {
    question_number: currentScreen + 1,
    answer_key: key,
    answer_value: answers[key],
    answer_label: answerLabels[key]?.[answers[key]] || answers[key],
  });

  const screen = button.closest('.question-screen');
  screen.querySelectorAll('.answer-button').forEach((answerButton) => {
    answerButton.classList.remove('is-selected');
  });
  button.classList.add('is-selected');

  window.setTimeout(() => {
    if (currentScreen === 3) {
      const resultKey = buildResultKey();
      const publicSlug = window.DARTSDNA_RESULT_ROUTES?.[resultKey];
      if (!publicSlug) {
        console.error('No result page was found for this answer combination.');
        return;
      }
      trackEvent('quiz_complete', {
        result_slug: publicSlug,
        grip: answers.grip,
        fingers: answers.fingers,
        release: answers.release,
        alignment: answers.alignment,
      });
      window.location.href = `/results/${publicSlug}/index.html`;
      return;
    }
    showScreen(currentScreen + 1);
  }, 180);
}

document.querySelectorAll('.answer-button').forEach((button) => {
  button.addEventListener('click', () => handleAnswer(button));
});

document.querySelectorAll('.level-choice').forEach((button) => {
  button.addEventListener('click', () => handleAnswer(button));
});

document.querySelectorAll('[data-back]').forEach((button) => {
  button.addEventListener('click', () => showScreen(currentScreen - 1));
});

document.querySelectorAll('[data-back-home]').forEach((button) => {
  button.addEventListener('click', () => {
    window.location.href = '../index.html';
  });
});

showScreen(0);
