import { words } from "./words_dictionary.js";



// Get the answer from the word list
function randomFromSet(set) {
    const target = Math.floor(Math.random() * set.size);

    let i = 0;
    for (const item of set) {
        if (i === target) return item;
        i++;
    }
}
  
let answer = "";
while(1 > answer.length || answer.length > 10){
    answer = randomFromSet(words);
}

// Elements
const gameGrid = document.getElementById("game-board");
const ElKeyboard = document.getElementById("keyboard");

// Variables
const rows = 6;
const cols = 10;
let currRow = 0;
let currCol = 0;

// Helper Map for Word deduction
const answerMap = new Map();
for (const c of answer) {
  answerMap.set(c, (answerMap.get(c) || 0) + 1);
}

// --> Gameboard

let board = [
  ["", "", "", "", "", "", "", "", "", ""],
  ["", "", "", "", "", "", "", "", "", ""],
  ["", "", "", "", "", "", "", "", "", ""],
  ["", "", "", "", "", "", "", "", "", ""],
  ["", "", "", "", "", "", "", "", "", ""],
  ["", "", "", "", "", "", "", "", "", ""],
];

// --> Keyboard

const keyboard = [
  ["Q", "W", "E", "R", "T", "Y", "U", "I", "O", "P"],
  ["A", "S", "D", "F", "G", "H", "J", "K", "L"],
  ["Enter", "Z", "X", "C", "V", "B", "N", "M", "Back"],
];

// Initialize
for (const i of keyboard) {
  const row = document.createElement("div");
  row.classList.add("row");
  ElKeyboard.append(row);
  for (const key of i) {
    const keyBox = document.createElement("button");
    keyBox.textContent = key;
    row.append(keyBox);
    if (key === "Back") {
      keyBox.addEventListener("click", () => handleKey("Backspace"));
      keyBox.classList.add("long-key");
    } else if (key === "Enter") {
      keyBox.classList.add("long-key");
      keyBox.addEventListener("click", () => handleKey("Enter"));
    } else {
      keyBox.addEventListener("click", () => handleKey(key));
      keyBox.classList.add("key");
      keyBox.classList.add(`key--${key}`);
    }
  }
}
// --> Gameboard
for (let i = 0; i < rows; i++) {
  for (let j = 0; j < cols; j++) {
    const tile = document.createElement("div");
    tile.textContent = " ";
    tile.classList.add(`row--${i}`);
    tile.classList.add(`column--${j}`);
    gameGrid.append(tile);
  }
}

// --> Keyboard
for (let i = 0; i < keyboard.length; i++) {}

// Functions

// --> Helper Functions
const updateFrequency = function (mapCopy, letter) {
  const freq = mapCopy.get(letter);
  if (freq == 1) {
    // map entry removed if all occurrences of that letter checked
    mapCopy.delete(letter);
  } else {
    // remove every letter checked
    mapCopy.set(letter, freq - 1);
  }
};

// --> Event Handler Function
const handleKey = function (key) {
  if (key === "Enter") {
    // Check in the dictionary if the word exists
    const guess = board[currRow].join("").toLowerCase().trim();
    console.log(guess);

    if (!words.has(guess) && guess !== answer) {
      // Display that the word doesn't exist
      console.log("Word doesn't exist!");
      return;
    } else {
      // Copy of the answerMap so as to always keep using it;
      const answerMapCopy = new Map(answerMap);

      // Array to use in second pass to check if letters exist
      const secondPass = [];

      // First pass to check for correct letter placement
      const size = Math.min(guess.length, answer.length);
      for (let i = 0; i < size; i++) {
        if (guess[i] === answer[i]) {
          document
            .querySelector(`.row--${currRow}.column--${i}`)
            .classList.add("place-correct");
          const currKey = document
            .querySelector(`.key--${guess[i].toUpperCase()}`);

          currKey.classList.remove("maybe-key");
          currKey.classList.add("correct-key");
          updateFrequency(answerMapCopy, answer[i]);
        } else {
          secondPass.push([i, guess[i]]);
        }
      }

      // If the answer < guess
      // --> append the rest of the word to secondPass if possible
      for (let i = size; i < guess.length; i++) {  
          secondPass.push([i, guess[i]])
      }

      // If secondPass is empty, that means all letters were correct
      // --> Player wins!
      if (secondPass.length === 0) {
        setTimeout(function(){
          alert("You win");
        }, 100);
        return;
      }

      // Otherwise continue
      for (const [i, v] of secondPass) {
        if (answerMapCopy.has(v)) {
          updateFrequency(answerMapCopy, v);
          document
            .querySelector(`.row--${currRow}.column--${i}`)
            .classList.add("letter-correct");
          if(!document.querySelector(`.key--${v.toUpperCase()}`).classList.contains("correct-key")){
            document.querySelector(`.key--${guess[i].toUpperCase()}`).classList.add("maybe-key");
          }
        } else {
          document.querySelector(`.key--${v.toUpperCase()}`).classList.add("used-key");
          document
            .querySelector(`.row--${currRow}.column--${i}`)
            .classList.add("incorrect");
        }
      }
      currRow++;
      currCol = 0;
    }
  } else if (key === "Backspace") {
    if (currCol <= 0) return;
    currCol--;
    board[currRow][currCol] = "";
    document.querySelector(`.row--${currRow}.column--${currCol}`).textContent =
      "";
  } else if (/^[a-zA-Z]$/.test(key)) {
    if (currCol > 9) return;
    board[currRow][currCol] = key;
    document.querySelector(`.row--${currRow}.column--${currCol}`).textContent =
      key.toUpperCase();
    currCol++;
  }

  // End the game if exhausted
  if (currRow === 6) {
    alert("YOU LOSE!");
  }
};

// Event Listeners
document.addEventListener("keydown", (event) => handleKey(event.key));
