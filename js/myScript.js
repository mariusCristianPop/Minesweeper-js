document.addEventListener("DOMContentLoaded", function () {
    // wait for the html page to load before executing the script or else appending to body will result in an error;
    tableCreate();
});
//create table
function tableCreate() {
    const body = document.body,
        table = document.createElement('table');

    for (let i = 1; i <= 9; i++) {
        const tr = table.insertRow();
        for (let j = 1; j <= 9; j++) {
            const td = tr.insertCell();
            td.setAttribute("id", i * 10 + j);
            td.addEventListener("contextmenu", (event) => {
                event.preventDefault();
                addFlag(i, j);
            }, { once: true }); // added so that this event listener only executes once.
            td.setAttribute("onclick", `leftClick(${i}, ${j})`);
             
        }
    }
    body.appendChild(table);
}

function addFlag(i, j) {
    console.log(`right click on ${i} ${j}`);
    var tableCellId = document.getElementById(`${i * 10 + j}`);
    var image = document.createElement("img");
    image.src = "assets/icons/flag.png";
    tableCellId.appendChild(image);
}

function leftClick(i, j) {
    console.log("left click detected " + i + " " + j);
    var tableCellId = document.getElementById(`${i * 10 + j}`);
    tableCellId.setAttribute("onclick", "");
}

// create a function that decides if a table cell can be clicked or not