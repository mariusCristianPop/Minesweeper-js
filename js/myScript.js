document.addEventListener("DOMContentLoaded", function () {
    // wait for the html page to load before executing the script or else appending to body will result in an error
    Create2DArray(MAX_SIZE)
    tableCreate()
    
})

// 1. Variables declaration
const MAX_SIZE = 11
var timmerID;
var gameOver = false;
var posibleNumberOfBombs = 25
var gameBoard = []
var firstClick = true;

// 2. Initialize cell object
class Cell {
    _bombsAround = 0
    constructor(state, contains) {
        this.state = state
        this.contains = contains
    }
    updateContent(content) {
        this.contains = content
    }
    updateState(newState) {
        this.state = newState
    }
    getState() {
        return this.state
    }
    getContent() {
        return this.contains
    }
    getBombs() {
        return this._bombsAround
    }
    setSumBombs(sum) {
        this._bombsAround = sum
    }
}

// 3. Create the 2 MAX_SIZEmensional array
function Create2DArray(MAX_SIZE) {
    for (let row = 0; row < MAX_SIZE; ++row) {
        gameBoard.push(new Array(MAX_SIZE).fill(new Cell('', ''))) // initializing cells. 
        for (let col = 0; col < MAX_SIZE; ++col) {
            gameBoard[row][col] = new Cell("notClicked", "empty") // assigning a new Cell object to positions from 1 - 10 array. 
        }
    }
    console.table(gameBoard)
}

// 4. Create the table with HTML elements
function tableCreate() {
    const body = document.body
    table = document.createElement('table')
    for (let i = 0; i < MAX_SIZE; i++) {
        const tr = table.insertRow()
        for (let j = 0; j < MAX_SIZE; j++) {
            const td = tr.insertCell()
            td.setAttribute("id", `${i},${j}`)
            td.addEventListener("contextmenu", (event) => {
                event.preventDefault()
                addFlag(i, j)
            },)
            td.setAttribute("onclick", `leftClick(${i}, ${j})`)
        }
    }
    body.appendChild(table)
}

// 5. Add/Remove a flag from HTML table on right click
function addFlag(i, j) {
    if (gameBoard[i][j].getContent() == "flag" && !gameOver) {
        setRemainingNumberOfBombs("+")
        gameBoard[i][j].updateContent("empty")
        gameBoard[i][j].updateState("notClicked")
        let tableCellId = document.getElementById(`${i},${j}`)
        tableCellId.removeChild(tableCellId.firstChild)
    } else if (gameBoard[i][j].getContent() != "flag" && !gameOver) {
        gameBoard[i][j].updateContent("flag")
        setRemainingNumberOfBombs("-")
        let tableCellId = document.getElementById(`${i},${j}`)
        let image = document.createElement("img")
        image.src = "assets/icons/flag.png"
        tableCellId.appendChild(image)
    }
}

// 6. Left click functionality
function leftClick(i, j) {
    let tableCellId = document.getElementById(`${i},${j}`)
    tableCellId.setAttribute("onclick", "")
    if (firstClick) {
        gameBoard[i][j].updateState("clicked")
        deployBombs(posibleNumberOfBombs)
        //revealBombs()
        sumOfBombs()
        revealCell(i, j)
        showNoBombCells(i, j)
        startTimmer()
        setRemainingNumberOfBombs()
    } else if (gameBoard[i][j].getContent() == 'bomb') {
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
    for (let i = 0; i < MAX_SIZE && numberOfBombs; ++i) {
        for (let j = 0; j < MAX_SIZE && numberOfBombs; ++j) {
            if (gameBoard[i][j].getState() == "notClicked" && placeBomb()) {
                gameBoard[i][j].updateContent("bomb")
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
            gameBoard[i][j].setSumBombs(sum)
        }
    }
}

// 9. Reveal a given cell
function revealCell(i, j) {
    if (gameBoard[i][j].getState() != "clicked" || firstClick) {
        firstClick = false
        let tableCellId = document.getElementById(`${i},${j}`)
        tableCellId.style.background = "white"
        if (gameBoard[i][j].getBombs() > 0) {
            tableCellId.innerHTML = gameBoard[i][j].getBombs()
        }
        tableCellId.setAttribute("onclick", "")
        gameBoard[i][j].updateState("clicked")
    } else {
        return
    }
}

// 10. Clear all cells and their neighbours recursively
function showNoBombCells(i, j) { // starting from i, j show all cells that have no bombs around
    if (verifyAllNeighbourCells(i, j)) {
        let linie_start, linie_final, coloana_start, coloana_final
        linie_start = lineColStart(i)
        linie_final = lineColFin(i)
        coloana_start = lineColStart(j)
        coloana_final = lineColFin(j)
        for (let i2 = linie_start; i2 <= linie_final; ++i2) {
            for (let j2 = coloana_start; j2 <= coloana_final; ++j2) {
                if (getState(i2, j2) == "notClicked") {
                    revealCell(i2, j2)
                    showNoBombCells(i2, j2)
                }
            }
        }
    } else {
        return
    }
}

// 11. Given a cell, check all its surrounding cells for bombs
function verifyAllNeighbourCells(i, j) {
    let linie_start, linie_final, coloana_start, coloana_final, bombsSum = 0
    linie_start = lineColStart(i)
    linie_final = lineColFin(i)
    coloana_start = lineColStart(j)
    coloana_final = lineColFin(j)
    for (let i2 = linie_start; i2 <= linie_final; ++i2) {
        for (let j2 = coloana_start; j2 <= coloana_final; ++j2) {
            if (getContent(i2, j2) == "bomb") {
                ++bombsSum
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
    if (gameBoard[i][j].getState() != "bomb") {
        let tableCellId = document.getElementById(`${i},${j}`)
        tableCellId.setAttribute("onclick", "")
        gameBoard[i][j].updateState("clicked")
        tableCellId.style.background = "red"
        let image = document.createElement("img")
        image.src = "assets/icons/bomb.png"
        tableCellId.appendChild(image)
    }
}

// 15. Checks if all non bomb cells are revealed
function checkWinner() {
    let counter = 0;
    for (let i = 0; i < MAX_SIZE; ++i) {
        for (let j = 0; j < MAX_SIZE; ++j) {
            if (gameBoard[i][j].getState() == "clicked") {
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
            if (gameBoard[i][j].getContent() == "bomb") {
                addBomb(i, j)
            }
            gameBoard[i][j].updateState("clicked")
        }
    }
}

// 17. Get the content of a cell
function getContent(i, j) {
    if ((j <= MAX_SIZE - 1) && (i <= MAX_SIZE - 1)) {
        return gameBoard[i][j].getContent()
    }
    
}

// 18. Get the state of a cell
function getState(i, j) {
    return gameBoard[i][j].getState()
}

// 19. Show where the bombs are located (for debugging)
function revealBombs() {
    for (let i = 0; i < MAX_SIZE; i++) {
        for (let j = 0; j < MAX_SIZE; j++) {
            if (gameBoard[i][j].getContent() == "bomb") {
                addBomb(i, j)
            }
        }
    }
}

// 10.1 Decide the value of the start line/column
function lineColStart(k) {
    if (k == 0) {
        return k
    }
    if (k > 0 && k < MAX_SIZE - 1 || k == MAX_SIZE - 1) {
        return k - 1
    }
}

// 10.2 Decide the value of the final line/column
function lineColFin(k) {
    if (k == 0 || k > 0 && k < MAX_SIZE - 1) {
        return k + 1
    }
    if (k == MAX_SIZE - 1) {
        return k
    }
}