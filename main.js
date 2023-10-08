const elFake = document.createElement("div");

const elGameOver = document.getElementById("Gameover-screen") ?? elFake;
const elBG = document.getElementById("grid-container") ?? elFake;
let getSquare = undefined;

let circle = false;
let gameover = false;
let aiEnabled = true;
let boardsize = 3;

const grid = [];
let state = [
    // ["", "", ""],
    // ["", "", ""],
    // ["", "", ""],
];

function enableAi() {
    aiEnabled ? console.log("Ai is not off") : console.log("Ai is now on.");
    aiEnabled = !aiEnabled;
}

function initGrid(size) {
    boardsize = size;
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

    //Display the div elements in a quare
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
            state[row].push("");
            if (!grid[row][col]) {
                //crate the div element with the right id & add it the the grid
                const newItem = document.createElement("div");
                newItem.setAttribute("id", `${"item" + [row * size + col]}`);
                let newSquare = elBG.appendChild(newItem);
                grid[row].push(newSquare);
            }
            grid[row][col].addEventListener("click", function () {
                //add the logic to the square
                getSquare = `${"item" + [row * size + col]}`;
                if (
                    document.getElementById(getSquare).textContent !== "" ||
                    gameover
                ) {
                    return;
                }
                //set the selected square and if on let the alg. make a move
                setSquare(row, col);
                if (!gameover && aiEnabled) {
                    setSquare(...aiMove(state));
                }
            });
        }
    }
}

function resetGrid() {
    console.log(aiEnabled);
    for (let i = 0; i < boardsize; i++) {
        for (let j = 0; j < boardsize; j++) {
            grid[i][j].innerHTML = "";
            state[i][j] = "";
        }
    }
    circle = false;
    gameover = false;

    console.log("Reset");
    elGameOver.style.display = "none";
    elBG.style.background = "#2196F3";
}

function setSquare(row, col) {
    const playerSymbol = circle ? "O" : "X";
    circle = !circle;

    grid[row][col].innerHTML = playerSymbol;
    state[row][col] = playerSymbol;
    checkGameOver();
}

function checkGameOver() {
    const condition = getCondition(state);

    if (condition !== undefined) {
        gameover = true;
        if (condition === 0) {
            console.log("Game over! Draw");
            elGameOver.style.display = "block";
            elBG.style.background = "#ff6500";
        } else {
            console.log("Game over!");
            elGameOver.style.display = "block";
            elBG.style.background = "red";
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
        // condition == undefined would mean that the game is ongoing.
        return [condition, undefined];
    } else {
        if (getPlayer(state) === "X") {
            let value = -2; //So every situation is better
            let valueAction = undefined;
            for (const action of getAvailableActions(state)) {
                //For every possible move:
                const [newValue] = minimax(getNewState(state, action));
                if (newValue > value) {
                    //Getting the best value. -1 Means O won; 0 mean draw; 1 means X won.
                    value = newValue;
                    valueAction = action;
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
                }
            }
            return [value, valueAction];
        }
    }
}

let LengthToWin = boardsize; //might change later on, so it is a own variable

function getCondition(state) {
    for (let i = 0; i <= 1; i++) {
        // Twice for switching row and col
        let highestcount = 0;
        for (let k in state) {
            let oldsymbole = "";
            let count = 0;
            const [row, col] = i === 0 ? [0, k] : [k, 0]; // Switch the label of row and col for horizontal/vertical win.

            for (let j in state[row]) {
                const [currRow, currCol] = i === 0 ? [j, k] : [k, j]; // Switch the label of row and col for horizontal/vertical win.
                const currentSymbol = state[currRow][currCol];

                if (currentSymbol !== "") {
                    if (currentSymbol === oldsymbole) {
                        count++;
                    } else {
                        count = 1; // Start counting from 1 for the current symbol.
                        oldsymbole = currentSymbol;
                    }

                    highestcount = Math.max(count, highestcount);

                    if (highestcount >= LengthToWin) {
                        return oldsymbole === "X" ? 1 : -1;
                    }
                } else {
                    count = 0;
                    oldsymbole = "";
                }
            }

            //Diagonal
            count = 0; //Reseting the count to 0
            if (row >= LengthToWin - 1 || col >= LengthToWin - 1) {
                i === 0 ? (j = Math.max(row, col)) : (j = 0);

                for (let n = 0; n <= Math.max(row, col); n++) {
                    //For the length of the Diagonal (the diagonal has the same lenth as the row/col that it starts/stops on).
                    const [currRow, currCol] = i === 0 ? [j, n] : [n, j];

                    const currentSymbol = state[currRow][currCol];

                    if (currentSymbol !== "") {
                        if (currentSymbol === oldsymbole) {
                            count++;
                        } else {
                            count = 1; // Start counting from 1 for the current symbol
                            oldsymbole = currentSymbol;
                        }

                        highestcount = Math.max(count, highestcount);

                        if (highestcount >= LengthToWin) {
                            return oldsymbole === "X" ? 1 : -1;
                        }
                    } else {
                        count = 0;
                        oldsymbole = "";
                    }
                    i === 0 ? j-- : j++;
                }
            }
        }
    }

    //If no win is found, check if it is a draw or the game is ongoing.
    for (const i in state) {
        for (const j in state) {
            if (state[i][j] === "") {
                return undefined;
            }
        }
    }

    return 0; //Draw
}

function getPlayer(state) {
    let actions = 0;
    //If the available amount of squars is even, then 'O' has to make a move.
    for (const i in state) {
        for (const j in state[i]) {
            if (state[i][j] !== "") {
                actions++;
            }
        }
    }

    function isEven(x) {
        return x % 2 === 0;
    }

    return isEven(actions) ? "X" : "O";
}

function getAvailableActions(state) {
    const actions = [];
    for (const i in state) {
        for (const j in state[i]) {
            if (state[i][j] === "") {
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
    console.time();
    setSquare(...aiMove(state));
    console.timeEnd();
}
initGrid(boardsize);
