const calculatorScreen = document.getElementById('calculatorScreen');
const historyScreen = document.getElementById('historyScreen');
const searchInput = document.querySelector('.search-box input');
const clearAllButton = document.querySelector('.clear-all-button');
const historyEmpty = document.querySelector('.history-empty');
const historyList = document.querySelector('.history-list');
const backButton = document.querySelector('.back-button');
const iconButtons = document.querySelectorAll('.icon-button');

let history = [];

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
