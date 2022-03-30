document.addEventListener("DOMContentLoaded", function () {
    // wait for the html page to load before executing the script or else appending to body will result in an error
    Create2DArray(MAX_SIZE)
    createHtmlElements()
    
})

// 1. Variables declaration
const MAX_SIZE = 11
const State = {
    NOT_CLICKED: 1, 
    CLICKED: 2,
}
Object.freeze(State);

const Content = {
    EMPTY: 1,
    FLAG: 2, 
    BOMB: 3, 
}
Object.freeze(Content);
var timmerID;
var gameOver = false;
var posibleNumberOfBombs = 25
var gameBoard = []
var firstClick = true;

// 2. Initialize cell object

function Cell() {
    this.bombsAround = 0;
    this.state = State.NOT_CLICKED
    this.content = Content.EMPTY
}
// 3. Create the 2 dimensional array
function Create2DArray(MAX_SIZE) {
    for (let row = 0; row < MAX_SIZE; ++row) {
        gameBoard.push(new Array(MAX_SIZE).fill(new Cell)) // initializing cells. 
    }
    console.table(gameBoard)
}

// 4. Create the table with HTML elements
function createHtmlElements() {
    const body = document.body
    table = document.createElement('table')
    for (let i = 0; i < MAX_SIZE; i++) {
        const tr = table.insertRow()
        for (let j = 0; j < MAX_SIZE; j++) {
            const td = tr.insertCell()
            td.setAttribute("id", `${i},${j}`)
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
    if (gameBoard[i][j].content === Content.FLAG && !gameOver) {
        setRemainingNumberOfBombs("+")
        gameBoard[i][j].content = Content.EMPTY
        gameBoard[i][j].state = State.NOT_CLICKED
        let tableCellId = document.getElementById(`${i},${j}`)
        tableCellId.removeChild(tableCellId.firstChild)
    } else if (gameBoard[i][j].content != Content.FLAG && !gameOver) {
        gameBoard[i][j].content = Content.FLAG
        setRemainingNumberOfBombs("-")
        let tableCellId = document.getElementById(`${i},${j}`)
        let image = document.createElement("img")
        image.src = "assets/icons/flag.png"
        tableCellId.appendChild(image)
    }
}

// 6. Left click functionality
function leftClick(i, j) {
    console.log("left click!")
    let tableCellId = document.getElementById(`${i},${j}`)
    tableCellId.setAttribute("onclick", "")
    if (firstClick) {
        gameBoard[i][j].state = State.CLICKED
        deployBombs(posibleNumberOfBombs)
        revealBombs()
        sumOfBombs()
        revealCell(i, j)
        showNoBombCells(i, j)
        startTimmer()
        setRemainingNumberOfBombs()
    } else if (gameBoard[i][j].content === Content.BOMB) {
        endGame("You lost! Refresh the page to play again")
    } else {
        revealCell(i, j)
        showNoBombCells(i, j)
    }
    if (!gameOver) {
        checkWinner()
    }
}

// 7. Randomly place the bombs inside the array
function deployBombs(numberOfBombs) {
    for (let i = 0; i < MAX_SIZE && numberOfBombs > 0; ++i) {
        for (let j = 0; j < MAX_SIZE && numberOfBombs > 0; ++j) {
            if (gameBoard[i][j].state === State.CLICKED && placeBomb()) {
                gameBoard[i][j].content = Content.BOMB
                --numberOfBombs
            }
        }
    }
    if (numberOfBombs) { // if not all bombs deployed
        deployBombs(numberOfBombs)
    }
}

// 7. 1. Decide if a table cell shall hold a bomb or not based on a given probability
function placeBomb() {
    let notRandomNumbers = [0, 0, 0, 0, 0, 0, 0, 0, 0, 1] // Here I decide the probability of 0's or 1's. 
    let id = Math.floor(Math.random() * notRandomNumbers.length)
    return notRandomNumbers[id]
}

// 8. Sum up the bombs around a given cell
function sumOfBombs() {
    for (let i = 0; i < MAX_SIZE; i++) {
        for (let j = 0; j < MAX_SIZE; j++) {
            let sum = 0
            if (!verifyAllNeighbourCells(i, j)) {
                ++sum
            }
            gameBoard[i][j].bombsAround = sum
        }
    }
}

// 9. Reveal a given cell
function revealCell(i, j) {
        firstClick = false
        let tableCellId = document.getElementById(`${i},${j}`)
        tableCellId.style.background = "white"
        if (gameBoard[i][j].numberOfBombs > 0) {
            tableCellId.innerHTML = gameBoard[i][j].numberOfBombs
        }
        tableCellId.setAttribute("onclick", "")
        gameBoard[i][j].state = State.CLICKED
}

// 10. Clear all cells and their neighbours recursively
function showNoBombCells(i, j) { // starting from i, j show all cells that have no bombs around
    if (verifyAllNeighbourCells(i, j)) {
        for (let i2 = i - 1; i2 < i + 1; ++i2) {
            for (let j2 = j - 1; j2 < j + 1; ++j2) {
                if (i2 >= 0 && i2 < MAX_SIZE && j2 >= 0 && j2 < MAX_SIZE) {
                    if (gameBoard[i2][j2].state === State.NOT_CLICKED && gameBoard[i2][j2].content != Content.BOMB) {
                        revealCell(i2, j2)
                        showNoBombCells(i2, j2)
                    }
                }
            }
        }
    } else {
        return
    }
}

// 11. Given a cell, check all its surrounding cells for bombs
function verifyAllNeighbourCells(i, j) {
    let bombsSum = 0
    
    for (let i2 = i - 1; i2 < i + 1; ++i2) {
        for (let j2 = j - 1; j2 < j + 1; ++j2) {
            if (i2 >= 0 && i2 < MAX_SIZE && j2 >= 0 && j2 < MAX_SIZE) {
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

// 12. Game timmer functionality
function startTimmer() {
    let sec = 0;
    function pad ( val ) { return val > 9 ? val : "0" + val}
    timmerID = setInterval( function(){
        document.getElementById("seconds").innerHTML=pad(++sec%60)
        document.getElementById("minutes").innerHTML=pad(parseInt(sec/60,10))
    }, 1000)
}

// 13. Sets the variable that holds the number of bombs
function setRemainingNumberOfBombs(sign) {
    let el = document.getElementById("remainingBombs")
    if (sign == "-") {
        el.innerHTML = posibleNumberOfBombs -= 1
    } else if (sign == "+") {
        el.innerHTML = posibleNumberOfBombs += 1
    } else {
        el.innerHTML = posibleNumberOfBombs
    }
}

// 14. Add a bomb on HTML table
function addBomb(i, j) {
        let tableCellId = document.getElementById(`${i},${j}`)
        tableCellId.setAttribute("onclick", "")
        gameBoard[i][j].state = State.CLICKED
        tableCellId.style.background = "red"
        let image = document.createElement("img")
        image.src = "assets/icons/bomb.png"
        tableCellId.appendChild(image)
}

// 15. Checks if all non bomb cells are revealed
function checkWinner() {
    let counter = 0;
    for (let i = 0; i < MAX_SIZE; ++i) {
        for (let j = 0; j < MAX_SIZE; ++j) {
            if (gameBoard[i][j].state === State.CLICKED) {
                ++counter
            }
        }
    }
    if (counter == Math.pow(MAX_SIZE, 2) - posibleNumberOfBombs) {
        endGame("You won! Refresh the page to play again")
    }
}

// 16. Ends the game by revealing all bombs and stopping the game timmer
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

// 16.1 Shows all bombs
function showAllBombs() {
    for (let i = 0; i < MAX_SIZE; ++i) {
        for (let j = 0; j < MAX_SIZE; ++j) {
            if (gameBoard[i][j].content === Content.BOMB) {
                addBomb(i, j)
            }
            gameBoard[i][j].state = State.CLICKED
        }
    }
}

// 19. Show where the bombs are located (for debugging)
function revealBombs() {
    for (let i = 0; i < MAX_SIZE; i++) {
        for (let j = 0; j < MAX_SIZE; j++) {
            if (gameBoard[i][j].content === Content.BOMB) {
                addBomb(i, j)
            }
        }
    }
}