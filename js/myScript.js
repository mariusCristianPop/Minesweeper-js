document.addEventListener("DOMContentLoaded", function () {
    // wait for the html page to load before executing the script or else appending to body will result in an error
    deployBombs(BOMBS_NR)
    countBombsAroundCells()
    createHtmlElements()
})

// 1. Variables declaration
const BOARD_MAX_SIZE = 11
const BOMBS_NR = 25
var timmerID;
var gameOver = false
var firstClick = true
var bombsCounter = 0


// 1.1 Cell's states
const State = {
    NOT_CLICKED: 1, 
    CLICKED: 2,
    FLAG: 3, 
}
Object.freeze(State)

// 1.2 Cell's content
const Content = {
    EMPTY: 1,
    BOMB: 2, 
}
Object.freeze(Content)

// 2. Cell constructor
function Cell() {
    this.bombsAround = 0;
    this.state = State.NOT_CLICKED
    this.content = Content.EMPTY
}

// 3. Create and initiallize 2d Array with new Cell()
var gameBoard = new Array(BOARD_MAX_SIZE)
for (let i = 0; i < BOARD_MAX_SIZE; ++i) {
    gameBoard[i] = new Array(BOARD_MAX_SIZE)
    for (let j = 0; j < BOARD_MAX_SIZE; ++j) {
        gameBoard[i][j] = new Cell();
    }
}
console.log(gameBoard)

// 4. Randomly set the cell with bombs inside the array
function deployBombs(numberOfBombs) {
    for (let i = 0; i < BOARD_MAX_SIZE && numberOfBombs > 0; ++i) {
        for (let j = 0; j < BOARD_MAX_SIZE && numberOfBombs > 0; ++j) {
            // function will generate odd or even number with equal probability. It does so by using the & BITWISE operator which sets each bit to 1 if both bits are 1
            if (gameBoard[i][j].content != Content.BOMB && (!Math.floor(Math.random() * 10) & 1)) {
                gameBoard[i][j].content = Content.BOMB
                --numberOfBombs
                ++bombsCounter
            }
        }
    }
    if (numberOfBombs) { // if not all bombs deployed
        deployBombs(numberOfBombs)
    }
}

/// 5. Sum up the bombs around a given cell
function countBombsAroundCells() {
    for (let i = 0; i < BOARD_MAX_SIZE; i++) {
        for (let j = 0; j < BOARD_MAX_SIZE; j++) {
            let sum = 0
            if (!checkForBombsAround(i, j)) {
                ++sum
            }
            gameBoard[i][j].bombsAround = sum
        }
    }
}

// 6. Create the table with HTML elements
function createHtmlElements() {
    const body = document.body
    table = document.createElement('table')
    for (let i = 0; i < BOARD_MAX_SIZE; i++) {
        const tr = table.insertRow()
        for (let j = 0; j < BOARD_MAX_SIZE; j++) {
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

// 7. On right click add/Remove a flag from HTML table 
function rightClick(i, j) {
    if (gameBoard[i][j].state === State.FLAG && !gameOver) {
        bombCounter("+")
        gameBoard[i][j].state = State.NOT_CLICKED
        let tableCellId = document.getElementById(`${i}, ${j}`)
        tableCellId.removeChild(tableCellId.firstChild)
    } else if (gameBoard[i][j].state === State.NOT_CLICKED && !gameOver) {
        gameBoard[i][j].state = State.FLAG
        let tableCellId = document.getElementById(`${i}, ${j}`)
        let image = document.createElement("img")
        image.src = "assets/icons/flag.png"
        tableCellId.appendChild(image)
        bombCounter("-")
    }
}

// 8. Left click functionality
function leftClick(i, j) {
    if (gameBoard[i][j].content === Content.BOMB) {
        if (firstClick) {
            bombOnFirstClick(i, j)
        } else {
            endGame("You lost! Refresh the page to play again")
        }
    } else {
        if (firstClick) {
            firstClick = false
            startTimmer()
            bombCounter()
        }
        revealNoBombCells(i, j)
        checkWinner()
    }
}

// 9. If bomb hit at first click
function bombOnFirstClick(i, j) {
    startTimmer()
    firstClick = false
    revealOneCell(i, j)
    bombCounter()
    gameBoard[i][j].content = Content.EMPTY
    gameBoard[i][j].state = State.CLICKED
    for (let i2 = 1; i2 < BOARD_MAX_SIZE; i2++) {
        for (let j2 = 0; j2 < BOARD_MAX_SIZE; j2++) {
            if (gameBoard[i2][j2].content === Content.EMPTY) {
                gameBoard[i2][j2].content = Content.BOMB
                i2 = BOARD_MAX_SIZE
                j2 = BOARD_MAX_SIZE
                countBombsAroundCells()
                revealNoBombCells(i, j)
            }
        }
    }
}

// 10. Clear all cells and their non bomb neighbours recursively
function revealNoBombCells(i, j) {
    if (checkForBombsAround(i, j)) {
        for (let i2 = i - 1; i2 < i + 2; ++i2) {
            for (let j2 = j - 1; j2 < j + 2; ++j2) {
                if (i2 >= 0 && i2 <= BOARD_MAX_SIZE - 1 && j2 >= 0 && j2 <= BOARD_MAX_SIZE - 1) {
                    if (gameBoard[i2][j2].state === State.NOT_CLICKED && gameBoard[i2][j2].content != Content.BOMB) {
                        revealOneCell(i2, j2)
                        revealNoBombCells(i2, j2)
                    }
                }
            }
        }
    } else {
        revealOneCell(i, j)
    }
}

// 11. Given a cell, check all its surrounding cells for bombs
function checkForBombsAround(i, j) {
    let bombsSum = 0
    for (let i2 = i - 1; i2 < i + 2; ++i2) {
        for (let j2 = j - 1; j2 < j + 2; ++j2) {
            if (i2 >= 0 && i2 <= BOARD_MAX_SIZE - 1 && j2 >= 0 && j2 <= BOARD_MAX_SIZE - 1) {
                if (gameBoard[i2][j2].content === Content.BOMB) {
                    ++bombsSum
                }
            }
        }
    }
    if (bombsSum != 0) {
        return false
    }
    return true
}

// 12. Reveal location of all bombs
function revealBombsLocation() {
    for (let i = 0; i < BOARD_MAX_SIZE; i++) {
        for (let j = 0; j < BOARD_MAX_SIZE; j++) {
            if (gameBoard[i][j].content === Content.BOMB) {
                let tableCellId = document.getElementById(`${i}, ${j}`)
                tableCellId.setAttribute("onclick", "")
                gameBoard[i][j].state = State.CLICKED
                tableCellId.style.background = "red"
                let image = document.createElement("img")
                image.src = "assets/icons/bomb.png"
                tableCellId.appendChild(image)
            }
        }
    }
}

// 13. Reveal a given cell
function revealOneCell(i, j) {
    if (!gameOver && gameBoard[i][j].state != State.FLAG) {
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
}

// 14. Checks if all non bomb cells are revealed
function checkWinner() {
    let counter = 0;
    for (let i = 0; i < BOARD_MAX_SIZE; ++i) {
        for (let j = 0; j < BOARD_MAX_SIZE; ++j) {
            if (gameBoard[i][j].state === State.CLICKED || gameBoard[i][j].content === Content.FLAG) {
                ++counter
            }
        }
    }
    if (counter == Math.pow(BOARD_MAX_SIZE, 2) - BOMBS_NR) {
        endGame("You won! Refresh the page to play again")
    }
}

// 15. Ends the game by revealing all bombs and stopping the game timmer
function endGame(string) {
    gameOver = true
    clearInterval(timmerID) // stops the timmer
    revealBombsLocation()
    const body = document.body
    let el = document.createElement("p")
    el.innerHTML = string
    body.appendChild(el)
}

// 16. Game timmer functionality
function startTimmer() {
    let sec = 0;
    function pad(val) { return val > 9 ? val : "0" + val}
    timmerID = setInterval( function(){
        document.getElementById("seconds").innerHTML=pad(++sec%60)
        document.getElementById("minutes").innerHTML=pad(parseInt(sec/60,10))
    }, 1000)
}

// 17. Sets the variable that holds the number of bombs
function bombCounter(sign) {
    let el = document.getElementById("remainingBombs")
    if (sign == "-") {
        el.innerHTML = bombsCounter -= 1
    } else if (sign == "+") {
        el.innerHTML = bombsCounter += 1
    } else {
        el.innerHTML = bombsCounter
    }
}