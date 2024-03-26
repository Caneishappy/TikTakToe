const elFake = document.createElement("div");
const elGameOver = document.getElementById("Gameover-screen") ?? elFake;
const elBG = document.getElementById("grid-container") ?? elFake;
const xIcon = "./sources/X.svg";
let oIcon = "./sources/O.svg";
let getSquare = undefined;

let circle = false;
let gameover = false;
let aiEnabled = true;
let boardsize = 3;

const grid = [];
let state = [
    // [0, 0, 0],
    // [0, 0, 0],
    // [0, 0, 0],
];

function enableAi() {
    aiEnabled ? console.log("Ai is not off") : console.log("Ai is now on.");
    aiEnabled = !aiEnabled;
    aiEnabled
        ? (document.getElementById("aionoff").innerText = "AI On")
        : (document.getElementById("aionoff").innerText = "AI Off");
}

function initGrid(size) {
    //Reset the game conditions and Displaying
    circle = false;
    gameover = false;
    elGameOver.style.display = "none";
    elBG.style.background = "#2196F3";
    boardsize = size; // I think this is useless?

    //Delete content of the board, grid & state
    while (elBG.firstChild) {
        elBG.removeChild(elBG.firstChild);
    }
    state.length = 0;
    for (let i = grid.length - 1; i >= 0; i--) {
        for (let u = grid[0].length - 1; u >= 0; u--) {
            grid[i].splice(u, 1);
        }
        grid.splice(i, 1);
    }

    //Display the div elements in a square
    csssize = "'";
    for (let n = 1; n < size + 1; n++) {
        for (let b = 0; b < size; b++) {
            csssize = csssize + " " + n.toString();
        }
        if (n < size) csssize = csssize + "' '";
    }
    elBG.style["grid-template-areas"] = csssize;

    //Add all elements to the Grid and state
    for (let i = 0; i < size; i++) {
        grid.push([]);
        state.push([]);
        for (let j = 0; j < size; j++) {
            const [row, col] = [i, j];
            state[row].push(0);
            if (!grid[row][col]) {
                //crate the div element with the right id & add it the the grid
                const newItem = document.createElement("div");
                newItem.setAttribute("id", `${"item" + [row * size + col]}`);
                let newSquare = elBG.appendChild(newItem);
                grid[row].push(newSquare);
            }
            grid[row][col].addEventListener("click", function () {
                //add the logic to the square
                if (!state[row][col] !== 0 || !gameover) {         
                    //set the selected square and if on let the alg. make a move
                    setSquare(row, col);
                    if (!gameover && aiEnabled) {
                        doAiMove(state); // This logs the time it took aswell
                        // setSquare(...aiMove(state)); 
                    }
                }
            });
        }
    }
}

function resetGrid() {
    for (let i = 0; i < boardsize; i++) {
        for (let j = 0; j < boardsize; j++) {
            grid[i][j].innerHTML = "";
            state[i][j] = 0;
        }
    }
    circle = false;
    gameover = false;
    elGameOver.style.display = "none";
    elBG.style.background = "#2196F3";
}

function setSquare(row, col) {
    if (getPlayer(state) == 1) {
        grid[row][col].innerHTML = `<img src="${xIcon}" >`;
    } else {
        grid[row][col].innerHTML = `<img src="${oIcon}" >`;
    }
    state[row][col] = getPlayer(state);
    checkGameOver();
}

function checkGameOver() {
    const condition = getCondition(state);

    if (condition !== undefined) {
        // if the game is not over
        gameover = true;
        if (condition === 0) {
            elGameOver.innerHTML = `<p>Gameover!  <br><span style="font-weight:bold;font-size: 2.5rem;">Draw</span></p>`;
            console.log("Game over! Draw");
            elGameOver.style.display = "block";
            elBG.style.background = "#ff6500";
        } else {
            console.log("Game over!");
            elGameOver.style.display = "block";
            elBG.style.background = "red";
            if (condition == 1) {
                // If X won:
                elGameOver.innerHTML = `<p>Gameover! <br> <span style="font-weight:bold;">Winner:</span></p><img src="${xIcon}" style='width: 30%'>`;
            } else {
                // O won:
                elGameOver.innerHTML = `<p>Gameover! <br> <span style="font-weight:bold;">Winner:</span></p><img src="${oIcon}" style='width: 30%'>`;
            }
        }
    }
}

function aiMove(state) {
    const [value, action] = minimax(state);
    return action;
}

function minimax(state) {
    //recursive
    const condition = getCondition(state);
    if (condition !== undefined) {
        // condition == undefined would mean that the game is ongoing
        return [condition, undefined];
    } else {
        if (getPlayer(state) === 1) {
            let value = -Infinity; //So every situation is better
            let valueAction = undefined;
            for (const action of getAvailableActions(state)) {
                //For every possible move:
                const [newValue] = minimax(getNewState(state, action));
                if (newValue > value) {
                    //Getting the best value. -1 Means O won; 0 mean draw; 1 means X won.
                    valueAction = action;
                    value = newValue;
                    if (value >= 1) {
                        //If a winning move is found, stop searching
                        break;
                    }
                }
            }
            return [value, valueAction];
        } else {
            let value = 2;
            let valueAction = undefined;
            for (const action of getAvailableActions(state)) {
                const [newValue] = minimax(getNewState(state, action));
                if (newValue < value) {
                    value = newValue;
                    valueAction = action;
                    if (value <= -1) {
                        break;
                    }
                }
            }
            return [value, valueAction];
        }
    }
}

function getCondition(state) {
    let lengthToWin = boardsize; //might change later on, so it is an own variable
    for (let i = 0; i <= 1; i++) {
        // Twice for switching row and col
        for (let k = 0; k < state.length; k++) {
            let total = 0;
            const [row, col] = i === 0 ? [0, k] : [k, 0]; // Switch the label of row and col for horizontal/vertical win.

            for (let j = 0; j < state[row].length; j++) {
                const [currRow, currCol] = i === 0 ? [j, k] : [k, j]; // Switch the label of row and col for horizontal/vertical win.
                total += state[currRow][currCol];
            }
            if (Math.abs(total) >= lengthToWin) {
                return total / lengthToWin;
            }

            if (row >= lengthToWin - 1 || col >= lengthToWin - 1) {
                //Diagonal
                i === 0 ? (j = Math.max(row, col)) : (j = 0);
                total = 0; //Reseting the total to 0

                for (let n = 0; n <= Math.max(row, col); n++) {
                    //For the length of the Diagonal (the diagonal has the same lenth as the row/col that it starts/stops on).
                    const [currRow, currCol] = i === 0 ? [j, n] : [n, j];
                    total += state[currRow][currCol];
                    i === 0 ? j-- : j++;
                }
                if (Math.abs(total) >= lengthToWin) {
                    return total / lengthToWin;
                }
            }
        }
    }
    for (const i in state) {
        for (const j in state) {
            if (state[i][j] === 0) {
                //if there is an empty square: ongoing
                return undefined;
            }
        }
    }

    return 0; //Draw
}

function getPlayer(state) {
    //20% of Performance
    let actions = 0;
    //If the available amount of squars is even, then 'O' has to make a move.
    for (const i in state) {
        for (const j in state[i]) {
            if (state[i][j] !== 0) {
                actions++;
            }
        }
    }
    // return ((actions % 2 === 0)? "X" : "O");
    function isEven(x) {
        return x % 2 === 0;
    }

    return isEven(actions) ? 1 : -1;
}

function getAvailableActions(state) {
    const actions = [];
    for (const i in state) {
        for (const j in state[i]) {
            if (state[i][j] === 0) {
                //Add every empty square to the list.
                actions.push([i, j]);
            }
        }
    }
    return actions;
}

function getNewState(state, action) {
    //Getting the state(/"playing feld") if the move 'action' is made.
    const newState = state.map((row) => [...row]);
    const [i, j] = action;
    newState[i][j] = getPlayer(state);
    return newState;
}
function doAiMove(state) {
    if (!gameover) {
        console.time();
        setSquare(...aiMove(state));
        console.timeEnd();
    }
}

function testtimer() {
    console.time();
    getCondition(state);
    console.timeEnd();
}
initGrid(boardsize);

const konamiCode = [
    "ArrowUp",
    "ArrowUp",
    "ArrowDown",
    "ArrowDown",
    "ArrowLeft",
    "ArrowRight",
    "ArrowLeft",
    "ArrowRight",
    "b",
    "a",
    "Enter",
];

let userInput = [];

document.addEventListener("keydown", (event) => {
    
    const key = event.key;
    userInput.push(key);
    for (let input = 0; input < userInput.length; input++) {
        if (userInput[input] != konamiCode[input]) {
            userInput = [];
            return
        }
    }
    if (userInput.length == konamiCode.length) {
        console.log("Konami Code entered successfully! Enjoy")
        oIcon = "./sources/orange.webp";
    }
});
