const calculatorScreen = document.getElementById('calculatorScreen');
const historyScreen = document.getElementById('historyScreen');
const searchInput = document.querySelector('.search-box input');
const clearAllButton = document.querySelector('.clear-all-button');
const historyEmpty = document.querySelector('.history-empty');
const historyList = document.querySelector('.history-list');
const backButton = document.querySelector('.back-button');
const iconButtons = document.querySelectorAll('.icon-button');
const display = document.getElementById('display');
const keys = document.querySelectorAll('.key');

let history = [];
let expression = '';
let inverseMode = false;

function updateDisplay(value = expression || '0') {
  display.textContent = value;
}

function calculate(value) {
  const normalized = value
    .replaceAll('π', 'Math.PI')
    .replaceAll('×', '*')
    .replaceAll('÷', '/')
    .replaceAll('−', '-')
    .replaceAll('^', '**')
    .replace(/\bsin\(/g, 'Math.sin(')
    .replace(/\bcos\(/g, 'Math.cos(')
    .replace(/\btan\(/g, 'Math.tan(')
    .replace(/\blog\(/g, 'Math.log10(')
    .replace(/\bexp\(/g, 'Math.exp(')
    .replace(/\babs\(/g, 'Math.abs(')
    .replace(/(\d+(?:\.\d+)?)!/g, 'factorial($1)');

  if (!/^[0-9+\-*/%().,\sA-Za-z_*]+$/.test(normalized)) {
    throw new Error('Invalid expression');
  }

  const factorial = (number) => {
    if (!Number.isInteger(number) || number < 0 || number > 170) {
      throw new Error('Invalid factorial');
    }
    return number === 0 ? 1 : number * factorial(number - 1);
  };

  const result = Function('factorial', `"use strict"; return (${normalized})`)(factorial);
  if (!Number.isFinite(result)) {
    throw new Error('Invalid result');
  }
  return String(Number(result.toFixed(12)));
}

function applyFunction(label) {
  if (!expression) return;

  if (label === 'x²') expression = `(${expression})^2`;
  else if (label === '1/x') expression = `1/(${expression})`;
  else if (label === '|x|') expression = `abs(${expression})`;
  else if (label === 'exp') expression = `exp(${expression})`;
  else if (label === 'n!') expression = `(${expression})!`;
  else if (['sin', 'cos', 'tan', 'log'].includes(label)) {
    const functionName = inverseMode ? `a${label}` : label;
    expression = `${functionName}(${expression})`;
  }
  updateDisplay();
}

keys.forEach((key) => {
  key.addEventListener('click', () => {
    const label = key.textContent.trim();

    if (label === 'AC') {
      expression = '';
      updateDisplay();
      return;
    }

    if (label === '⌫') {
      expression = expression.slice(0, -1);
      updateDisplay();
      return;
    }

    if (label === '=') {
      try {
        const result = calculate(expression);
        if (expression) {
          history.push(`${expression} = ${result}`);
          expression = result;
          updateDisplay();
        }
      } catch {
        expression = '';
        updateDisplay('Error');
      }
      return;
    }

    if (label === '2nd') {
      inverseMode = !inverseMode;
      key.classList.toggle('is-active', inverseMode);
      return;
    }

    if (['x²', '1/x', '|x|', 'exp', 'n!', 'sin', 'cos', 'tan', 'log'].includes(label)) {
      applyFunction(label);
      return;
    }

    if (label === 'e') expression += '2.718281828459045';
    else if (label === 'X') expression += '×';
    else expression += label;
    updateDisplay();
  });
});

function renderHistory() {
  const query = searchInput.value.trim().toLowerCase();
  const filtered = history.filter((item) => item.toLowerCase().includes(query));

  if (filtered.length === 0) {
    historyList.hidden = true;
    historyEmpty.hidden = false;
    historyEmpty.innerHTML = '<p>Belum ada riwayat.</p>';
    return;
  }

  historyList.hidden = false;
  historyEmpty.hidden = true;
  historyList.innerHTML = filtered
    .slice()
    .reverse()
    .map((item) => `<li class="history-item">${item}</li>`)
    .join('');
}

clearAllButton.addEventListener('click', () => {
  history = [];
  renderHistory();
});

searchInput.addEventListener('input', renderHistory);
backButton.addEventListener('click', () => {
  calculatorScreen.classList.remove('hidden');
  historyScreen.classList.add('hidden');
});

iconButtons.forEach((button) => {
  button.addEventListener('click', () => {
    const action = button.dataset.action;

    if (action === 'theme') {
      const isLight = document.body.classList.toggle('theme-light');
      button.classList.toggle('is-active', isLight);
      button.textContent = isLight ? '☀' : '✦';
      return;
    }

    if (action === 'history') {
      calculatorScreen.classList.add('hidden');
      historyScreen.classList.remove('hidden');
      renderHistory();
    }
  });
});

renderHistory();
