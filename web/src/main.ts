import './style.css';
import {Board, Color, Piece, PieceType, Status} from "./board";

let board = new Board();
let selected: number | null = null;

function drawPieceOnSquare(square: HTMLDivElement, val: Piece) {
    switch (val.color) {
        case Color.Yellow:
            square.style.backgroundColor = "#ffff41";
            break;
        case Color.Blue:
            square.style.backgroundColor = "#3939f5";
            break;
    }

    switch (val.type) {
        case PieceType.Xiang:
            square.innerHTML = `<svg viewBox="0 0 32 32" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
<path d="M0 0H8L0 8M24 0H32V8M32 24V32H24M0 32H8L0 24">
</path></svg>`;
            break;
        case PieceType.Wang:
            square.innerHTML = `<svg viewBox="0 0 32 32" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
<path d="M0 22-6 16 0 10M10 32 16 38 22 32M32 22 38 16 32 10M22 0 16-6 10 0">
</path></svg>`;
            break;
        case PieceType.Jiang:
            square.innerHTML = `<svg viewBox="0 0 32 32" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
<path d="M0 0H8L0 8M24 0H32V8M32 24V32H24M0 32H8L0 24M0 22-6 16 0 10M10 32 16 38 22 32M32 22 38 16 32 10M22 0 16-6 10 0">
</path></svg>`;
            break;
        case PieceType.Zi:
            square.innerHTML = `<svg viewBox="0 0 32 32" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
<path d="${val?.color === Color.Yellow ? "M32 22 38 16 32 10" : "M0 22-6 16 0 10"}">
</path></svg>`;
            break;
        case PieceType.Hou:
            square.innerHTML = `<svg viewBox="0 0 32 32" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
<path d="${val?.color === Color.Yellow ? "M24 0H32V8M32 24V32H24M0 22-6 16 0 10M10 32 16 38 22 32M32 22 38 16 32 10M22 0 16-6 10 0" : "M0 0H8L0 8M0 32H8L0 24M0 22-6 16 0 10M10 32 16 38 22 32M32 22 38 16 32 10M22 0 16-6 10 0"}">
</path></svg>`;
            break;
    }

    square.innerHTML += `<h3>${val?.pieceToString() || ""}</h3>`;
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

// @ts-ignore
window.showLegalMoves = showLegalMoves;
// @ts-ignore
window.clearLegalMoves = clearLegalMoves;

function init() {
    document.onclick = e => {
        const k = (e.target as Element).id;
        if (k.startsWith("square")) {
            const idx = parseInt(k.split("square")[1]);

            for (const m of board.legalMoves()) {
                if (m.from === selected && m.to === idx) {
                    board.makeMove(m);
                    clearLegalMoves();
                    updateBoard();

                    if (board.status === Status.YellowWin) {
                        alert("Yellow wins!");
                    } else if (board.status === Status.BlueWin) {
                        alert("Blue wins!");
                    }

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

            if (selected === 64 + idx) {
                clearLegalMoves();
                selected = null;
            } else {
                showLegalMoves(64 + idx);
                selected = 64 + idx;
            }
        } else {
            clearLegalMoves();
            selected = null;
        }
    };

    for (let i = 0; i < 12; i++) {
        document.querySelector<HTMLDivElement>("#board")!.innerHTML +=
            `<div class='square' id='square${i}'"></div>`;
    }

    updateBoard();
}

init();
