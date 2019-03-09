const button = document.querySelectorAll('.calc-button');
const calcProcess = document.querySelector('.calc-machine_header-process');
const calcResult = document.querySelector('.calc-machine_header-result');
let tempNumber = '';
let tempProcess = '';
let lastOpeartor = true; // 最後端是運算符
let haveOutcome = false;


function calcCheck(e) {
  e.preventDefault();
  // 三種點擊狀態: 數字 、運算符、結果
  if (e.target.classList.contains('number')) {
    calcNumber(e);
  } else if (e.target.classList.contains('operation')) {
    calcOperation(e);
  } else {
    getResult(e);
  }
}

// 輸入數字
function calcNumber(e) {
  const inputNumber = e.target.textContent;
  if (haveOutcome) {
    allClear();
  }
  // 最尾端是運算符接數字時初始化
  if (lastOpeartor) {
    tempNumber = '';
  }
  switch (inputNumber) {
    case '0':
      calcNumberZero(inputNumber);
      break;
    case '00':
      calcNumberZero(inputNumber);
      break;
    case '.':
      if (tempNumber.includes('.')) {
        tempNumber += '';
        tempProcess += '';
      } else if (lastOpeartor) {
        tempProcess += '0.';
        tempNumber = '0.';
      } else {
        tempProcess += '.';
        tempNumber += '.';
      }
      break;
    default:
      if (calcResult.innerHTML === '0') {
        tempNumber = inputNumber;
        // 避免先按 0 後接數字出現 "01" 狀況
        if (tempProcess.endsWith('0')) {
          tempProcess = tempProcess.slice(0, -1) + inputNumber;
        } else {
          tempProcess += inputNumber;
        }
      } else {
        tempNumber += inputNumber;
        tempProcess += inputNumber;
      }
      break;
  }
  calcResult.innerHTML = toCurrency(tempNumber);
  calcProcess.innerHTML = toCurrency(tempProcess);
  lastOpeartor = false;
}

function calcNumberZero(inputNumber) {
  if (lastOpeartor || calcResult.innerHTML === '0') {
    tempNumber = '0';
    if (tempProcess.endsWith('0')) {
      tempProcess += '';
    } else {
      tempProcess += '0';
    }
  } else {
    tempNumber += inputNumber;
    tempProcess += inputNumber;
  }
  return [tempNumber, tempProcess];
}

// 全清除、退一格、加入運算符
function calcOperation(e) {
  if (e.target.classList.contains('allClear')) {
    allClear();
  } else if (e.target.classList.contains('back')) {
    calcBack();
  } else {
    addOperator(e);
  }
}

function allClear() {
  tempNumber = '';
  tempProcess = '';
  calcResult.innerHTML = 0;
  calcProcess.innerHTML = tempProcess;
  lastOpeartor = true;
  haveOutcome = false;
}

function calcBack() {
  if (haveOutcome) {
    calcResult.innerHTML = 0;
    haveOutcome = false;
  }
  if (tempProcess.endsWith(' ')) {
    tempProcess = tempProcess.slice(0, -3);
    lastOpeartor = false;
  } else {
    tempProcess = tempProcess.slice(0, -1);
    tempNumber = tempNumber.slice(0, -1);
  }
  calcProcess.innerHTML = toCurrency(tempProcess);
  if (tempProcess.endsWith(' ')) {
    lastOpeartor = true;
  }
  if (tempNumber.length === 0) {
    calcResult.innerHTML = 0;
  } else {
    calcResult.innerHTML = toCurrency(tempNumber);
  }
}

function addOperator(e) {
  const operator = e.target.textContent;
  if (lastOpeartor) {
    return;
  }
  if (tempProcess.endsWith('.')) {
    tempProcess = tempProcess.slice(0, -1);
  }
  tempProcess += operator;
  calcProcess.innerHTML = tempProcess;
  lastOpeartor = true;
  haveOutcome = false;
}

function getResult() {
  if (lastOpeartor || haveOutcome) {
    return;
  }
  // replace() 字串替換 + 正則表達( /欲替換者/g, '替換者' ) http://www.w3school.com.cn/js/jsref_replace.asp
  const tempProcessArray = tempProcess.replace(/×/g, '*').replace(/÷/g, '/').replace(/−/g, '-').split(' ');
  for (let i = 0; i < tempProcessArray.length; i += 2) {
    let number1 = 0;
    let number2 = 0;
    let result = 0;
    if (tempProcessArray.includes('*') || tempProcessArray.includes('/')) {
      switch (tempProcessArray[i + 1]) {
        case '*':
          number1 = tempProcessArray[i];
          number2 = tempProcessArray[i + 2];
          result = calcProcessSequence(number1, number2, '*');
          tempProcessArray.splice(i, 3, result);
          i -= 2;
          break;
        case '/':
          number1 = tempProcessArray[i];
          number2 = tempProcessArray[i + 2];
          result = calcProcessSequence(number1, number2, '/');
          tempProcessArray.splice(i, 3, result);
          i -= 2;
          break;
        default:
          break;
      }
    } else {
      i = 0;
      switch (tempProcessArray[i + 1]) {
        case '+':
          number1 = tempProcessArray[i];
          number2 = tempProcessArray[i + 2];
          result = calcProcessSequence(number1, number2, '+');
          tempProcessArray.splice(i, 3, result);
          i -= 2;
          break;
        case '-':
          number1 = tempProcessArray[i];
          number2 = tempProcessArray[i + 2];
          result = calcProcessSequence(number1, number2, '-');
          tempProcessArray.splice(i, 3, result);
          i -= 2;
          break;
        default:
          break;
      }
    }
  }
  const outPut = tempProcessArray.toString();
  if (Number.isNaN(outPut) || outPut === 'Infinity' || outPut === '-Infinity') {
    calcResult.innerHTML = 0;
    calcProcess.innerHTML = 'error';
  } else {
    calcResult.innerHTML = toCurrency(outPut);
    calcProcess.innerHTML += ' = ';
  }
  haveOutcome = true;
}

function calcProcessSequence(number1, number2, operator) {
  let num1 = number1;
  let num2 = number2;
  let point1 = 0; // 小數點後的位數
  let point2 = 0; // 小數點後的位數
  let m = 0;
  let n = 0;
  let getResultNumber = 0;
  if (num1.toString().includes('.')) {
    point1 = num1.toString().split('.')[1].length;
  } else {
    point1 = 0;
  }
  if (num2.toString().includes('.')) {
    point2 = num2.toString().split('.')[1].length;
  } else {
    point2 = 0;
  }
  switch (operator) {
    case '+':
      m = Math.pow(10, Math.max(point1, point2));
      getResultNumber = Math.round(num1 * m + num2 * m) / m;
      break;
    case '-':
      m = Math.pow(10, Math.max(point1, point2));
      n = (point1 >= point2) ? point1 : point2;
      getResultNumber = (Math.round(num1 * m - num2 * m) / m).toFixed(n);
      break;
    case '*':
      num1 = num1.toString().replace('.', '');
      num2 = num2.toString().replace('.', '');
      console.log(num1);
      console.log(num2);
      getResultNumber = (num1 * num2) / Math.pow(10, (point1 + point2));
      break;
    case '/':
      num1 = num1.toString().replace('.', '');
      num2 = num2.toString().replace('.', '');
      getResultNumber = (num1 / num2) * Math.pow(10, (point2 - point1));
      break;
    default:
      break;
  }
  return getResultNumber;
}

function toCurrency(num) {
  const parts = num.toString().split('.');
  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  return parts.join('.');
}

// 所有 button 綁定事件
button.forEach((item) => {
  item.addEventListener('click', calcCheck, false);
});
