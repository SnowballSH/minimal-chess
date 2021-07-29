import {Board, Color, Move, PieceType, Status} from "./board";

const END = 66666;
const TT_SIZE = 2_000_000;

const QUIESCENCE_SEARCH_LIMIT = 95;
const EVAL_ROUGHNESS = 8;
const STOP_SEARCH = END * Math.PI;

function evalBoard(board: Board, ply: number, heavy?: boolean) {
    if (board.status === Status.YellowWin) {
        return board.colorToMove === Color.Yellow ? END - ply : -END + ply;
    }
    if (board.status === Status.BlueWin) {
        return board.colorToMove === Color.Blue ? END - ply : -END + ply;
    }
    if (board.status === Status.Draw) {
        return 0;
    }

    let result = 0;

    for (const piece of board.board) {
        if (piece === null) continue;

        const modifier = board.colorToMove === piece?.color ? 1 : -1;

        switch (piece?.type) {
            case PieceType.Wang:
                result += 20000 * modifier;
                break;
            case PieceType.Zi:
                result += 100 * modifier;
                break;
            case PieceType.Jiang:
                result += 250 * modifier;
                break;
            case PieceType.Xiang:
                result += 250 * modifier;
                break;
            case PieceType.Hou:
                result += 300 * modifier;
                break;
        }
    }

    for (const piece of board.pool) {
        const modifier = board.colorToMove === piece?.color ? 1 : -1;

        switch (piece?.type) {
            case PieceType.Zi:
                result += 40 * modifier;
                break;
            case PieceType.Jiang:
                result += 80 * modifier;
                break;
            case PieceType.Xiang:
                result += 80 * modifier;
                break;
        }
    }

    if (heavy) {
        result += Array.from(board.legalMoves(x => x === PieceType.Wang)).length * 10;
        result += Array.from(board.legalMoves(x => x === PieceType.Jiang
            || x === PieceType.Xiang
            || x === PieceType.Hou)).length * 25;

        board.nullMove();
        result -= Array.from(board.legalMoves(x => x === PieceType.Wang)).length * 10;
        result -= Array.from(board.legalMoves(x => x === PieceType.Jiang
            || x === PieceType.Xiang
            || x === PieceType.Hou)).length * 25;
        board.undoMove();
    }

    return result;
}

interface SunfishEntry {
    lower: number,
    upper: number
}

interface SunfishTTScore {
    hash: number,
    depth: number,
    isRoot: boolean,
}

const DEFAULT_ENTRY: SunfishEntry = {
    lower: -END,
    upper: END,
};

export class SunfishSearcher {
    scoreTable: Map<SunfishTTScore, SunfishEntry> = new Map();
    moveTable: Map<number, Move> = new Map();
    public nodes: number = 0;
    public depth: number = 0;
    public seldepth: number = 0;
    startTime: number = new Date().getTime();
    durationMS: number = 600;

    bound(board: Board, gamma: number, depth: number, ply: number, root: boolean, heavy?: boolean): number {
        this.nodes++;
        this.seldepth = Math.max(ply, this.seldepth);

        let entry = this.scoreTable.get({
            hash: board.hash,
            depth: Math.max(depth, 0),
            isRoot: root,
        });

        if (entry === undefined) entry = DEFAULT_ENTRY;

        if (entry.lower >= gamma && (!root || this.moveTable.has(board.hash))) {
            return entry.lower;
        } else if (entry.upper < gamma) {
            return entry.upper;
        }

        if (new Date().getTime() - this.startTime > this.durationMS) {
            return STOP_SEARCH;
        }

        let best = -END;

        if (depth <= 0) {
            let score = evalBoard(board, ply, heavy);
            best = Math.max(best, score);
        }

        if (best <= gamma) {
            let m = this.moveTable.get(board.hash);
            if (m !== undefined) {
                board.makeMove(m);
                if (depth > 0 || evalBoard(board, ply) >= QUIESCENCE_SEARCH_LIMIT) {
                    let score = -this.bound(board, 1 - gamma, depth - 1, ply + 1, false, heavy);
                    board.undoMove();
                    if (score === STOP_SEARCH) {
                        return STOP_SEARCH;
                    }
                    best = Math.max(best, score);
                } else {
                    board.undoMove();
                }
            }
        }

        if (best < gamma) {
            let moves = Array.from(board.legalMoves()).map(x => {
                board.makeMove(x);
                let score = evalBoard(board, ply);
                board.undoMove();
                return {
                    score: -score,
                    move: x,
                };
            }).sort((a, b) => a.score - b.score);

            for (const e of moves) {
                if (depth > 0 || (-e.score >= QUIESCENCE_SEARCH_LIMIT && evalBoard(board, ply) - e.score > best)) {
                    board.makeMove(e.move);
                    let score = -this.bound(board, 1 - gamma, depth - 1, ply + 1, false, heavy);
                    board.undoMove();
                    if (score === STOP_SEARCH) return STOP_SEARCH;
                    best = Math.max(best, score);
                    if (best >= gamma) {
                        if (this.moveTable.size >= TT_SIZE) this.moveTable.clear();
                        this.moveTable.set(board.hash, e.move);
                        break;
                    }
                } else {
                    break;
                }
            }
        }

        if (this.scoreTable.size >= TT_SIZE) this.scoreTable.clear();
        if (best >= gamma) {
            this.scoreTable.set({
                hash: board.hash,
                depth: depth,
                isRoot: root,
            }, {
                lower: best,
                upper: entry.upper,
            });
        } else if (best < gamma) {
            this.scoreTable.set({
                hash: board.hash,
                depth: depth,
                isRoot: root,
            }, {
                lower: entry.lower,
                upper: best,
            });
        }

        return best;
    }

    public search(board: Board, durationMS: number, maxDepth?: number, heavy?: boolean) {
        this.durationMS = durationMS;
        this.nodes = 0;
        this.depth = 0;
        this.seldepth = 0;
        this.startTime = new Date().getTime();

        let lastMove: Move | null = null;

        for (this.depth = 1; this.depth <= (maxDepth === undefined ? 100 : maxDepth); this.depth++) {
            let lower = -END;
            let upper = END;
            while (lower < upper - EVAL_ROUGHNESS) {
                let gamma = Math.floor((lower + upper + 1) / 2);
                let score = this.bound(board, gamma, this.depth, 0, true, heavy);
                if (score === STOP_SEARCH) {
                    lower = STOP_SEARCH;
                    break;
                }
                if (score >= gamma) {
                    lower = score;
                } else {
                    upper = score;
                }
            }

            if (lower === STOP_SEARCH) {
                break;
            }
            let score = this.bound(board, lower, this.depth, 0, true, heavy);
            if (score === STOP_SEARCH) {
                break;
            }

            console.log(`DEPTH ${this.depth} SCORE ${score} NODES ${this.nodes} TIME ${new Date().getTime() - this.startTime}`);

            lastMove = this.moveTable.get(board.hash)!;

            if (new Date().getTime() - this.startTime > this.durationMS || score > END - 10) {
                break;
            }
        }

        return lastMove;
    }
}
