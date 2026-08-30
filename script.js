const expressionDisplay = document.getElementById("expression");
const resultDisplay = document.getElementById("result");

const numberButtons = document.querySelectorAll("[data-number]");
const operatorButtons = document.querySelectorAll("[data-operator]");
const actionButtons = document.querySelectorAll("[data-action]");

let currentInput = "";
let previousInput = "";
let currentOperator = null;
let shouldResetDisplay = false;


/* --------------------------------
   Number Buttons
-------------------------------- */

numberButtons.forEach(button => {

    button.addEventListener("click", () => {

        const value = button.dataset.number;

        handleNumber(value);

    });

});


/* --------------------------------
   Operator Buttons
-------------------------------- */

operatorButtons.forEach(button => {

    button.addEventListener("click", () => {

        const operator = button.dataset.operator;

        handleOperator(operator);

    });

});


/* --------------------------------
   Action Buttons
-------------------------------- */

actionButtons.forEach(button => {

    button.addEventListener("click", () => {

        const action = button.dataset.action;

        if (action === "clear") {
            clearCalculator();
        }

        if (action === "backspace") {
            backspace();
        }

        if (action === "equals") {
            calculateResult();
        }

    });

});


/* --------------------------------
   Handle Numbers
-------------------------------- */

function handleNumber(value) {

    clearError();

    if (shouldResetDisplay) {

        currentInput = "";
        shouldResetDisplay = false;

    }

    // Prevent multiple decimal points
    if (value === "." && currentInput.includes(".")) {
        return;
    }

    // Start decimal number with 0
    if (value === "." && currentInput === "") {
        currentInput = "0.";
    }

    // Prevent unnecessary leading zeros
    else if (value === "0" && currentInput === "0") {
        return;
    }

    else {
        currentInput += value;
    }

    updateDisplay();

}


/* --------------------------------
   Handle Operators
-------------------------------- */

function handleOperator(operator) {

    clearError();

    // Ignore operator when no number exists
    if (currentInput === "" && previousInput === "") {
        return;
    }

    // If user changes operator before entering another number
    if (currentInput === "" && previousInput !== "") {

        currentOperator = operator;

        expressionDisplay.textContent =
            `${previousInput} ${getOperatorSymbol(operator)}`;

        return;
    }

    // If there is already a calculation waiting
    if (previousInput !== "" && currentOperator !== null) {

        const result = operate(
            parseFloat(previousInput),
            parseFloat(currentInput),
            currentOperator
        );

        if (result === null) {
            showError("Cannot divide by zero");
            return;
        }

        previousInput = String(result);

    }

    else {

        previousInput = currentInput;

    }

    currentInput = "";
    currentOperator = operator;

    expressionDisplay.textContent =
        `${previousInput} ${getOperatorSymbol(operator)}`;

}


/* --------------------------------
   Calculate
-------------------------------- */

function calculateResult() {

    clearError();

    if (
        previousInput === "" ||
        currentInput === "" ||
        currentOperator === null
    ) {
        return;
    }

    const firstNumber = parseFloat(previousInput);
    const secondNumber = parseFloat(currentInput);

    const result = operate(
        firstNumber,
        secondNumber,
        currentOperator
    );

    if (result === null) {

        showError("Cannot divide by zero");

        currentInput = "";
        previousInput = "";
        currentOperator = null;

        return;
    }

    expressionDisplay.textContent =
        `${formatNumber(firstNumber)} ${getOperatorSymbol(currentOperator)} ${formatNumber(secondNumber)} =`;

    resultDisplay.textContent = formatNumber(result);

    currentInput = String(result);

    previousInput = "";
    currentOperator = null;

    shouldResetDisplay = true;

}


/* --------------------------------
   Mathematical Operations
-------------------------------- */

function operate(first, second, operator) {

    switch (operator) {

        case "+":
            return first + second;

        case "-":
            return first - second;

        case "*":
            return first * second;

        case "/":

            if (second === 0) {
                return null;
            }

            return first / second;

        case "%":

            if (second === 0) {
                return null;
            }

            return first % second;

        default:
            return second;
    }

}


/* --------------------------------
   Clear
-------------------------------- */

function clearCalculator() {

    currentInput = "";
    previousInput = "";
    currentOperator = null;
    shouldResetDisplay = false;

    expressionDisplay.textContent = "0";
    resultDisplay.textContent = "0";

    clearError();

}


/* --------------------------------
   Backspace
-------------------------------- */

function backspace() {

    clearError();

    if (shouldResetDisplay) {
        return;
    }

    currentInput = currentInput.slice(0, -1);

    updateDisplay();

}


/* --------------------------------
   Update Display
-------------------------------- */

function updateDisplay() {

    resultDisplay.textContent =
        currentInput || previousInput || "0";

    if (currentOperator && previousInput) {

        expressionDisplay.textContent =
            `${previousInput} ${getOperatorSymbol(currentOperator)}`;

    }

}


/* --------------------------------
   Error Message
-------------------------------- */

function showError(message) {

    resultDisplay.textContent = message;
    resultDisplay.classList.add("error");

}


/* --------------------------------
   Clear Error
-------------------------------- */

function clearError() {

    resultDisplay.classList.remove("error");

}


/* --------------------------------
   Operator Symbols
-------------------------------- */

function getOperatorSymbol(operator) {

    const symbols = {
        "+": "+",
        "-": "−",
        "*": "×",
        "/": "÷",
        "%": "%"
    };

    return symbols[operator] || operator;

}


/* --------------------------------
   Format Number
-------------------------------- */

function formatNumber(number) {

    if (!Number.isFinite(number)) {
        return "Error";
    }

    // Avoid long floating-point results
    const rounded =
        Math.round((number + Number.EPSILON) * 100000000) / 100000000;

    return String(rounded);

}


/* --------------------------------
   Keyboard Support
-------------------------------- */

document.addEventListener("keydown", event => {

    const key = event.key;

    if (/^[0-9.]$/.test(key)) {

        handleNumber(key);

    }

    else if (["+", "-", "*", "/", "%"].includes(key)) {

        handleOperator(key);

    }

    else if (key === "Enter" || key === "=") {

        event.preventDefault();

        calculateResult();

    }

    else if (key === "Backspace") {

        backspace();

    }

    else if (key === "Escape" || key.toLowerCase() === "c") {

        clearCalculator();

    }

});
