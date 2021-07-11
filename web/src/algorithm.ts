import {Board, Flag, Move, PieceType, Status} from "./board";

export enum TTFLag {
    Exact,
    Upper,
    Lower,
}

type TT = Map<number, {
    depth: number,
    flag: TTFLag,
    value: number,
}>;

export class BasicSearcher {
    tt: TT = new Map();
    depth: number = 0;
    seldepth: number = 0;

    negamax(board: Board, depth: number, alpha: number, beta: number, ply: number): number {
        let alphaO = alpha;

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

        if (depth === 0 || board.status !== Status.OnGoing)
            return this.q(board, depth, alpha, beta, ply);

        let moves = Array.from(board.legalMoves());
        let value = -Infinity;
        for (const m of moves) {
            board.makeMove(m);
            value = Math.max(value, -this.negamax(board, depth - 1, -beta, -alpha, ply + 1));
            board.undoMove();
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

    q(board: Board, depth: number, alpha: number, beta: number, ply: number): number {
        let alphaO = alpha;

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
            return this.eval(board, ply);
        }

        let value = -Infinity;
        for (const m of moves) {
            board.makeMove(m);
            value = Math.max(value, -this.q(board, depth - 1, -beta, -alpha, ply + 1));
            board.undoMove();
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
        this.seldepth = 0;
        this.depth = 0;
        let alpha = -Infinity;
        let beta = Infinity;
        let moves = Array.from(board.legalMoves());
        let value = -Infinity;
        let bestMove: Move | null = null;

        for (const m of moves) {
            board.makeMove(m);
            let k = -this.negamax(board, depth - 1, -beta, -alpha, 0);
            value = Math.max(value, k);
            if (k >= value) {
                bestMove = m;
            }
            board.undoMove();
            alpha = Math.max(alpha, value);
            if (alpha > beta) break;
        }

        this.depth = depth;

        return [bestMove, value];
    }

    eval(board: Board, ply: number) {
        let result = 0;

        for (const [, piece] of board.piecesForColor(board.colorToMove)) {
            switch (piece?.type) {
                case PieceType.Jiang:
                    result += 20000 - ply;
                    break;
                case PieceType.Zi:
                    result += 100;
                    break;
                case PieceType.Wang:
                    result += 250;
                    break;
                case PieceType.Xiang:
                    result += 250;
                    break;
                case PieceType.Hou:
                    result += 300;
                    break;
            }
        }

        for (const [, piece] of board.piecesForColor(board.colorToMove ^ 1)) {
            switch (piece?.type) {
                case PieceType.Jiang:
                    result -= 20000 - ply;
                    break;
                case PieceType.Zi:
                    result -= 100;
                    break;
                case PieceType.Wang:
                    result -= 250;
                    break;
                case PieceType.Xiang:
                    result -= 250;
                    break;
                case PieceType.Hou:
                    result -= 300;
                    break;
            }
        }

        return result;
    }
}