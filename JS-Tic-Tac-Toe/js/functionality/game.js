const game = document.querySelector(".game");
const styleIcons = ['⚒️', '⚔️', '☠️', '🎃', '💣', '🔮', '🧲', '🧽', '⚰️', '🚬']
const userMoves = [];
const botMoves = [];
let winRow = [];
//3x3 Win Probability
const winPro_3x3 = [
    [1, 2, 3],
    [4, 5, 6],
    [7, 8, 9],
    [1, 4, 7],
    [2, 5, 8],
    [3, 6, 9],
    [1, 5, 9],
    [3, 5, 7]
]
const winPro_4x4 = [
    [1, 2, 3, 4],
    [5, 6, 7, 8],
    [9, 10, 11, 12],
    [13, 14, 15, 16],
    [1, 5, 9, 13],
    [2, 6, 10, 14],
    [3, 7, 11, 15],
    [4, 8, 12, 16],
    [1, 6, 11, 16],
    [4, 7, 10, 13]
]
const winPro_5x5 = [
    [1, 2, 3, 4, 5],
    [6, 7, 8, 9, 10],
    [11, 12, 13, 14, 15],
    [16, 17, 18, 19, 20],
    [21, 22, 23, 24, 25],
    [1, 6, 11, 16, 21],
    [2, 7, 12, 17, 22],
    [3, 8, 13, 18, 23],
    [4, 9, 14, 19, 24],
    [5, 10, 15, 20, 25],
    [1, 7, 13, 19, 25],
    [5, 9, 13, 17, 21]
]
let userTurn = true;
let isMenu = true;
let lastCell = false;
let endGame = false;
let gameDiff;
let gameGrid;
let userStyle;
let botStyle;

window.onload = function() {
        if (isMenu) {
            isMenu = false;
            runMenu();
        } else {
            draw(gameDiff, gameGrid, userStyle, botStyle)
        }
    }
    //Render Method
function render(diff, grid, styleU, styleB) {
    game.innerHTML = "" //Draw
    draw(diff, grid, styleU, styleB);
}


//Menu Creator
function runMenu() {
    const menu = document.createElement("div");
    menu.classList.add("menu");
    style(menu, {
        minHeight: '100vh',
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        gap: '22px'

    })

    for (let i = 1; i <= 3; i++) {
        const button = document.createElement("button");
        button.classList.add("menuButton");
        switch (i) {
            case 1:
                button.textContent = "Play";
                button.addEventListener('click', play)
                break;
            case 2:
                button.textContent = "Sound On";
                button.addEventListener('click', function() {
                    button.classList.add('on');
                    bgSoundPlay();
                    button.nextElementSibling.classList.remove('on');
                })
                break;
            case 3:
                button.textContent = "Sound Of";
                button.classList.add('on');
                button.addEventListener('click', function() {
                    bgSoundStop();
                    button.classList.toggle('on');
                    button.previousElementSibling.classList.remove('on');

                })
                break;
        }
        menu.appendChild(button);
    }
    //Difficulty Type
    const diffSelect = document.createElement("select");
    diffSelect.classList.add("diffSelect");
    optionCreator(diffSelect, 'Easy', '1');
    optionCreator(diffSelect, 'Medium', '2');
    optionCreator(diffSelect, 'GOD LVL', '3');
    //Select Grid Type
    const gridSelect = document.createElement("select");
    gridSelect.classList.add("gridSelect");
    optionCreator(gridSelect, '3x3', '3');
    optionCreator(gridSelect, '4x4', '4');
    optionCreator(gridSelect, '5x5', '5');
    //Select User Style
    const styleSelectUser = document.createElement("select");
    styleSelectUser.classList.add("styleSelectUser");
    for (let i = 0; i < styleIcons.length; i++) {
        optionCreator(styleSelectUser, styleIcons[i], styleIcons[i])
    }
    //Select Bot Style
    const styleSelectBot = document.createElement("select");
    styleSelectBot.classList.add("styleSelectBot");
    for (let i = styleIcons.length - 1; i >= 0; i--) {
        optionCreator(styleSelectBot, styleIcons[i], styleIcons[i])
    }

    menu.appendChild(diffSelect);
    menu.appendChild(gridSelect);
    menu.appendChild(styleSelectUser);
    menu.appendChild(styleSelectBot);
    game.appendChild(menu);


}


//Starting game on Play
function play() {
    gameDiff = document.querySelector(".diffSelect").options[document.querySelector(".diffSelect").selectedIndex].value;
    gameGrid = document.querySelector(".gridSelect").options[document.querySelector(".gridSelect").selectedIndex].value;
    userStyle = document.querySelector(".styleSelectUser").options[document.querySelector(".styleSelectUser").selectedIndex].value;
    botStyle = document.querySelector(".styleSelectBot").options[document.querySelector(".styleSelectBot").selectedIndex].value;
    console.log(`Diff: ${gameDiff} Grid: ${gameGrid} userStyle: ${userStyle} botStyle: ${botStyle}`)
    render(gameDiff, gameGrid, userStyle, botStyle);
}

//Drawing the game
function draw(diff, grid, styleU, styleB) {
    endGame = checkWin();
    const screen = document.createElement("div");
    style(screen, {
        width: `${(grid)*100}px`,
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: 'center',
        alignItems: 'center',
        boxShadow: '0 0 20px 4px pink,0 0 40px 10px rgba(240, 202, 208,0.5)'

    })
    for (let i = 1; i <= grid ** 2; i++) {
        const button = document.createElement("button");
        style(button, {
            width: '100px',
            height: '100px',
        })

        if (userMoves.includes(i)) {
            button.textContent = styleU;
        } else if (botMoves.includes(i)) {
            button.textContent = styleB;
        } else {
            button.textContent = "";
        }
        button.addEventListener('click', function() {
            userMove(i);
            botMove();

        });
        if (winRow.includes(i)) {
            style(button, {
                backgroundColor: 'yellow'
            });
        }
        screen.appendChild(button);

    }
    game.replaceChildren(screen);

    if (endGame) {
        console.log('game end');
    }
    if ([...userMoves, ...botMoves].length === gameGrid ** 2 && !endGame) {
        console.log('draw')
        endGame = true;
    }

}

function userMove(i) {
    if (userTurn && ![...userMoves, ...botMoves].includes(i) && !endGame) {
        PlaySound();
        userMoves.push(i);
        userTurn = false;
        window.onload();
    }
}

function botMove() {
    if (!userTurn) {
        switch (gameDiff) {
            case '1':
                easyMode();
                break;
            case '2':
                mediumMode()
                break;
        }
    }

}

function easyMode() {
    if (!lastCell && !endGame) {
        num = randomGenerator(gameGrid);

        if (!userTurn && ![...userMoves, ...botMoves].includes(num)) {
            botMoveMethod(num);
        }
    }
    if ([...userMoves, ...botMoves].length === (gameGrid ** 2) - 1) {
        lastCell = true;
    }
}

function mediumMode() {
    let moveArr = [];
    let winPro = [];
    switch (gameGrid) {
        case '3':
            moveArr = arrayChecker(winPro_3x3);
            winPro = winPro_3x3;
            break;
        case '4':
            moveArr = arrayChecker(winPro_4x4);
            winPro = winPro_4x4;
            break;
        case '5':
            moveArr = arrayChecker(winPro_5x5);
            winPro = winPro_5x5;
            break;

    }



    // console.log(moveArr)
    if (moveArr.length > 0) {
        moveArr = arrayFilter(moveArr);
        // console.log(moveArr)
        if (decideMove(winPro) === undefined) {
            botMoveMethod(moveArr[Math.floor(Math.random() * moveArr.length)]);
        } else {
            botMoveMethod(decideMove(winPro));
        }
    } else {
        easyMode();
    }

}

function arrayChecker(arrPro) {
    const newArr = [];
    for (let i = 0; i < arrPro.length; i++) {
        for (let j = 0; j < userMoves.length; j++) {
            if (arrPro[i].includes(userMoves[j])) {
                newArr.push(arrPro[i]);
            }
        }
    }
    return [...new Set([...newArr])];
}

function arrayFilter(arr) {
    const newArr = [];
    for (let i = 0; i < arr.length; i++) {
        for (let j = 0; j < arr[i].length; j++) {
            if (![...new Set([...userMoves, ...botMoves])].includes(arr[i][j])) {
                newArr.push(arr[i][j]);
            }
        }
    }

    return [...new Set([...newArr])];
}

//Game Win probability Array.
function decideMove(GameWinProArr) {
    let stopRow = [];

    let decidedMove;
    let counter = 0;
    for (let i = 0; i < GameWinProArr.length; i++) {
        counter = 0;
        for (let j = 0; j < userMoves.length; j++) {
            if (GameWinProArr[i].includes(userMoves[j]) && !botMoves.includes(userMoves[j])) {
                counter++;
                if (counter >= gameGrid - 1) {
                    stopRow.push(GameWinProArr[i]);
                }
            }
        }

    }

    for (let i = 0; i < stopRow.length; i++) {
        for (let j = 0; j < stopRow[i].length; j++) {
            if (![...new Set([...userMoves, ...botMoves])].includes(stopRow[i][j])) {
                decidedMove = stopRow[i][j];
                console.log(`${stopRow[i]} STOP THIS ROW`)
                console.log(`${decidedMove} STOPPINGG`);
            }
        }

    }

    return decidedMove;
}

function botMoveMethod(num) {
    botMoves.push(num);
    userTurn = true;
    window.onload();
}

function checkWin() {

    switch (gameGrid) {
        case '3':
            return winRowCreator(winPro_3x3);
        case '4':
            return winRowCreator(winPro_4x4);
        case '5':
            return winRowCreator(winPro_5x5);
    }
}


function winRowCreator(proArr) {
    winRow = (proArr.filter(elArr => elArr.every(item => userMoves.includes(item)))).flat();
    if (winRow.length >= gameGrid) {
        return true;
    } else {
        winRow = proArr.filter(elArr => elArr.every(item => botMoves.includes(item))).flat();
        if (winRow.length >= gameGrid) {
            return true;
        }
    }
}

function randomGenerator(grid) {
    const num = Math.floor(Math.random() * (grid ** 2) + 1);
    if ([...userMoves, ...botMoves].includes(num)) {
        return randomGenerator(grid);
    } else {
        return num;
    }
}
//optionCreator for Menu
function optionCreator(el, txtContent, val) {
    const option = document.createElement("option");
    style(option, {
        fontSize: '1.5rem'
    })
    option.textContent = txtContent;
    option.value = val;
    el.appendChild(option);
}
//Style Method.
function style(el, obj) {
    for (const key in obj) {
        el.style[key] = obj[key];
    }
}



function handler(el, text, increment = true) {
    el.nextElementSibling.textContent = text;
    increment ? errors++ : errors--
}

function checkFruit(elm) {
    if (elm.value !== "" && fruits.includes(Number(elm.value))) {
        handler(elm, "Bu meyve bazada yoxdur !");
    } else {
        handler(elm, "", false);
    }
}