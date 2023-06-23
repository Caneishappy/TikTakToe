const grid = [
    [
        document.querySelector("#item0"),
        document.querySelector("#item1"),
        document.querySelector("#item2"),
    ],
    [
        document.querySelector("#item3"),
        document.querySelector("#item4"),
        document.querySelector("#item5"),
    ],
    [
        document.querySelector("#item6"),
        document.querySelector("#item7"),
        document.querySelector("#item8"),
    ],
];
let state = [
    ["", "", ""],
    ["", "", ""],
    ["", "", ""],
];
let circle = false;
let gameover = false;
for (let i = 0; i < grid.length; i++) {
    for (let j = 0; j < grid[i].length; j++) {
        let meinDiv = grid[i][j];
        meinDiv.addEventListener("click", function () {
            if (meinDiv.innerHTML == `` && !gameover) {
                if (!circle) {
                    meinDiv.innerHTML = `X`;
                    state[i][j] = `X`;
                } else {
                    meinDiv.innerHTML = `O `;
                    state[i][j] = `O`;
                }
                circle = !circle;
                if (resultnoai(grid)) {
                    console.log("Game over!");
                    gameover = true;
                    const Gameoverscreen =
                        document.getElementById("Gameover-screen");
                    Gameoverscreen.style.display = "block";
                    const bg = document.getElementById("grid-container");
                    bg.style.background = "red";
                } else if (checkTienoai(grid)) {
                    console.log("Game over! Draw");
                    const Gameoverscreen =
                        document.getElementById("Gameover-screen");
                    Gameoverscreen.style.display = "block";
                    const bg = document.getElementById("grid-container");
                    bg.style.background = "#ff6500";
                }
            }
        });
    }
}

function resetgrid() {
    for (let i = 0; i < grid.length; i++) {
        for (let j = 0; j < grid[i].length; j++) {
            const meinDiv = grid[i][j]; //Mein div entfernen
            meinDiv.innerHTML = ``;
        }
    }
    resetState();
    gameover = false;
    circle = false;
    console.log(`Reset`);
    const Gameoverscreen = document.getElementById("Gameover-screen");
    Gameoverscreen.style.display = "none";
    const bg = document.getElementById("grid-container");
    bg.style.background = "#2196F3";
}
function checkTienoai(grid) {
    for (const i in grid) {
        for (const j in grid) {
            if (grid[i][j].innerHTML == "") {
                return false;
            }
        }
    }
    return true;
}

function resultnoai(grid) {
    //horizontal
    for (let i = 0; i < grid.length; i++) {
        if (
            grid[i][0].innerHTML === grid[i][1].innerHTML &&
            grid[i][1].innerHTML === grid[i][2].innerHTML &&
            grid[i][0].innerHTML !== ""
        ) {
            return true;
            // console.log("GAME OVER! : Horizontal");
        }
        //vertical
        // for (let i = 0; i < grid.length; i++) {
        else if (
            grid[0][i].innerHTML === grid[1][i].innerHTML &&
            grid[1][i].innerHTML === grid[2][i].innerHTML &&
            grid[0][i].innerHTML !== ""
        ) {
            return true;
        }
    }
    //diagonal
    if (
        (grid[0][0].innerHTML === grid[1][1].innerHTML &&
            grid[0][0].innerHTML === grid[2][2].innerHTML &&
            grid[0][0].innerHTML !== "") ||
        (grid[0][2].innerHTML === grid[1][1].innerHTML &&
            grid[1][1].innerHTML === grid[2][0].innerHTML &&
            grid[1][1].innerHTML !== "")
    ) {
        // console.log("Game Over: Diagunal");
        return true;
    }
    return false;
}

//For the Algorithen to calculate the best Move:
function resetState() {
    for (i in grid) {
        state[i] = []; // Initialize the inner array
        for (j in grid[i]) {
            state[i][j] = "";
        }
    }
}
function checkTie(state) {
    for (i in state) {
        for (j in state) {
            if (state[i][j] == "") {
                return false;
            }
        }
    }
    return true;
}
function result(grid) {
    for (let i = 0; i < grid.length; i++) {
        if (
            grid[i][0] === grid[i][1] &&
            grid[i][1] === grid[i][2] &&
            grid[i][0] !== ""
        ) {
            return {
                Value: true,
                Winner: grid[i][0],
            };
        } else if (
            grid[0][i] === grid[1][i] &&
            grid[1][i] === grid[2][i] &&
            grid[0][i] !== ""
        ) {
            return {
                Value: true,
                Winner: grid[0][i],
            };
        }
    } //diagonal
    if (
        grid[0][0] === grid[1][1] &&
        grid[0][0] === grid[2][2] &&
        grid[0][0] !== ""
    ) {
        return {
            Value: true,
            Winner: grid[0][0],
        };
    }
    if (
        grid[0][2] === grid[1][1] &&
        grid[1][1] === grid[2][0] &&
        grid[1][1] !== ""
    ) {
        return {
            Value: true,
            Winner: grid[0][2],
        };
    }
    return {
        Value: false,
        Winner: undefined,
    };
}

function getActions(state) {
    const actions = [];
    for (const i in state) {
        for (const j in state[i]) {
            if (state[i][j] == "") {
                actions.push([i, j]);
            }
        }
    }
    return actions;
}

function getNewState(state, action, tomove) {
    const newState = cloneState(state);
    newState[action[0]][action[1]] = tomove;
    return newState;
}

function cloneState(state) {
    const newState = [];
    for (const i in state) {
        newState.push([]);
        for (const j in state[i]) {
            newState[i].push(state[i][j]);
        }
    }
    return newState;
}

function terminal(state) {
    // Is the Game over? And if so how Won or is it a Tie. (returns -1 0 or 1)
    let isgameover = checkTie(state).Value;
    let isWinner = result(state).Winner;
    if (isgameover) {
        return 0; // Tie
    }
    if (isWinner == "X") {
        return 1; // Max won
    }
    return -1; //Min won
}

let moves = 0;
function player(state) {
    // Who is to make a move?
    moves = 0;
    for (const i in state) {
        // How many squares are taken?
        for (const j in state[i]) {
            if (state[i][j] != "") {
                moves++;
            }
        }
    }
    // if (moves == 9) {
    //     return "max";
    // }
    if (moves % 2 == 0) {
        // If the amout of sqares taken is even, that Max is to move, because Max is always first to move.
        return "max";
    }
    return "min"; // Else Min is to move.
}

let action = null;
let newval = 0;
let comparval = 0;

function minimax(s, move) {
    // Check if game is over and who won.
    if (checkTie(s) || result(s).Value) {
        // value = terminal(state);
        return {
            Action: move,
            Value: terminal(state), // idk if terminal(state); works or if it would brake sth.
        };
    }
    if (player(s) == "max") {
        newval = -Infinity; // so if first Value that is find is greater.
        for (a of getActions(s)) {
            comparval = minimax(getNewState(s, a, "X"), a).Value;
            if (newval < comparval) {
                // compare the new value to the last.
                newval = comparval;
                action = a;
                if (newval === 1) {
                    // If a winning move is found don't serch further.
                    break;
                }
            }
        }
        return {
            Action: action,
            Value: newval,
        };
    }
    if (player(s) == "min") { // min is the O player and wants to minimize the value
        newval = Infinity; // so if first Value that is found is lower.
        for (a of getActions(s)) {
            //for every possibe move
            comparval = minimax(getNewState(s, a, "O"), a).Value;
            if (newval > comparval) {
                newval = comparval;
                action = a;
                if (newval === -1) {
                    // If a winning move is found don't serch further.
                    break;
                }
            }
        }
        return {
            Action: action,
            Value: newval,
        };
    }
}
