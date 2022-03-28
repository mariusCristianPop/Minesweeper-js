document.addEventListener("DOMContentLoaded", function () {
    // wait for the html page to load before executing the script or else appending to body will result in an error
    createHtmlElements()
})
// 1. Variables declaration
const MAX_SIZE = 11
var timmerID;
var gameOver = false;
var posibleNumberOfBombs = 25
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
    console.log("right click")
    if (gameBoard[i][j].state === State.FLAG && !gameOver) {
        //setRemainingNumberOfBombs("+")
        gameBoard[i][j].state = State.NOT_CLICKED
        let tableCellId = document.getElementById(`${i},${j}`)
        tableCellId.removeChild(tableCellId.firstChild)
    } else if (gameBoard[i][j].state === State.NOT_CLICKED && !gameOver) {
        gameBoard[i][j].state = State.FLAG
        //setRemainingNumberOfBombs("-")
        let tableCellId = document.getElementById(`${i},${j}`)
        let image = document.createElement("img")
        image.src = "assets/icons/flag.png"
        tableCellId.appendChild(image)
    }
}