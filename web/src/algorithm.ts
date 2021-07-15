import {Board, Color, Flag, Move, PieceType, Status} from "./board";

enum TTFLag {
    Exact,
    Upper,
    Lower,
}

type TTBasic = Map<number, {
    depth: number,
    flag: TTFLag,
    value: number,
}>;

const END = 66666;
const TT_SIZE = 2_000_000;

const QUIESCENCE_SEARCH_LIMIT = 95;
const EVAL_ROUGHNESS = 8;
const STOP_SEARCH = END * Math.PI;

export class BasicSearcher {
    tt: TTBasic = new Map();
    depth: number = 0;
    nodes: number = 0;
    seldepth: number = 0;

    negamax(board: Board, depth: number, alpha: number, beta: number, ply: number): number {
        let alphaO = alpha;

        this.seldepth = Math.max(this.seldepth, ply);
        this.nodes++;

        let entry = this.tt.get(board.hash);
        if (entry !== undefined && entry.depth >= depth) {
            switch (entry.flag) {
                case TTFLag.Exact:
                    return entry.value;
                case TTFLag.Upper:
                    beta = Math.min(beta, entry.value);
                    break;
                case TTFLag.Lower:
                    alpha = Math.max(alpha, entry.value);
                    break;
            }

            if (alpha > beta)
                return entry.value;
        }

        if (depth === 0 || board.status !== Status.OnGoing)
            return this.q(board, depth, alpha, beta, ply);

        let moves = Array.from(board.legalMoves());
        let value = -Infinity;
        for (const m of moves) {
            board.makeMove(m);
            let k = this.negamax(board, depth - 1, -beta, -alpha, ply + 1);
            board.undoMove();
            value = Math.max(value, -k);
            alpha = Math.max(alpha, value);
            if (alpha > beta) break;
        }

        if (this.tt.size >= TT_SIZE) {
            this.tt.clear();
        }

        if (this.tt.size >= TT_SIZE) {
            this.tt.clear();
        }

        this.tt.set(board.hash, {
            depth: depth,
            value: value,
            flag: value <= alphaO ? TTFLag.Upper : value >= beta ? TTFLag.Lower : TTFLag.Exact,
        });

        return value;
    }

    q(board: Board, depth: number, alpha: number, beta: number, ply: number): number {
        let alphaO = alpha;
        this.nodes++;

        this.seldepth = Math.max(this.seldepth, ply);

        let entry = this.tt.get(board.hash);
        if (entry !== undefined && entry.depth >= depth) {
            switch (entry.flag) {
                case TTFLag.Exact:
                    return entry.value;
                case TTFLag.Upper:
                    beta = Math.min(beta, entry.value);
                    break;
                case TTFLag.Lower:
                    alpha = Math.max(alpha, entry.value);
                    break;
            }

            if (alpha > beta)
                return entry.value;
        }

        let moves = Array.from(board.legalMoves()).filter(x => x.flag === Flag.Capture);

        if (board.status !== Status.OnGoing || moves.length === 0) {
            return evalBoard(board, ply);
        }

        let value = -Infinity;
        for (const m of moves) {
            board.makeMove(m);
            let k = this.q(board, depth - 1, -beta, -alpha, ply + 1);
            board.undoMove();
            value = Math.max(value, -k);
            alpha = Math.max(alpha, value);
            if (alpha > beta) break;
        }

        this.tt.set(board.hash, {
            depth: depth,
            value: value,
            flag: value <= alphaO ? TTFLag.Upper : value >= beta ? TTFLag.Lower : TTFLag.Exact,
        });

        return value;
    }

    negaRoot(board: Board, depth: number): [Move | null, number] {
        this.nodes = 0;
        this.seldepth = 0;
        this.depth = depth;
        return this.mtdfNegaRoot(board, -Infinity, Infinity, depth);
    }

    mtdfNegaRoot(board: Board, alpha: number, beta: number, depth: number): [Move | null, number] {
        let value = -Infinity;
        let bestMove: Move | null = null;
        let moves = Array.from(board.legalMoves());

        for (const m of moves) {
            board.makeMove(m);
            let k = this.negamax(board, depth - 1, -beta, -alpha, 0);
            board.undoMove();
            value = Math.max(value, -k);
            if (k >= value) {
                bestMove = m;
            }
            alpha = Math.max(alpha, value);
            if (alpha > beta) break;
        }

        return [bestMove, value];
    }
}

function evalBoard(board: Board, ply: number) {
    if (board.status === Status.YellowWin) {
        return board.colorToMove === Color.Yellow ? END - ply : -END + ply;
    }
    if (board.status === Status.BlueWin) {
        return board.colorToMove === Color.Blue ? END - ply : -END + ply;
    }

    let result = 0;

    for (const piece of board.board) {
        if (piece === null) continue;

        const modifier = board.colorToMove === piece?.color ? 1 : -1;

        switch (piece?.type) {
            case PieceType.Jiang:
                result += 20000 * modifier;
                break;
            case PieceType.Zi:
                result += 100 * modifier;
                break;
            case PieceType.Wang:
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
            case PieceType.Wang:
                result += 80 * modifier;
                break;
            case PieceType.Xiang:
                result += 80 * modifier;
                break;
        }
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

    bound(board: Board, gamma: number, depth: number, ply: number, root: boolean): number {
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
            let score = evalBoard(board, ply);
            best = Math.max(best, score);
        }

        if (best <= gamma) {
            let m = this.moveTable.get(board.hash);
            if (m !== undefined) {
                board.makeMove(m);
                if (depth > 0 || evalBoard(board, ply) >= QUIESCENCE_SEARCH_LIMIT) {
                    let score = -this.bound(board, 1 - gamma, depth - 1, ply + 1, false);
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
                    let score = -this.bound(board, 1 - gamma, depth - 1, ply + 1, false);
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

    public search(board: Board, durationMS: number, maxDepth?: number) {
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
                let score = this.bound(board, gamma, this.depth, 0, true);
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
            let score = this.bound(board, lower, this.depth, 0, true);
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
