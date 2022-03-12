document.addEventListener("DOMContentLoaded", function () {
    // wait for the html page to load before executing the script or else appending to body will result in an error
    Create2DArray(dim)
    tableCreate()
    
})
const dim = 11
let timmerID;
var gameOver = false;
var posibleNumberOfBombs = 50
var gameBoard = []
var firstClick = true;


// Initialize cell object
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

function Create2DArray(dim) {
    for (let row = 0; row < dim; ++row) {
        gameBoard.push(new Array(dim).fill(new Cell('', ''))) // initializing cells. 
        for (let col = 0; col < dim; ++col) {
            gameBoard[row][col] = new Cell("notClicked", "empty") // assigning a new Cell object to positions from 1 - 10 array. 
        }
    }
    console.table(gameBoard)
}

// Decide if a table cell shall hold a bomb or not based on a given probability
function placeBomb() {
    let notRandomNumbers = [0, 0, 0, 0, 0, 0, 0, 0, 0, 1] // Here I decide the probability of 0's or 1's. 
    let id = Math.floor(Math.random() * notRandomNumbers.length)
    return notRandomNumbers[id]
}

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

function sumOfBombs() {
    for (let i = 0; i < dim; i++) {
        for (let j = 0; j < dim; j++) {
            let sum = 0
            if (!verifyN(i, j)) {
                ++sum
            }
            if (!verifyNE(i, j)) {
                ++sum
            }
            if (!verifyNW(i, j)) {
                ++sum
            }
            if (!verifyS(i, j)) {
                ++sum
            }
            if (!verifySE(i, j)) {
                ++sum
            }
            if (!verifySW(i, j)) {
                ++sum
            }
            if (!verifyE(i, j)) {
                ++sum
            }
            if (!verifyW(i, j)) {
                ++sum
            }
            gameBoard[i][j].setSumBombs(sum)
        }
    }
}


// create the HTML table
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

// helper to show where the bombs are located for debugging
function revealBombs() {
    for (let i = 0; i < dim; i++) {
        for (let j = 0; j < dim; j++) {
            if (gameBoard[i][j].getContent() == "bomb") {
                addBomb(i, j)
            }
        }
    }
}

// add a flag on HTML table on right click
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

// on left click function
function leftClick(i, j) {
    var tableCellId = document.getElementById(`${i},${j}`)
    tableCellId.setAttribute("onclick", "")
    if (firstClick) {
        deployBombs(posibleNumberOfBombs)
        //revealBombs()
        sumOfBombs()
        revealCell(i, j)
        showNoBombCells(i, j)
        startTimmer()
        setRemainingNumberOfBombs()
        firstClick = false
    } else if (gameBoard[i][j].getContent() == 'bomb') {
        endGame()
    } else {
        revealCell(i, j)
        showNoBombCells(i, j)
    }
}

// check if all sorrounding cells are free of bombs
function checkSurroundingCells(i, j) {
    return (verifyN(i, j) && verifyNE(i, j) && verifyNW(i, j) &&
        verifyS(i, j) && verifySE(i, j) && verifySW(i, j) &&
        verifyE(i, j) && verifyW(i, j))
}

// clear all cells and their neighbours recursively
function showNoBombCells(i, j) { // starting from i, j show all cells that have no bombs around
    if (checkSurroundingCells(i, j)) {
        revealCell(i, j)
        if (i > 0 && getState(i - 1, j) == "notClicked" ) { // North
            revealCell(i - 1, j)
            showNoBombCells(i - 1, j)
        }
        if (i > 0 && j < dim - 1 && getState(i - 1, j + 1) == "notClicked") { // NorthE
            revealCell(i - 1, j + 1)
            showNoBombCells(i - 1, j + 1)
        }
        if (i > 0 && j > 0 && getState(i - 1, j - 1) == "notClicked") {
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
    return
}


//North
function verifyN(i, j) { // returns true when no bomb is detected
    if (i > 0) {
        if (getContent(i - 1, j) == "bomb") {
            return false
        }
        return true
    }
    return true
}

function verifyNE(i, j) {
    if (i > 0 && j < dim - 1) {
        if (getContent(i - 1, j + 1) == "bomb") {
            return false
        }
        return true
    }
    return true
}

function verifyNW(i, j) {
    if (i > 0 && j > 0) {
        if (getContent(i - 1, j - 1) == "bomb") {
            return false
        }
        return true
    }
    return true
}

//South
function verifyS(i, j) {
      if (i < dim - 1) {
        if (getContent(i + 1, j) == "bomb") {
            return false
        }
        return true
    }
    return true
}

function verifySE(i, j) {
       if (i < dim - 1 && j < dim - 1) {
        if (getContent(i + 1, j + 1) == "bomb") {
            return false
        }
        return true
    }
    return true
}

function verifySW(i, j) {
       if (i < dim - 1 && j > 0) {
        if (getContent(i + 1, j - 1) == "bomb") {
            return false
        }
        return true
    }
    return true
}

//East
function verifyE(i, j) {
      if (j < dim - 1) {
        if (getContent(i, j + 1) == "bomb") {
            return false
        }
        return true
    }
    return true
}

// West
function verifyW(i, j) {
      if (j > 0) {
        if (getContent(i, j - 1) == "bomb") {
            return false
        }
        return true
    }
    return true
}

// add a bomb on HTML table
function addBomb(i, j) {
    var tableCellId = document.getElementById(`${i},${j}`)
    tableCellId.setAttribute("onclick", "")
    gameBoard[i][j].updateState("clicked")
    tableCellId.style.background = "red"
    var image = document.createElement("img")
    image.src = "assets/icons/bomb.png"
    tableCellId.appendChild(image)
}

// reveal the cell
function revealCell(i, j) {
    if (gameBoard[i][j].getState() != "clicked") {
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

// get the content of a cell
function getContent(i, j) {
    if ((j <= dim - 1) && (i <= dim - 1)) {
        return gameBoard[i][j].getContent()
    }
    
}
// get the state of a cell
function getState(i, j) {
    return gameBoard[i][j].getState()
}

// timmer functionality
function startTimmer() {
    var sec = 0;
    function pad ( val ) { return val > 9 ? val : "0" + val; }
    timmerID = setInterval( function(){
        document.getElementById("seconds").innerHTML=pad(++sec%60);
        document.getElementById("minutes").innerHTML=pad(parseInt(sec/60,10));
    }, 1000);
}


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

function endGame() {
    console.log("Game over")
    gameOver = true
    clearInterval(timmerID) // stops the timmer
    showAllBombs()
    const body = document.body
    var el = document.createElement("p")
    el.innerHTML = "Refresh the page to play again"
    body.appendChild(el)
}

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