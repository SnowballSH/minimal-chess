import './style.scss';
import {Board, Color, Piece, PieceType, Status} from "./board";
import {SunfishSearcher} from "./algorithm";

let board = new Board();
let selected: number | null = null;

const svgPrefix32 = `<svg viewBox="0 0 32 32" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">`;
const svgPrefix45 = `<svg viewBox="-2.5 -2.5 50 50" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">`;

function getPieceSVG(pt: Piece) {
    switch (pt.type) {
        case PieceType.Xiang:
            if (pieceType === "INT")
                if (pt.color === Color.Blue)
                    return svgPrefix45 + `<g id="black-bishop" class="black bishop" fill="none" fill-rule="evenodd" stroke="#000" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M9 36c3.39-.97 10.11.43 13.5-2 3.39 2.43 10.11 1.03 13.5 2 0 0 1.65.54 3 2-.68.97-1.65.99-3 .5-3.39-.97-10.11.46-13.5-1-3.39 1.46-10.11.03-13.5 1-1.354.49-2.323.47-3-.5 1.354-1.94 3-2 3-2zm6-4c2.5 2.5 12.5 2.5 15 0 .5-1.5 0-2 0-2 0-2.5-2.5-4-2.5-4 5.5-1.5 6-11.5-5-15.5-11 4-10.5 14-5 15.5 0 0-2.5 1.5-2.5 4 0 0-.5.5 0 2zM25 8a2.5 2.5 0 1 1-5 0 2.5 2.5 0 1 1 5 0z" fill="#000" stroke-linecap="butt"/><path d="M17.5 26h10M15 30h15m-7.5-14.5v5M20 18h5" stroke="#fff" stroke-linejoin="miter"/></g>`;
                else
                    return svgPrefix45 + `<g id="white-bishop" class="white bishop" fill="none" fill-rule="evenodd" stroke="#000" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><g fill="#fff" stroke-linecap="butt"><path d="M9 36c3.39-.97 10.11.43 13.5-2 3.39 2.43 10.11 1.03 13.5 2 0 0 1.65.54 3 2-.68.97-1.65.99-3 .5-3.39-.97-10.11.46-13.5-1-3.39 1.46-10.11.03-13.5 1-1.354.49-2.323.47-3-.5 1.354-1.94 3-2 3-2zM15 32c2.5 2.5 12.5 2.5 15 0 .5-1.5 0-2 0-2 0-2.5-2.5-4-2.5-4 5.5-1.5 6-11.5-5-15.5-11 4-10.5 14-5 15.5 0 0-2.5 1.5-2.5 4 0 0-.5.5 0 2zM25 8a2.5 2.5 0 1 1-5 0 2.5 2.5 0 1 1 5 0z"/></g><path d="M17.5 26h10M15 30h15m-7.5-14.5v5M20 18h5" stroke-linejoin="miter"/></g>`;

            return svgPrefix32 + `<text x="4" y="24.5" style="font-size: 23px; font-weight: 500; font-family: 'Ma Shan Zheng', cursive;">相</text></svg>`;
        case PieceType.Wang:
            if (pieceType === "INT")
                if (pt.color === Color.Blue)
                    return svgPrefix45 + `<g id="black-king" class="black king" fill="none" fill-rule="evenodd" stroke="#000" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M22.5 11.63V6" stroke-linejoin="miter"/><path d="M22.5 25s4.5-7.5 3-10.5c0 0-1-2.5-3-2.5s-3 2.5-3 2.5c-1.5 3 3 10.5 3 10.5" fill="#000" stroke-linecap="butt" stroke-linejoin="miter"/><path d="M11.5 37c5.5 3.5 15.5 3.5 21 0v-7s9-4.5 6-10.5c-4-6.5-13.5-3.5-16 4V27v-3.5c-3.5-7.5-13-10.5-16-4-3 6 5 10 5 10V37z" fill="#000"/><path d="M20 8h5" stroke-linejoin="miter"/><path d="M32 29.5s8.5-4 6.03-9.65C34.15 14 25 18 22.5 24.5l.01 2.1-.01-2.1C20 18 9.906 14 6.997 19.85c-2.497 5.65 4.853 9 4.853 9M11.5 30c5.5-3 15.5-3 21 0m-21 3.5c5.5-3 15.5-3 21 0m-21 3.5c5.5-3 15.5-3 21 0" stroke="#fff"/></g>`;
                else
                    return svgPrefix45 + `<g id="white-king" class="white king" fill="none" fill-rule="evenodd" stroke="#000" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M22.5 11.63V6M20 8h5" stroke-linejoin="miter"/><path d="M22.5 25s4.5-7.5 3-10.5c0 0-1-2.5-3-2.5s-3 2.5-3 2.5c-1.5 3 3 10.5 3 10.5" fill="#fff" stroke-linecap="butt" stroke-linejoin="miter"/><path d="M11.5 37c5.5 3.5 15.5 3.5 21 0v-7s9-4.5 6-10.5c-4-6.5-13.5-3.5-16 4V27v-3.5c-3.5-7.5-13-10.5-16-4-3 6 5 10 5 10V37z" fill="#fff"/><path d="M11.5 30c5.5-3 15.5-3 21 0m-21 3.5c5.5-3 15.5-3 21 0m-21 3.5c5.5-3 15.5-3 21 0"/></g>`;

            return svgPrefix32 + `<text x="4.5" y="24.5" style="font-size: 23px; font-weight: 500; font-family: 'Ma Shan Zheng', cursive;">王</text></svg>`;
        case PieceType.Jiang:
            if (pieceType === "INT")
                if (pt.color === Color.Blue)
                    return svgPrefix45 + `<g id="black-rook" class="black rook" fill="#000" fill-rule="evenodd" stroke="#000" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M9 39h27v-3H9v3zM12.5 32l1.5-2.5h17l1.5 2.5h-20zM12 36v-4h21v4H12z" stroke-linecap="butt"/><path d="M14 29.5v-13h17v13H14z" stroke-linecap="butt" stroke-linejoin="miter"/><path d="M14 16.5L11 14h23l-3 2.5H14zM11 14V9h4v2h5V9h5v2h5V9h4v5H11z" stroke-linecap="butt"/><path d="M12 35.5h21M13 31.5h19M14 29.5h17M14 16.5h17M11 14h23" fill="none" stroke="#fff" stroke-width="1" stroke-linejoin="miter"/></g>`;
                else
                    return svgPrefix45 + `<g id="white-rook" class="white rook" fill="#fff" fill-rule="evenodd" stroke="#000" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M9 39h27v-3H9v3zM12 36v-4h21v4H12zM11 14V9h4v2h5V9h5v2h5V9h4v5" stroke-linecap="butt"/><path d="M34 14l-3 3H14l-3-3"/><path d="M31 17v12.5H14V17" stroke-linecap="butt" stroke-linejoin="miter"/><path d="M31 29.5l1.5 2.5h-20l1.5-2.5"/><path d="M11 14h23" fill="none" stroke-linejoin="miter"/></g>`;

            return svgPrefix32 + `<text x="4.5" y="24.5" style="font-size: 23px; font-weight: 500; font-family: 'Ma Shan Zheng', cursive;">将</text></svg>`;
        case PieceType.Zi:
            if (pieceType === "INT")
                if (pt.color === Color.Blue)
                    return svgPrefix45 + `<g id="black-pawn" class="black pawn"><path d="M22.5 9c-2.21 0-4 1.79-4 4 0 .89.29 1.71.78 2.38C17.33 16.5 16 18.59 16 21c0 2.03.94 3.84 2.41 5.03-3 1.06-7.41 5.55-7.41 13.47h23c0-7.92-4.41-12.41-7.41-13.47 1.47-1.19 2.41-3 2.41-5.03 0-2.41-1.33-4.5-3.28-5.62.49-.67.78-1.49.78-2.38 0-2.21-1.79-4-4-4z" stroke="#000" stroke-width="1.5" stroke-linecap="round"/></g>`;
                else
                    return svgPrefix45 + `<g id="white-pawn" class="white pawn"><path d="M22.5 9c-2.21 0-4 1.79-4 4 0 .89.29 1.71.78 2.38C17.33 16.5 16 18.59 16 21c0 2.03.94 3.84 2.41 5.03-3 1.06-7.41 5.55-7.41 13.47h23c0-7.92-4.41-12.41-7.41-13.47 1.47-1.19 2.41-3 2.41-5.03 0-2.41-1.33-4.5-3.28-5.62.49-.67.78-1.49.78-2.38 0-2.21-1.79-4-4-4z" fill="#fff" stroke="#000" stroke-width="1.5" stroke-linecap="round"/></g>`;

            return svgPrefix32 + `<text x="4.5" y="24.5" style="font-size: 23px; font-weight: 500; font-family: 'Ma Shan Zheng', cursive;">子</text></svg>`;
        case PieceType.Hou:
            if (pieceType === "INT")
                if (pt.color === Color.Blue)
                    return svgPrefix45 + `<g id="black-queen" class="black queen" fill="#000" fill-rule="evenodd" stroke="#000" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><g fill="#000" stroke="none"><circle cx="6" cy="12" r="2.75"/><circle cx="14" cy="9" r="2.75"/><circle cx="22.5" cy="8" r="2.75"/><circle cx="31" cy="9" r="2.75"/><circle cx="39" cy="12" r="2.75"/></g><path d="M9 26c8.5-1.5 21-1.5 27 0l2.5-12.5L31 25l-.3-14.1-5.2 13.6-3-14.5-3 14.5-5.2-13.6L14 25 6.5 13.5 9 26zM9 26c0 2 1.5 2 2.5 4 1 1.5 1 1 .5 3.5-1.5 1-1.5 2.5-1.5 2.5-1.5 1.5.5 2.5.5 2.5 6.5 1 16.5 1 23 0 0 0 1.5-1 0-2.5 0 0 .5-1.5-1-2.5-.5-2.5-.5-2 .5-3.5 1-2 2.5-2 2.5-4-8.5-1.5-18.5-1.5-27 0z" stroke-linecap="butt"/><path d="M11 38.5a35 35 1 0 0 23 0" fill="none" stroke-linecap="butt"/><path d="M11 29a35 35 1 0 1 23 0M12.5 31.5h20M11.5 34.5a35 35 1 0 0 22 0M10.5 37.5a35 35 1 0 0 24 0" fill="none" stroke="#fff"/></g>`;
                else
                    return svgPrefix45 + `<g id="white-queen" class="white queen" fill="#fff" fill-rule="evenodd" stroke="#000" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M8 12a2 2 0 1 1-4 0 2 2 0 1 1 4 0zM24.5 7.5a2 2 0 1 1-4 0 2 2 0 1 1 4 0zM41 12a2 2 0 1 1-4 0 2 2 0 1 1 4 0zM16 8.5a2 2 0 1 1-4 0 2 2 0 1 1 4 0zM33 9a2 2 0 1 1-4 0 2 2 0 1 1 4 0z"/><path d="M9 26c8.5-1.5 21-1.5 27 0l2-12-7 11V11l-5.5 13.5-3-15-3 15-5.5-14V25L7 14l2 12zM9 26c0 2 1.5 2 2.5 4 1 1.5 1 1 .5 3.5-1.5 1-1.5 2.5-1.5 2.5-1.5 1.5.5 2.5.5 2.5 6.5 1 16.5 1 23 0 0 0 1.5-1 0-2.5 0 0 .5-1.5-1-2.5-.5-2.5-.5-2 .5-3.5 1-2 2.5-2 2.5-4-8.5-1.5-18.5-1.5-27 0z" stroke-linecap="butt"/><path d="M11.5 30c3.5-1 18.5-1 22 0M12 33.5c6-1 15-1 21 0" fill="none"/></g>`;

            return svgPrefix32 + `<text x="4.5" y="24.5" style="font-size: 23px; font-weight: 500; font-family: 'Ma Shan Zheng', cursive;">侯</text></svg>`;
    }
}

function drawPieceOnSquare(square: HTMLDivElement, val: Piece) {
    switch (val.color) {
        case Color.Yellow:
            square.style.backgroundColor = "#ffe641";
            break;
        case Color.Blue:
            square.style.backgroundColor = "#3952f5";
            break;
    }

    switch (val.type) {
        case PieceType.Xiang:
            square.innerHTML = `<div>${svgPrefix32}<path d="M0 0H8L0 8M24 0H32V8M32 24V32H24M0 32H8L0 24">
</path></svg>${getPieceSVG(val)}</div>`;
            break;
        case PieceType.Jiang:
            square.innerHTML = `<div>${svgPrefix32}<path d="M0 0H8L0 8M24 0H32V8M32 24V32H24M0 32H8L0 24M0 22-6 16 0 10M10 32 16 38 22 32M32 22 38 16 32 10M22 0 16-6 10 0">
</path></svg>${getPieceSVG(val)}</div>`;
            break;
        case PieceType.Wang:
            square.innerHTML = `<div>${svgPrefix32}<path d="M0 22-6 16 0 10M10 32 16 38 22 32M32 22 38 16 32 10M22 0 16-6 10 0">
</path></svg>${getPieceSVG(val)}</div>`;
            break;
        case PieceType.Zi:
            square.innerHTML = `<div>${svgPrefix32}<path d="${val?.color === Color.Yellow ? "M32 22 38 16 32 10" : "M0 22-6 16 0 10"}">
</path></svg>${getPieceSVG(val)}</div>`;
            break;
        case PieceType.Hou:
            square.innerHTML = `<div>${svgPrefix32}<path d="${val?.color === Color.Yellow ? "M24 0H32V8M32 24V32H24M0 22-6 16 0 10M10 32 16 38 22 32M32 22 38 16 32 10M22 0 16-6 10 0" : "M0 0H8L0 8M0 32H8L0 24M0 22-6 16 0 10M10 32 16 38 22 32M32 22 38 16 32 10M22 0 16-6 10 0"}">
</path></svg>${getPieceSVG(val)}</div>`;
            break;
    }

    // square.innerHTML += `<h3>${val?.pieceToString() || ""}</h3>`;
}

function updateBoard() {
    for (let index = 0; index < 12; index++) {
        let val = board.board[index];
        let square = document.querySelector<HTMLDivElement>(`#square${index}`)!;

        if (val === null) {
            square.innerHTML = "";
            square.style.backgroundColor = "#fcfffc";
            continue;
        }

        drawPieceOnSquare(square, val);
    }

    const PoolLoc = document.querySelector<HTMLDivElement>("#pool")!;
    let poolItems: HTMLDivElement[] = [];
    PoolLoc.innerHTML = "";
    board.pool.forEach((x, i) => {
        if (x === undefined) return;
        let item = document.createElement("div");
        item.id = "poolsq" + i;
        item.classList.add("square");
        drawPieceOnSquare(item, x);
        poolItems.push(item);
    });
    poolItems.forEach(x => PoolLoc.appendChild(x));
}

function clearLegalMoves() {
    for (let s = 0; s < 12; s++) {
        document.querySelector<HTMLDivElement>(`#square${s}`)!.classList.remove("legal-move");
    }
}

function showLegalMoves(i: number) {
    clearLegalMoves();
    for (const m of board.legalMoves()) {
        if (m.from === i) {
            document.querySelector<HTMLDivElement>(`#square${m.to}`)!.classList.add("legal-move");
        }
    }
}

let gameLocked = true;

let searcherSunfishYellow = new SunfishSearcher();
let searcherSunfishBlue = new SunfishSearcher();

let pieceType = "CHN";

async function searchSunfish(time: number, depth?: number, heavy?: boolean) {
    return (board.colorToMove === Color.Yellow ? searcherSunfishYellow : searcherSunfishBlue)
        .search(board, time, depth, heavy);
}

function startGame() {
    board = new Board();
    updateBoardAndStatus();
}

//@ts-ignore
window.startGame = startGame;

const YellowSelect = document.querySelector<HTMLSelectElement>("#yellow-select")!;
const BlueSelect = document.querySelector<HTMLSelectElement>("#blue-select")!;

const GameStatus = document.querySelector<Element>("#status-value")!;

function updateBoardAndStatus() {
    clearLegalMoves();
    updateBoard();
    gameLocked = false;

    if (board.status === Status.YellowWin) {
        alert("Yellow wins!");
        GameStatus.innerHTML = "Yellow wins";
        gameLocked = true;
        return;
    } else if (board.status === Status.BlueWin) {
        alert("Blue wins!");
        GameStatus.innerHTML = "Blue wins";
        gameLocked = true;
        return;
    }
    if (board.status === Status.Draw) {
        alert("Draw (by 20 non-capture moves)!");
        GameStatus.innerHTML = "Draw (by 20 non-capture moves)";
        gameLocked = true;
        return;
    }

    tryNextMove();
}

function tryNextMove() {
    GameStatus.innerHTML = board.colorToMove === Color.Yellow ? "Yellow to Move" : "Blue to Move";

    switch ((board.colorToMove === Color.Yellow ? YellowSelect : BlueSelect).value) {
        case "s1":
            gameLocked = true;

            setTimeout(() => {
                searchSunfish(100).then(m => {
                    board.makeMove(m!);
                    updateBoardAndStatus();
                });
            }, 300);

            break;
        case "s2":
            gameLocked = true;

            setTimeout(() => {
                searchSunfish(600).then(m => {
                    board.makeMove(m!);
                    updateBoardAndStatus();
                });
            }, 300);

            break;
        case "s3":
            gameLocked = true;

            setTimeout(() => {
                searchSunfish(5000, 10).then(m => {
                    board.makeMove(m!);
                    updateBoardAndStatus();
                });
            }, 300);

            break;
        case "h1":
            gameLocked = true;

            setTimeout(() => {
                searchSunfish(500, undefined, true).then(m => {
                    board.makeMove(m!);
                    updateBoardAndStatus();
                });
            }, 300);

            break;
        case "h":
            gameLocked = false;
            break;
    }
}

function init() {
    const s = document.querySelector<HTMLSelectElement>("#piece-type")!;

    const storedPT = localStorage.getItem("pieceType");
    if (storedPT !== null) {
        pieceType = storedPT;
        s.value = storedPT;
    }

    document.onclick = e => {
        if (!gameLocked) {
            const k = (e.target as Element).id;
            if (k.startsWith("square")) {
                const idx = parseInt(k.split("square")[1]);

                for (const m of board.legalMoves()) {
                    if (m.from === selected && m.to === idx) {
                        board.makeMove(m);
                        updateBoardAndStatus();
                        return;
                    }
                }

                if (selected === idx) {
                    clearLegalMoves();
                    selected = null;
                } else {
                    showLegalMoves(idx);
                    selected = idx;
                }
            } else if (k.startsWith("poolsq")) {
                const idx = parseInt(k.split("poolsq")[1]);

                if (selected === 12 + idx) {
                    clearLegalMoves();
                    selected = null;
                } else {
                    showLegalMoves(12 + idx);
                    selected = 12 + idx;
                }
            } else {
                clearLegalMoves();
                selected = null;
            }
        }
    };

    for (let i = 0; i < 12; i++) {
        document.querySelector<HTMLDivElement>("#board")!.innerHTML +=
            `<div class='square' id='square${i}'"></div>`;
    }

    updateBoard();

    s.onchange = () => {
        pieceType = s.value;
        localStorage.setItem("pieceType", pieceType);
        updateBoard();
    };
}

init();
