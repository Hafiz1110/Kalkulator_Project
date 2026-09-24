const resultEl = document.getElementById("result");
const expressionEl = document.getElementById("expression");
const historyPage = document.getElementById("historyPage");
const historyList = document.getElementById("historyList");
const searchHistory = document.getElementById("searchHistory");
const themeBtn = document.getElementById("themeBtn");
const historyBtn = document.getElementById("historyBtn");
const backBtn = document.getElementById("backBtn");
const clearHistoryBtn = document.getElementById("clearHistory");

let expression = "";
let lastResult = "0";
let history = JSON.parse(localStorage.getItem("calcHistory")) || [];

function formatNumber(value) {
  if (Number.isInteger(value)) return value.toString();
  return Number(value.toFixed(10)).toString();
}

function factorial(n) {
  const value = Number(n);
  if (!Number.isInteger(value) || value < 0) {
    throw new Error("Factorial hanya untuk bilangan bulat non-negatif");
  }
  if (value === 0 || value === 1) return 1;
  let total = 1;
  for (let i = 2; i <= value; i += 1) {
    total *= i;
  }
  return total;
}

function sanitizeExpression(value) {
  return value
    .replace(/×/g, "*")
    .replace(/÷/g, "/")
    .replace(/π/g, "PI")
    .replace(/e/g, "E")
    .replace(/mod/g, "mod")
    .replace(/sin\(/g, "sin(")
    .replace(/cos\(/g, "cos(")
    .replace(/tan\(/g, "tan(")
    .replace(/log\(/g, "log(")
    .replace(/sqrt\(/g, "sqrt(")
    .replace(/exp\(/g, "exp(")
    .replace(/IxI/g, "abs(")
    .replace(/n!/g, "!")
    .replace(/\^/g, "**");
}

function safeEvaluate(input) {
  let prepared = input.trim();
  if (!prepared) return "0";

  prepared = prepared.replace(/PI/g, "Math.PI");
  prepared = prepared.replace(/E/g, "Math.E");
  prepared = prepared.replace(/sin\(/g, "Math.sin(");
  prepared = prepared.replace(/cos\(/g, "Math.cos(");
  prepared = prepared.replace(/tan\(/g, "Math.tan(");
  prepared = prepared.replace(/log\(/g, "Math.log10(");
  prepared = prepared.replace(/sqrt\(/g, "Math.sqrt(");
  prepared = prepared.replace(/exp\(/g, "Math.exp(");
  prepared = prepared.replace(/abs\(/g, "Math.abs(");

  const factorialPattern = /(\d+(?:\.\d+)?)!/g;
  prepared = prepared.replace(
    factorialPattern,
    (_, value) => `factorial(${value})`,
  );

  const tokenized = prepared.replace(/\s+/g, "");
  const runtime = new Function("factorial", `return (${tokenized});`);
  const result = runtime(factorial);

  if (!Number.isFinite(result)) {
    throw new Error("Hasil tidak valid");
  }

  return formatNumber(result);
}

function updateDisplay() {
  expressionEl.textContent = expression || "";
  resultEl.textContent = lastResult || "0";
}

function addToExpression(value) {
  const operators = ["+", "-", "*", "/", "%", "^"];
  const isOperator = operators.includes(value);
  const lastChar = expression.slice(-1);

  if (value === "π") {
    expression += "π";
  } else if (value === "e") {
    expression += "e";
  } else if (value === "x^2") {
    expression += "^2";
  } else if (value === "x^y") {
    expression += "^";
  } else if (value === "1/x") {
    expression += "1/";
  } else if (value === "sqrt") {
    expression += "sqrt(";
  } else if (value === "sin") {
    expression += "sin(";
  } else if (value === "cos") {
    expression += "cos(";
  } else if (value === "tan") {
    expression += "tan(";
  } else if (value === "log") {
    expression += "log(";
  } else if (value === "exp") {
    expression += "exp(";
  } else if (value === "IxI") {
    expression += "abs(";
  } else if (value === "n!") {
    expression += "!";
  } else if (value === "mod") {
    expression += "%";
  } else if (value === "00") {
    expression += "00";
  } else if (value === ".") {
    if (
      !expression ||
      /[+\-*/%(]$/.test(expression) ||
      expression.endsWith(".")
    ) {
      expression += "0.";
    } else {
      const match = expression.match(/(\d+\.\d*|\d*)$/);
      if (match && match[0].includes(".")) {
        return;
      }
      expression += ".";
    }
  } else if (value === "(" || value === ")") {
    expression += value;
  } else if (isOperator) {
    if (!expression) {
      if (value === "-") expression += "-";
      return;
    }

    if (operators.includes(lastChar)) {
      expression = expression.slice(0, -1) + value;
    } else {
      expression += value;
    }
  } else {
    expression += value;
  }

  lastResult = expression ? "..." : "0";
  updateDisplay();
}

function clearAll() {
  expression = "";
  lastResult = "0";
  updateDisplay();
}

function backspace() {
  expression = expression.slice(0, -1);
  lastResult = expression ? "..." : "0";
  updateDisplay();
}

function evaluateExpression() {
  if (!expression) return;

  try {
    const raw = expression
      .replace(/π/g, "Math.PI")
      .replace(/e/g, "Math.E")
      .replace(/\^/g, "**")
      .replace(/sin\(/g, "Math.sin(")
      .replace(/cos\(/g, "Math.cos(")
      .replace(/tan\(/g, "Math.tan(")
      .replace(/log\(/g, "Math.log10(")
      .replace(/sqrt\(/g, "Math.sqrt(")
      .replace(/exp\(/g, "Math.exp(")
      .replace(/abs\(/g, "Math.abs(")
      .replace(/%/g, "/100");

    const compiled = new Function("Math", "factorial", `return (${raw});`);
    const result = compiled(Math, factorial);

    if (!Number.isFinite(result)) {
      throw new Error("Hasil tidak valid");
    }

    const resultString = formatNumber(result);
    const entry = `${expression} = ${resultString}`;
    history.unshift(entry);
    history = history.slice(0, 20);
    localStorage.setItem("calcHistory", JSON.stringify(history));

    expression = resultString;
    lastResult = resultString;
    updateDisplay();
    renderHistory();
  } catch (error) {
    lastResult = "Error";
    updateDisplay();
  }
}

function renderHistory() {
  const query = searchHistory.value.trim().toLowerCase();
  const filtered = history.filter((item) => item.toLowerCase().includes(query));

  if (!filtered.length) {
    historyList.innerHTML =
      '<div class="empty-history">Belum ada riwayat</div>';
    return;
  }

  historyList.innerHTML = filtered
    .map((item) => {
      const [expr, result] = item.split("=").map((part) => part.trim());
      return `
                <div class="history-item" data-value="${item}">
                    <div class="history-expression">${expr}</div>
                    <div class="history-result">${result || item}</div>
                </div>
            `;
    })
    .join("");

  historyList.querySelectorAll(".history-item").forEach((item) => {
    item.addEventListener("click", () => {
      const raw = item.dataset.value.split("=")[0].trim();
      expression = raw;
      lastResult = raw || "0";
      updateDisplay();
      historyPage.classList.remove("open");
    });
  });
}

function toggleHistory() {
  historyPage.classList.toggle("open");
}

function toggleTheme() {
  document.body.classList.toggle("light-mode");
  const isLight = document.body.classList.contains("light-mode");
  themeBtn.textContent = isLight ? "☾" : "☀";
}

function handleButtonAction(button) {
  const value = button.dataset.value;

  if (!value) return;

  if (value === "AC") {
    clearAll();
    return;
  }

  if (value === "backspace") {
    backspace();
    return;
  }

  if (value === "=") {
    evaluateExpression();
    return;
  }

  addToExpression(value);
}

document.querySelectorAll(".buttons button").forEach((button) => {
  button.addEventListener("click", () => handleButtonAction(button));
});

historyBtn.addEventListener("click", toggleHistory);
backBtn.addEventListener("click", () => historyPage.classList.remove("open"));
clearHistoryBtn.addEventListener("click", () => {
  history = [];
  localStorage.removeItem("calcHistory");
  renderHistory();
});

searchHistory.addEventListener("input", renderHistory);

themeBtn.addEventListener("click", toggleTheme);

document.addEventListener("keydown", (event) => {
  const key = event.key;
  if (/^[0-9]$/.test(key)) {
    addToExpression(key);
  } else if (["+", "-", "*", "/", "%", "."].includes(key)) {
    addToExpression(key);
  } else if (key === "Enter" || key === "=") {
    evaluateExpression();
  } else if (key === "Backspace") {
    backspace();
  } else if (key === "Escape") {
    clearAll();
  }
});

renderHistory();
updateDisplay();
