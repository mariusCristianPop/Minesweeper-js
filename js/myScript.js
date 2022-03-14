document.addEventListener("DOMContentLoaded", function () {
    // wait for the html page to load before executing the script or else appending to body will result in an error
    Create2DArray(dim)
    tableCreate()
    
})

// 1. Variables declaration
const dim = 11
let timmerID;
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

// 3. Create the 2 dimmensional array
function Create2DArray(dim) {
    for (let row = 0; row < dim; ++row) {
        gameBoard.push(new Array(dim).fill(new Cell('', ''))) // initializing cells. 
        for (let col = 0; col < dim; ++col) {
            gameBoard[row][col] = new Cell("notClicked", "empty") // assigning a new Cell object to positions from 1 - 10 array. 
        }
    }
    console.table(gameBoard)
}

// 4. Create the table with HTML elements
function tableCreate() {
    const body = document.body
    table = document.createElement('table')
    for (let i = 0; i < dim; i++) {
        const tr = table.insertRow()
        for (let j = 0; j < dim; j++) {
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
        var tableCellId = document.getElementById(`${i},${j}`)
        tableCellId.removeChild(tableCellId.firstChild)
    } else if (gameBoard[i][j].getContent() != "flag" && !gameOver) {
        gameBoard[i][j].updateContent("flag")
        setRemainingNumberOfBombs("-")
        var tableCellId = document.getElementById(`${i},${j}`)
        var image = document.createElement("img")
        image.src = "assets/icons/flag.png"
        tableCellId.appendChild(image)
    }
}

// 6. Left click functionality
function leftClick(i, j) {
    var tableCellId = document.getElementById(`${i},${j}`)
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
    for (let i = 0; i < dim && numberOfBombs; ++i) {
        for (let j = 0; j < dim && numberOfBombs; ++j) {
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
    for (let i = 0; i < dim; i++) {
        for (let j = 0; j < dim; j++) {
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
        var tableCellId = document.getElementById(`${i},${j}`)
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
        revealCell(i, j)
        if (i > 0 && getState(i - 1, j) == "notClicked" ) { // North
            revealCell(i - 1, j)
            showNoBombCells(i - 1, j)
        }
        if (i > 0 && j < dim - 1 && getState(i - 1, j + 1) == "notClicked") { // NorthE
            revealCell(i - 1, j + 1)
            showNoBombCells(i - 1, j + 1)
        }
        if (i > 0 && j > 0 && getState(i - 1, j - 1) == "notClicked") { // NorthW
            revealCell(i - 1, j - 1)
            showNoBombCells(i - 1, j - 1)
        }
        if (i < dim - 1 && getState(i + 1, j) == "notClicked" ) { // South
            revealCell(i + 1, j)
            showNoBombCells(i + 1, j)
        }
        if (i < dim - 1 && j < dim - 1 && getState(i + 1, j + 1) == "notClicked") { //SouthE
            revealCell(i + 1, j + 1)
            showNoBombCells(i + 1, j + 1)
        }
        if (i < dim - 1 && j > 0 && getState(i + 1, j - 1) == "notClicked") { //SouthW
            revealCell(i + 1, j - 1)
            showNoBombCells(i + 1, j - 1)
        }
        if (j < dim - 1 && getState(i, j + 1) == "notClicked") { //East
            revealCell(i, j + 1)
            showNoBombCells(i, j + 1)
        }
        if (j > 0 && getState(i, j - 1) == "notClicked") { //West
            revealCell(i, j - 1)
            showNoBombCells(i, j - 1)
        }
    } else {
        return
    }
}

// 11. Given a cell, check all its surrounding cells for bombs
function verifyAllNeighbourCells(i, j) {
    if (i > 0) { // North
        if (getContent(i - 1, j) == "bomb") {
            return false
        }
    }
    if (i > 0 && j < dim - 1) { // NorthE
        if (getContent(i - 1, j + 1) == "bomb") {
            return false
        }
    }
    if (i > 0 && j > 0) { // NorthW
        if (getContent(i - 1, j - 1) == "bomb") {
            return false
        }
    }
    if (i < dim - 1) { // South
        if (getContent(i + 1, j) == "bomb") {
            return false
        }
    }
    if (i < dim - 1 && j < dim - 1) { // SouthE
        if (getContent(i + 1, j + 1) == "bomb") {
            return false
        }
    }
    if (i < dim - 1 && j > 0) { // SouthW
        if (getContent(i + 1, j - 1) == "bomb") {
            return false
        }
    }
    if (j < dim - 1) { //East
        if (getContent(i, j + 1) == "bomb") {
            return false
        }
    }
    if (j > 0) { //West
        if (getContent(i, j - 1) == "bomb") {
            return false
        }
        return true
    }
}

// 12. Game timmer functionality
function startTimmer() {
    var sec = 0;
    function pad ( val ) { return val > 9 ? val : "0" + val}
    timmerID = setInterval( function(){
        document.getElementById("seconds").innerHTML=pad(++sec%60)
        document.getElementById("minutes").innerHTML=pad(parseInt(sec/60,10))
    }, 1000)
}

// 13. Sets the variable that holds the number of bombs
function setRemainingNumberOfBombs(sign) {
    var el = document.getElementById("remainingBombs")
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
        var tableCellId = document.getElementById(`${i},${j}`)
        tableCellId.setAttribute("onclick", "")
        gameBoard[i][j].updateState("clicked")
        tableCellId.style.background = "red"
        var image = document.createElement("img")
        image.src = "assets/icons/bomb.png"
        tableCellId.appendChild(image)
    }
}

// 15. Checks if all non bomb cells are revealed
function checkWinner() {
    let counter = 0;
    for (let i = 0; i < dim; ++i) {
        for (let j = 0; j < dim; ++j) {
            if (gameBoard[i][j].getState() == "clicked") {
                ++counter
            }
        }
    }
    if (counter == Math.pow(dim, 2) - posibleNumberOfBombs) {
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
    var el = document.createElement("p")
    el.innerHTML = string
    body.appendChild(el)
}

// 16.1 Shows all bombs
function showAllBombs() {
    for (let i = 0; i < dim; ++i) {
        for (let j = 0; j < dim; ++j) {
            if (gameBoard[i][j].getContent() == "bomb") {
                addBomb(i, j)
            }
            gameBoard[i][j].updateState("clicked")
        }
    }
}

// 17. Get the content of a cell
function getContent(i, j) {
    if ((j <= dim - 1) && (i <= dim - 1)) {
        return gameBoard[i][j].getContent()
    }
    
}

// 18. Get the state of a cell
function getState(i, j) {
    return gameBoard[i][j].getState()
}

// 19. Show where the bombs are located (for debugging)
function revealBombs() {
    for (let i = 0; i < dim; i++) {
        for (let j = 0; j < dim; j++) {
            if (gameBoard[i][j].getContent() == "bomb") {
                addBomb(i, j)
            }
        }
    }
}