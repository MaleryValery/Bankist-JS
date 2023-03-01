'use strict';

/////////////////////////////////////////////////
/////////////////////////////////////////////////
// BANKIST APP

// Data
const account1 = {
  owner: 'Jonas Schmedtmann',
  movements: [200, 455.23, -306.5, 25000, -642.21, -133.9, 79.97, 1300],
  interestRate: 1.2, // %
  pin: 1111,

  movementsDates: [
    '2021-11-18T21:31:17.178Z',
    '2021-12-23T07:42:02.383Z',
    '2022-01-28T09:15:04.904Z',
    '2022-04-01T10:17:24.185Z',
    '2022-05-08T14:11:59.604Z',
    '2023-02-27T17:01:17.194Z',
    '2023-02-28T23:36:17.929Z',
    '2023-03-01T10:51:36.790Z',
  ],
  currency: 'EUR',
  locale: 'pt-PT', // de-DE
};

const account2 = {
  owner: 'Jessica Davis',
  movements: [5000, 3400, -150, -790, -3210, -1000, 8500, -30],
  interestRate: 1.5,
  pin: 2222,

  movementsDates: [
    '2021-11-01T13:15:33.035Z',
    '2021-11-30T09:48:16.867Z',
    '2021-12-25T06:04:23.907Z',
    '2022-01-25T14:18:46.235Z',
    '2022-02-05T16:33:06.386Z',
    '2022-04-10T14:43:26.374Z',
    '2022-06-25T18:49:59.371Z',
    '2022-07-26T12:01:20.894Z',
  ],
  currency: 'USD',
  locale: 'en-US',
};

const accounts = [account1, account2];

// Elements
const labelWelcome = document.querySelector('.welcome');
const labelDate = document.querySelector('.date');
const labelBalance = document.querySelector('.balance__value');
const labelSumIn = document.querySelector('.summary__value--in');
const labelSumOut = document.querySelector('.summary__value--out');
const labelSumInterest = document.querySelector('.summary__value--interest');
const labelTimer = document.querySelector('.timer');

const containerApp = document.querySelector('.app');
const containerMovements = document.querySelector('.movements');

const btnLogin = document.querySelector('.login__btn');
const btnTransfer = document.querySelector('.form__btn--transfer');
const btnLoan = document.querySelector('.form__btn--loan');
const btnClose = document.querySelector('.form__btn--close');
const btnSort = document.querySelector('.btn--sort');

const inputLoginUsername = document.querySelector('.login__input--user');
const inputLoginPin = document.querySelector('.login__input--pin');
const inputTransferTo = document.querySelector('.form__input--to');
const inputTransferAmount = document.querySelector('.form__input--amount');
const inputLoanAmount = document.querySelector('.form__input--loan-amount');
const inputCloseUsername = document.querySelector('.form__input--user');
const inputClosePin = document.querySelector('.form__input--pin');

const formatedMovDate = function (date, local) {
  const calcDayPassed = (date1, date2) => Math.round(Math.abs(date2 - date1) / (1000 * 60 * 60 * 24))

  const daysPassed = calcDayPassed(new Date(), date);

  if (daysPassed === 0) return "Today";
  if (daysPassed === 1) return "Yesterday";
  if (daysPassed <= 7) return `${daysPassed} days ago`;
  else {

    return new Intl.DateTimeFormat(local).format(date)
  }
}

const formatCur = function (value, local, currency) {
  return new Intl.NumberFormat(local, {
    style: 'currency',
    currency: currency
  }).format(value)
}

const displayMovements = function (acc, sort = false) {
  containerMovements.innerHTML = '';

  const movs = sort ? acc.movements.slice().sort((a, b) => a - b) : acc.movements;

  movs.forEach(function (mov, i) {
    const type = mov > 0 ? 'deposit' : 'withdrawal';

    const date = new Date(acc.movementsDates[i]);
    const displayDate = formatedMovDate(date, acc.locale);

    const formatedMovment = formatCur(mov, acc.locale, acc.currency)

    const html = `
      <div class="movements__row">
        <div class="movements__type movements__type--${type}">${
      i + 1
    } ${type}</div>

        <div class="movements__date">${displayDate}</div>
        <div class="movements__value">${formatedMovment}</div>
      </div>
    `;

    containerMovements.insertAdjacentHTML('afterbegin', html);
  });
};



const calcDisplayBalance = function (acc) {
  acc.balance = acc.movements.reduce((acc, mov) => acc + mov, 0)

  labelBalance.textContent = formatCur(acc.balance, acc.locale, acc.currency);

}


const calcDisplaySummary = function (acc) {
  const incomes = acc.movements
    .filter(mov => mov > 0)
    .reduce((acc, mov) => acc + mov, 0);

  labelSumIn.textContent = formatCur(incomes, acc.locale, acc.currency);

  const out = acc.movements.filter(mov => mov < 0).reduce((acc, mov) => acc + mov, 0)
  labelSumOut.textContent = (formatCur(Math.abs(out), acc.locale, acc.currency));

  const interest = acc.movements
    .filter(mov => mov > 0)
    .map(diposit => (diposit * acc.interestRate) / 100)
    .filter((int) => int >= 1)
    .reduce((acc, int) => acc + int, 0)
  labelSumInterest.textContent = formatCur(interest, acc.locale, acc.currency);

}


const user = 'Steven Thomas Williams'; //STW
const createUserName = function (arr) {

  arr.forEach(function (el) {

    el.userName = el.owner
      .toLowerCase()
      .split(' ')
      .map(word => word[0])
      .join('');
  })
}
createUserName(accounts);
console.log(accounts);

const updateUI = function (account) {
  //display movments
  displayMovements(account);
  //display balance
  calcDisplayBalance(account);
  //display summary
  calcDisplaySummary(account);
}

const startLogoutTimer = function () {
  let time = 5 * 60;

  const tick = () => {
    let min = String(Math.trunc(time / 60)).padStart(2, 0);
    let sec = String(time % 60).padStart(2, 0);

    labelTimer.textContent = `${min}:${sec}`;


    if (time === 0) {
      clearInterval(timer)
      labelWelcome.textContent = `Log in to get started`;

      containerApp.style.opacity = 0;
    }
    time--;
  }

  tick();
  const timer = setInterval(tick, 1000)

  return timer;
}


//Event handler
/////////////////////////////////////////////////
/////////////////////////////////////////////////

let currentAccount, timer;

btnLogin.addEventListener('click', function (event) {
  event.preventDefault()

  currentAccount = accounts.find(acc => acc.userName === inputLoginUsername.value)
  console.log(currentAccount);

  if (currentAccount &&
    currentAccount.pin === +inputLoginPin.value) {
    //display UI and Welcome message
    labelWelcome.textContent = `Welcome back, ${currentAccount.owner.split(' ')[0]}`;

    containerApp.style.opacity = 1;

    const now = new Date();
    const options = {
      hour: 'numeric',
      minute: 'numeric',
      day: "numeric",
      month: "numeric",
      year: "numeric",
      //weekday: "long",
    }

    labelDate.textContent = new Intl.DateTimeFormat(currentAccount.locale, options).format(now)
    //clear login and pin
    inputLoginUsername.value = inputLoginPin.value = '';

    // clear cursor
    inputLoginPin.blur();

    if (timer) clearInterval(timer)
    timer = startLogoutTimer();
    //update UI
    updateUI(currentAccount);

  }
})


btnTransfer.addEventListener('click', function (e) {
  e.preventDefault();

  const amount = +inputTransferAmount.value;
  const receiverAcc = accounts.find(acc => acc.userName === inputTransferTo.value);

  inputTransferAmount.value = inputTransferTo.value = ""
  if (amount > 0 &&
    receiverAcc &&
    currentAccount.balance >= amount &&
    receiverAcc.userName !== currentAccount.userName) {
    currentAccount.movements.push(-amount);
    receiverAcc.movements.push(amount);

    currentAccount.movementsDates.push(new Date().toISOString())
    receiverAcc.movementsDates.push(new Date().toISOString())

    updateUI(currentAccount);

    clearInterval(timer)
    timer = startLogoutTimer()
  }
})

btnLoan.addEventListener('click', function (e) {
  e.preventDefault();
  const amount = Math.floor(inputLoanAmount.value);

  if (amount > 0 && currentAccount.movements.some(mov => mov >= amount * 0.1)) {
    setTimeout(function () {
      currentAccount.movements.push(amount);

      currentAccount.movementsDates.push(new Date().toISOString())

      updateUI(currentAccount)
    }, 2500)

    clearInterval(timer)
    timer = startLogoutTimer();
    // add movement 

  }
  inputLoanAmount.value = ""
})

btnClose.addEventListener('click', function (e) {
  e.preventDefault();

  if (currentAccount.userName === inputCloseUsername.value &&
    currentAccount.pin === +inputClosePin.value) {
    const index = accounts.findIndex(acc => acc.userName === currentAccount.userName)

    console.log(index);
    accounts.splice(index, 1)
    containerApp.style.opacity = 0;
  }
  inputCloseUsername.value = inputClosePin.value = ""
  console.log(accounts);
})
let isSorted = false
btnSort.addEventListener('click', function (e) {
  e.preventDefault();
  displayMovements(currentAccount, !isSorted);
  isSorted = !isSorted
})
labelBalance.addEventListener('click', () => {
  const rowsMovments = [...document.querySelectorAll('.movements__row')]


  rowsMovments.forEach(function (row, i) {
    if (i % 2 === 0) row.style.backgroundColor = '#F7F7F7';
    console.log(rowsMovments);
  })
})
/////////////////////////////////////////////////
/////////////////////////////////////////////////
// § Data 1: Julia's data [3, 5, 2, 12, 7], Kate's data [4, 1, 15, 8, 3] 
// § Data 2: Julia's data [9, 16, 6, 8, 3], Kate's data [10, 5, 6, 1, 4]

// const julia1 = [3, 5, 2, 12, 7]
// const julia2 = [9, 16, 6, 8, 3]

// const Kate1 = [4, 1, 15, 8, 3]
// const Kate2 = [10, 5, 6, 1, 4]

// const checkDogs = function (array1, array2) {

//   let correctArr1 = array1.splice(-2, 2);
//   correctArr1 = array1.splice(0, 1);
//   correctArr1 = array1;

//   let oneArr = [...correctArr1, ...array2];
//   oneArr.map((el, i, arr) => {
//     if (el > 3) {
//       console.log(el , arr);
//       return `Dog number ${i+1} is still a puppy 🐶`
//     } 
//     if (el < 3){
//       return `Dog number ${i+1} is an adult, and is ${el} years old 🐕`
//     }
//   })


// array.forEach((el , i) => {
//   if (el < 3){
//    console.log(`Dog number ${i+1} is still a puppy 🐶`)
//   } else {
//   console.log(`Dog number ${i+1} is an adult, and is ${el} years old 🐕`)}
// });
// }
// console.log(checkDogs(julia1, Kate1));
// console.log(checkDogs(julia2, Kate2));








// LECTURES

// const currencies = new Map([
//   ['USD', 'United States dollar'],
//   ['EUR', 'Euro'],
//   ['GBP', 'Pound sterling'],
// ]);

// const movements = [200, 450, -400, 3000, -650, -130, 70, 1300];

// console.log(movements);
// movements.sort((a, b) => {
//   if (a > b) return 1
//   if (a < b) return -1
// })
// console.log(movements);



// const x = new Array(7);
// x.fill(1)

// console.log(x);

// const y = Array.from({
//   length: 7
// }, () => 1);
// console.log(y);

// const z = Array.from({
//   length: 7
// }, (cur, i) => i + 1);
// console.log(z);


// const movementsUI = document.querySelectorAll('.movements__value')
// console.log(movementsUI.map(  el =>el.textContent.replace('€', "")));

// labelBalance.addEventListener('click', function () {

//   const movementsUI = Array.from(document.querySelectorAll('.movements__value'),
//                       el => Number(el.textContent.replace('€', "")))
//   console.log(movementsUI);
// })
// console.log(Math.trunc(Math.random() * 1000));
// const a = Array.from({
//     length: 100
//   }, (cur, i, arr) => {
//     let random = Math.trunc(Math.random() * 1000);
//     cur = random;
//     if (!arr.find(random)) {
//     }
// })
// console.log(a);


// const arr = [[1,2,4], [2,3,4], [27,45,3]]
// const arrDeep = [[1,2,[5,3,24, [3,4,5,6]]], [2,3,4], [27,45,3]]
// console.log(arr.flat());
// console.log(arrDeep.flat(3))

// const  accMovements = accounts.map(acc => acc.movements)
// console.log(accMovements);

// const allMove = accMovements.flat()
// console.log(allMove);
// const overAllBalance = allMove.reduce((acc, mov) => acc+ mov,0)
// console.log(overAllBalance);

// const overAllBalanceC = accounts
//   .map(acc => acc.movements)
//   .flat()
//   .reduce((acc, mov) => acc+ mov,0)
// console.log(overAllBalanceC);

// const overAllBalanceCF = accounts
//   .flatMap(acc => acc.movements)
//   .reduce((acc, mov) => acc+ mov,0)
// console.log(overAllBalanceCF);

// const deposit = mov => mov > 0

// console.log(account4.movements.every(deposit));
// console.log(account4.movements.some(deposit));
// console.log(account4.movements.filter(deposit));
// console.log(account4.movements.map(deposit));
// console.log(movements.includes(-130));

// const anyDeposit = movements.some((mov, i) =>{
//   console.log(`${i} ${mov >0}`)})
// console.log(anyDeposit);

// const filt = movements.find(mov => mov < 0)

// console.log(filt);
// const eurToUsd = 1.1;
// const deposit = movements
//   .filter(mov => mov > 0)
//   .map((mov) => mov * eurToUsd)
//   .reduce((acc, mov) => acc + mov, 0)
// console.log(deposit);


// const balance = movements.reduce((acc, cur, i, arr) => acc + cur, 0)

// console.log(balance);

// let ballanse2 = 0
// for (const mov of movements) ballanse2 += mov;
// console.log(ballanse2);

// const max = movements.reduce((acc, mov) => {
//   if (acc > mov) return acc
//   else return mov
// }, movements[0])
//console.log(max);

// const deposits = movements.filter(function(mov){
//   return mov > 0
// })
// console.log(deposits);

// const depositsFor =[]
// for (const mov of movements){
//   if (mov > 0) depositsFor.push(mov)
// }
// console.log(depositsFor);

// const withdr = movements.filter(mov => mov <0)
// console.log(withdr);
// const eurToUsd = 1.1;

// const moveToUsd = movements.map(mov => mov * eurToUsd)
// console.log(movements);
// console.log(moveToUsd);

// const moveToUsdFor = []
// for (let mov of movements) moveToUsdFor.push(mov * eurToUsd);
// console.log(moveToUsdFor);

// const moveDiscr = movements.map((mov, i, arr) =>{

//    return `Movement ${i+1}: You ${mov>0?'deposited':'withdrew'} ${Math.abs(mov)}`


//   // if(mov>0){
//   //  return`Movement ${i+1}: You deposited ${mov}`;
//   // } else {
//   //   return `Movement ${i+1}: You withdrew ${Math.abs(mov)}`;
//   // }
// })
// console.log(moveDiscr);


/////////////////////////////////////////////////

// const calcAverageHumanAge = function (ages) {
//   const humanAge = ages
//     .map(d => d <= 2 ? d * 2 : 16 + d * 4)
//     .filter(age => age >= 18)
//     .reduce((acc, cur, i, arr) => acc + cur / arr.length, 0)

//   console.log(humanAge);

// }


// calcAverageHumanAge([5, 2, 4, 1, 15, 8, 3])
// calcAverageHumanAge([16, 6, 10, 5, 6, 1, 4])

// const bankdepositSum = accounts
//   .flatMap(acc => acc.movements)
//   .filter(mov => mov > 0)
//   .reduce((acc, cur) => acc + cur, 0)

// console.log(bankdepositSum);

// const numDepos1000 = accounts
//   .flatMap(acc => acc.movements)
//   .filter(mov => mov >= 1000).length
// console.log(numDepos1000);

// const numDepos10002 = accounts
//   .flatMap(acc => acc.movements)
//   .reduce((acc, cur, i, arr) => cur >= 1000 ? ++acc : acc, 0)

// console.log(numDepos10002);

// const sums = accounts.flatMap(acc => acc.movements).reduce((sums, cur) => {
//   // cur > 0 ? sums.deposips += cur :  sums.withdrawals +=cur;
//   // return sums
//   sums[cur > 0 ? 'deposips' : "withdrawals"] += cur;
//   return sums
// }, {
//   deposips: 0,
//   withdrawals: 0
// })

// console.log(sums);

// const convertTitle = function (title) {
//   const capitalize = str => str[0].toUpperCase() + str.slice(1);

//   const exeptions = ['a', 'an', 'and', 'the', 'but', 'or', 'on', 'in', 'with'];

//   const titleCase = title
//     .toLowerCase()
//     .split(' ')
//     .map(word => exeptions.includes(word) ? word : capitalize(word))
//     .join(' ')

//   return capitalize(titleCase)

// }

// console.log(convertTitle('this a nice title'));
// console.log(convertTitle('this a LONG title but not too long'));
// console.log(convertTitle('and here is another title with an EXAMPLE'));

// const dogs = [{
//     weight: 22,
//     curFood: 250,
//     owners: ['Alice', 'Bob']
//   }, {
//     weight: 8,
//     curFood: 200,
//     owners: ['Matilda']
//   },
//   {
//     weight: 13,
//     curFood: 275,
//     owners: ['Sarah', 'John']
//   }, {
//     weight: 32,
//     curFood: 340,
//     owners: ['Michael']
//   },
// ];
// //1
// dogs.forEach((dog, i) => {
//   dog.recommendedFood = Math.trunc(dog.weight ** 0.75 * 28);
//   //2
//   dog.owners.find(owner => owner === 'Sarah') ? dog.curFood > dog.recommendedFood ? console.log('too much food') : console.log('too little food') : "";

//   // const recommendedFood = dog.Array.from({}, (cur) => cur.curFood > cur.recommendedFood ? dogs.ownersEatTooMuch.push(cur))
// })
// //3
// dogs.ownersEatTooMuch = [];
// dogs.ownersEatTooLittle = [];
// dogs.filter((cur, i) => cur.curFood > cur.recommendedFood ? dogs.ownersEatTooMuch.push(cur.owners) : dogs.ownersEatTooLittle.push(cur.owners))

// //4
// const modifyArr = (arr) => arr.flat().join(' and ')

// console.log(`${modifyArr(dogs.ownersEatTooMuch)}'s dogs eat too much!`);
// console.log(`${modifyArr(dogs.ownersEatTooLittle)}'s dogs eat too little!`);
// //5
// dogs.find(cur => cur.curFood === cur.recommendedFood ? console.log(true) : console.log(false))

// //6 
// console.log(dogs.reduce((acc, cur) => {
//   cur.curFood > (cur.recommendedFood * 0.90) &&
//     cur.curFood < (cur.recommendedFood * 1.10) ? acc + 1 : acc
//   return acc !== 0
// }, 0));

// const okDogs = dogs.filter(cur => cur.curFood > (cur.recommendedFood * 0.90) &&
//   cur.curFood < (cur.recommendedFood * 1.10))


// const sortDogs = [...dogs].sort((a,b) => b.recommendedFood-a.recommendedFood )
// console.log(sortDogs);
// console.log(okDogs);
// console.log(dogs);

// const now = new Date();
// console.log(now);

// console.log(new Date('Tue Feb 28 2023 18:53:31 GMT+0200'));
// console.log(new Date(0));
// console.log(new Date('dec 20, 2023'));
// console.log(new Date (account1.movementsDates[0]));
// console.log(new Date(2300, 10, 19, 5, 20, 10));
// console.log(new Date(3 * 24 * 60* 60 * 1000));

// const future = new Date(2037, 10, 19, 5, 20, 10)
// console.log(+future);
// console.log(future);
// console.log(future.getFullYear());
// console.log(future.getMonth());
// console.log(future.getDate());
// console.log(future.getDay());
// console.log(future.getHours());
// console.log(future.getMinutes());
// console.log(future.getSeconds());
// console.log(future.toISOString());


// const days1 = calcDayPassed(new Date(2037, 3, 14), new Date(2037, 3, 4))
// console.log(days1);

// const num = 230492234.34;

// const options = {
//   style: 'currency',
//   unit: "celsius",
//   currency: "RUb",
//   // useGroupping: false,
// }
// console.log("US:", new Intl.NumberFormat('en-US', options).format(num));
// console.log("RU:", new Intl.NumberFormat('ru-RU', options).format(num));

// console.log("GM:", new Intl.NumberFormat('en-DE', options).format(num));
// console.log("FI:", new Intl.NumberFormat('en-FI', options).format(num));
// console.log("IL:", new Intl.NumberFormat('en-IL', options).format(num));
// console.log(navigator.language, new Intl.NumberFormat(navigator.language).format(num));

// setInterval(function(){
//   const now = new Date();
//   const options ={
//     day: 'numeric',
//     month: 'long',
//     year: 'numeric',
//     minute: 'numeric',
//     hour: 'numeric',
//   }
//   const date = Intl.DateTimeFormat("ru-RU",options).format(now);
//   console.log(date);
// },1000)