document.addEventListener("DOMContentLoaded", function () {
    // wait for the html page to load before executing the script or else appending to body will result in an error
    createHtmlElements()
    deployBombs(BOMBS_NR)
    countAdiacentBombs()
    revealBombsLocation()
})

// 1. Variables declaration
const MAX_SIZE = 11
const BOMBS_NR = 10
var remainingNrOfBombs = 10;
var timmerID;
var gameOver = false;
var firstClick = true;


// 1.1 Cell's states
const State = {
    NOT_CLICKED: 1, 
    CLICKED: 2,
    FLAG: 3, 
}
Object.freeze(State);

// 1.2 Cell's content
const Content = {
    EMPTY: 1,
    BOMB: 2, 
}
Object.freeze(Content);

// 2. Cell constructor
function Cell() {
    this.bombsAround = 0;
    this.state = State.NOT_CLICKED
    this.content = Content.EMPTY
}

// 3. Create and initiallize 2d Array with new Cell()
var gameBoard = new Array(MAX_SIZE)
for (let i = 0; i < MAX_SIZE; ++i) {
    gameBoard[i] = new Array(MAX_SIZE)
    for (let j = 0; j < MAX_SIZE; ++j) {
        gameBoard[i][j] = new Cell();
    }
}
console.log(gameBoard)

// 4. Create the table with HTML elements
function createHtmlElements() {
    const body = document.body
    table = document.createElement('table')
    for (let i = 0; i < MAX_SIZE; i++) {
        const tr = table.insertRow()
        for (let j = 0; j < MAX_SIZE; j++) {
            const td = tr.insertCell()
            td.setAttribute("id", `${i}, ${j}`)
            td.addEventListener("contextmenu", (event) => {
                event.preventDefault()
                rightClick(i, j)
            },)
            td.setAttribute("onclick", `leftClick(${i}, ${j})`)
        }
    }
    body.appendChild(table)
}

// 5. Add/Remove a flag from HTML table on right click
function rightClick(i, j) {
    console.log("right click")
    if (gameBoard[i][j].state === State.FLAG && !gameOver) {
        gameBoard[i][j].state = State.NOT_CLICKED
        let tableCellId = document.getElementById(`${i},${j}`)
        tableCellId.removeChild(tableCellId.firstChild)
    } else if (gameBoard[i][j].state === State.NOT_CLICKED && !gameOver) {
        gameBoard[i][j].state = State.FLAG
        let tableCellId = document.getElementById(`${i},${j}`)
        let image = document.createElement("img")
        image.src = "assets/icons/flag.png"
        tableCellId.appendChild(image)
    }
}

// 7. Randomly place the bombs inside the array
function deployBombs(numberOfBombs) {
    for (let i = 0; i < MAX_SIZE && numberOfBombs > 0; ++i) {
        for (let j = 0; j < MAX_SIZE && numberOfBombs > 0; ++j) {
            // function will generate odd or even number with equal probability. It does so by using the & BITWISE operator which sets each bit to 1 if both bits are 1
            if (gameBoard[i][j].content != Content.BOMB && (!Math.floor(Math.random() * 10) & 1)) {
                gameBoard[i][j].content = Content.BOMB
                --numberOfBombs
            }
        }
    }
    if (numberOfBombs) { // if not all bombs deployed
        deployBombs(numberOfBombs)
    }
}
//  Show where all the bombs are located (for debugging)
function revealBombsLocation() {
    for (let i = 0; i < MAX_SIZE; i++) {
        for (let j = 0; j < MAX_SIZE; j++) {
            if (gameBoard[i][j].content === Content.BOMB) {
                let tableCellId = document.getElementById(`${i}, ${j}`)
                tableCellId.setAttribute("onclick", "")
                gameBoard[i][j].state = State.CLICKED
                tableCellId.style.background = "red"
            }
        }
    }
}

// Left click functionality
function leftClick(i, j) {
    if (gameBoard[i][j].content === Content.BOMB) {
        if (firstClick) {
            firstClick = false
            revealOneCell(i, j)
            gameBoard[i][j].content = Content.EMPTY
            gameBoard[i][j].state = State.CLICKED
            for (let i2 = 1; i2 < MAX_SIZE; i2++) {
                for (let j2 = 0; j2 < MAX_SIZE; j2++) {
                    if (gameBoard[i2][j2].content === Content.EMPTY) {
                        gameBoard[i2][j2].content = Content.BOMB
                        console.log(`New bomb added at ${i2}, ${j2}`)
                        i2 = MAX_SIZE
                        j2 = MAX_SIZE
                        countAdiacentBombs()
                        break
                    }
                }
            }
        } else {
            endGame("You lost! Refresh the page to play again")
        }
    } else {
        firstClick = false
        //logic for uncovering cells
    }
    
}

//  Ends the game by revealing all bombs and stopping the game timmer
function endGame(string) {
    console.log("Game over")
    gameOver = true
    clearInterval(timmerID) // stops the timmer
    showAllBombs()
    const body = document.body
    let el = document.createElement("p")
    el.innerHTML = string
    body.appendChild(el)
}

//  Reveal a given cell
function revealOneCell(i, j) {
    let tableCellId = document.getElementById(`${i}, ${j}`)
    tableCellId.style.background = "white"
    tableCellId.setAttribute("onclick", "")
    gameBoard[i][j].state = State.CLICKED
    while (tableCellId.firstChild) {
        tableCellId.removeChild(tableCellId.firstChild)
    }
    if (gameBoard[i][j].bombsAround > 0) {
        tableCellId.innerHTML = gameBoard[i][j].bombsAround
    }
}

// Counting bombs around a cell (Re-do)
function countAdiacentBombs() {
    let sum = 0
    for (let i = 0; i < MAX_SIZE; i++) {
        for (let j = 0; j < MAX_SIZE; j++) {
            if (!verifyCell(i, j)) {
                ++sum
            }
            gameBoard[i][j].bombsAround = sum
            sum = 0
        }
    }
}

// Verify if a cell has bombs around (Re-do)
function verifyCell(i, j) {
    let bombsAroundSum = 0
    for (let i2 = i - 1; i2 < i + 1; ++i2) {
        for (let j2 = j - 1; j2 < j + 1; ++j2) {
            if (i2 >= 0 && i2 < MAX_SIZE && j2 >= 0 && j2 < MAX_SIZE) {
                if (gameBoard[i2][j2].content === Content.BOMB) {
                    ++bombsAroundSum
                }
            }
        }
    }
    if (bombsAroundSum != 0) {
        return false
    }
    return true
}