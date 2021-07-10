function inBounds(index: number): boolean {
    return index >= 0 && index < 12;
}

function inSameRow(a: number, b: number): boolean {
    return a >> 2 === b >> 2;
}

function isNearRow(a: number, b: number): boolean {
    return Math.abs((a >> 2) - (b >> 2)) === 1;
}

export class Board {
    public board: (Piece | null)[];
    public colorToMove: Color = Color.Yellow;
    public history: (Piece | null)[][] = [];

    constructor() {
        this.board = [
            new Piece(PieceType.Xiang, Color.Yellow),
            null,
            null,
            new Piece(PieceType.Xiang, Color.Blue),
            new Piece(PieceType.Jiang, Color.Yellow),
            new Piece(PieceType.Zi, Color.Yellow),
            new Piece(PieceType.Zi, Color.Blue),
            new Piece(PieceType.Jiang, Color.Blue),
            new Piece(PieceType.Wang, Color.Yellow),
            null,
            null,
            new Piece(PieceType.Wang, Color.Blue),
        ];
    }

    * piecesForColor(color: Color) {
        for (const n of this.board.entries()) {
            if (color === n[1]?.color) {
                yield n;
            }
        }
    }

    isMyPieceOnIndex(color: Color, index: number): boolean {
        return this.board[index]?.color === color;
    }

    isOpponentPieceOnIndex(color: Color, index: number): boolean {
        return this.board[index]?.color === (color ^ 1);
    }

    makeMove(m: Move) {
        this.history.push(this.board);
        const p = this.board[m.from];
        this.board[m.from] = null;
        this.board[m.to] = p;
        this.colorToMove ^= 1;
    }

    undoMove() {
        this.board = this.history.pop()!;
        this.colorToMove ^= 1;
    }

    * legalMoves() {
        for (const [index, piece] of this.piecesForColor(this.colorToMove)) {
            if (piece === null) continue;
            for (const dir of piece.pieceDirections()) {
                let newI;
                let m: Move | undefined = undefined;
                switch (dir) {
                    case Direction.N:
                        newI = index - 4;
                        if (inBounds(newI) && !this.isMyPieceOnIndex(piece.color, newI)) {
                            m = new Move(index, newI);
                        }
                        break;
                    case Direction.S:
                        newI = index + 4;
                        if (inBounds(newI) && !this.isMyPieceOnIndex(piece.color, newI)) {
                            m = new Move(index, newI);
                        }
                        break;
                    case Direction.W:
                        newI = index - 1;
                        if (inBounds(newI) && inSameRow(index, newI) && !this.isMyPieceOnIndex(piece.color, newI)) {
                            m = new Move(index, newI);
                        }
                        break;
                    case Direction.E:
                        newI = index + 1;
                        if (inBounds(newI) && inSameRow(index, newI) && !this.isMyPieceOnIndex(piece.color, newI)) {
                            m = new Move(index, newI);
                        }
                        break;
                    case Direction.NW:
                        newI = index - 5;
                        if (inBounds(newI) && isNearRow(index, newI) && !this.isMyPieceOnIndex(piece.color, newI)) {
                            m = new Move(index, newI);
                        }
                        break;
                    case Direction.NE:
                        newI = index - 3;
                        if (inBounds(newI) && isNearRow(index, newI) && !this.isMyPieceOnIndex(piece.color, newI)) {
                            m = new Move(index, newI);
                        }
                        break;
                    case Direction.SW:
                        newI = index + 3;
                        if (inBounds(newI) && isNearRow(index, newI) && !this.isMyPieceOnIndex(piece.color, newI)) {
                            m = new Move(index, newI);
                        }
                        break;
                    case Direction.SE:
                        newI = index + 5;
                        if (inBounds(newI) && isNearRow(index, newI) && !this.isMyPieceOnIndex(piece.color, newI)) {
                            m = new Move(index, newI);
                        }
                        break;
                }

                if (m !== undefined) {
                    if (this.isOpponentPieceOnIndex(this.colorToMove, m.to)) {
                        m.flag = Flag.Capture;
                    }
                    yield m;
                }
            }
        }
    }
}

export enum Flag {
    Capture,
    Quiet
}

export class Move {
    public from: number;
    public to: number;
    public flag: Flag;

    constructor(from: number, to: number, flag: Flag = Flag.Quiet) {
        this.from = from;
        this.to = to;
        this.flag = flag;
    }
}

export enum PieceType {
    Jiang,
    Wang,
    Xiang,
    Zi,
    Hou,
}

export enum Color {
    Yellow,
    Blue,
}

export class Piece {
    public type: PieceType;
    public color: Color;

    constructor(type: PieceType, color: Color) {
        this.type = type;
        this.color = color;
    }

    pieceDirections(): Direction[] {
        const piece = this;
        switch (piece.type) {
            case PieceType.Jiang:
                return [0, 1, 2, 3, 4, 5, 6, 7];
            case PieceType.Wang:
                return [Direction.N, Direction.E, Direction.S, Direction.W];
            case PieceType.Xiang:
                return [Direction.NE, Direction.NW, Direction.SE, Direction.SW];
            case PieceType.Zi:
                return piece.color === Color.Yellow ? [Direction.E] : [Direction.W];
            case PieceType.Hou:
                return piece.color === Color.Yellow ? [0, 2, 4, 5, 6, 7] : [0, 1, 2, 3, 4, 6];
        }
    }

    public pieceToString(): string {
        return "将王相子侯"[this.type];
    }
}

enum Direction {
    N,
    NW,
    W,
    SW,
    S,
    SE,
    E,
    NE,
}
