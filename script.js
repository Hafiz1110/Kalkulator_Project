const display = document.getElementById("display");

let current = "0";
let stored = null;
let operator = null;
let waitingForNextNumber = false;

function render() {
  display.textContent = current || "0";
}

function clearAll() {
  current = "0";
  stored = null;
  operator = null;
  waitingForNextNumber = false;
  render();
}

function inputNumber(value) {
  if (waitingForNextNumber) {
    current = "0";
    waitingForNextNumber = false;
  }

  current = current === "0" ? value : current + value;
  render();
}

function inputDecimal() {
  if (waitingForNextNumber) {
    current = "0";
    waitingForNextNumber = false;
  }

  if (!current.includes(".")) {
    current += ".";
  }

  render();
}

function calculate(a, b, op) {
  switch (op) {
    case "+":
      return a + b;
    case "-":
      return a - b;
    case "*":
      return a * b;
    case "/":
      return b === 0 ? "Error" : a / b;
    case "%":
      return (a * b) / 100;
    case "^":
      return a ** b;
    default:
      return b;
  }
}

function handleOperator(nextOperator) {
  const inputValue = Number(current);

  if (stored !== null && operator !== null) {
    const result = calculate(Number(stored), inputValue, operator);
    stored = result;
    current = String(result);
  } else {
    stored = inputValue;
  }

  operator = nextOperator;
  waitingForNextNumber = true;
  render();
}

function evaluateEquals() {
  if (stored === null || operator === null) return;

  const result = calculate(Number(stored), Number(current), operator);
  current = String(result);
  stored = null;
  operator = null;
  waitingForNextNumber = true;
  render();
}

function backspace() {
  current = current.length <= 1 ? "0" : current.slice(0, -1);
  render();
}

function handleSpecial(value) {
  if (value === "clear") {
    clearAll();
    return;
  }

  if (value === "backspace") {
    backspace();
    return;
  }

  if (value === "=") {
    evaluateEquals();
    return;
  }

  if (value === "one_over") {
    current = current === "0" ? "Error" : String(1 / Number(current));
    waitingForNextNumber = true;
    render();
    return;
  }

  if (value === "square") {
    current = String(Number(current) ** 2);
    waitingForNextNumber = true;
    render();
    return;
  }

  if (value === "factorial") {
    let result = 1;
    for (let i = 2; i <= Number(current); i += 1) result *= i;
    current = String(result);
    waitingForNextNumber = true;
    render();
    return;
  }

  if (value === "pi") {
    current = String(Math.PI);
    waitingForNextNumber = true;
    render();
    return;
  }

  if (value === "sin") {
    current = String(Math.sin(Number(current)));
    waitingForNextNumber = true;
    render();
    return;
  }

  if (value === "cos") {
    current = String(Math.cos(Number(current)));
    waitingForNextNumber = true;
    render();
    return;
  }

  if (value === "tan") {
    current = String(Math.tan(Number(current)));
    waitingForNextNumber = true;
    render();
    return;
  }

  if (value === "log") {
    current = String(Math.log10(Number(current)));
    waitingForNextNumber = true;
    render();
    return;
  }

  if (value === "exp") {
    current = String(Math.exp(Number(current)));
    waitingForNextNumber = true;
    render();
    return;
  }

  if (value === "abs") {
    current = String(Math.abs(Number(current)));
    waitingForNextNumber = true;
    render();
    return;
  }

  if (value === "mod") {
    handleOperator("%");
    return;
  }

  if (value === "power") {
    handleOperator("^");
  }
}

document.querySelectorAll(".key").forEach((button) => {
  button.addEventListener("click", () => {
    const value = button.dataset.value;

    if (
      [
        "clear",
        "backspace",
        "=",
        "one_over",
        "square",
        "factorial",
        "pi",
        "sin",
        "cos",
        "tan",
        "log",
        "exp",
        "abs",
        "mod",
        "power",
      ].includes(value)
    ) {
      handleSpecial(value);
      return;
    }

    if (/^[0-9]$/.test(value)) {
      inputNumber(value);
      return;
    }

    if (value === ".") {
      inputDecimal();
      return;
    }

    if (["+", "-", "*", "/", "%", "^"].includes(value)) {
      handleOperator(value);
    }
  });
});

window.addEventListener("keydown", (event) => {
  const key = event.key;

  if (/^[0-9]$/.test(key)) {
    inputNumber(key);
  } else if (key === ".") {
    inputDecimal();
  } else if (["+", "-", "*", "/", "%", "^"].includes(key)) {
    handleOperator(key);
  } else if (key === "Enter" || key === "=") {
    evaluateEquals();
  } else if (key === "Backspace") {
    backspace();
  } else if (key === "Escape") {
    clearAll();
  }
});

render();
