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
    public history: {
        board: (Piece | null)[],
        status: Status,
        pool: Piece[],
        msc: number,
    }[] = [];
    public status: Status = Status.OnGoing;
    public pool: Piece[] = [];
    hashTable: Uint32Array[] = [];
    hashTableOther: Uint32Array;
    public hash: number = 0;
    public movesSinceLastCapture: number = 0;

    constructor() {
        this.board = [
            new Piece(PieceType.Xiang, Color.Yellow),
            null,
            null,
            new Piece(PieceType.Jiang, Color.Blue),
            new Piece(PieceType.Wang, Color.Yellow),
            new Piece(PieceType.Zi, Color.Yellow),
            new Piece(PieceType.Zi, Color.Blue),
            new Piece(PieceType.Wang, Color.Blue),
            new Piece(PieceType.Jiang, Color.Yellow),
            null,
            null,
            new Piece(PieceType.Xiang, Color.Blue),
        ];

        for (let i = 0; i < 22; i++) {
            this.hashTable[i] = crypto.getRandomValues(new Uint32Array(10));
        }

        this.hashTableOther = crypto.getRandomValues(new Uint32Array(2));

        this.calculateHash();
    }

    // Syntax: 12 digits of pieces on board (0-9 or *) + " " + all valid pool items (0-9) + " " + color to move + status + " " + moves since capture
    static fromFEN(fen: string) {
        const [onBoard, inPool, others, msc] = fen.split(" ");
        let board = [];
        for (const ch of onBoard) {
            let val: number = parseInt(ch);
            if (isNaN(val)) board.push(null);
            else board.push(new Piece(val % 5, Math.floor(val / 5)));
        }
        let pool = [];
        for (const ch of inPool) {
            let val: number = parseInt(ch);
            pool.push(new Piece(val % 5, Math.floor(val / 5)));
        }
        let bd = new Board();
        bd.board = board;
        bd.pool = pool;
        bd.colorToMove = parseInt(others[0]);
        bd.status = parseInt(others[1]);
        bd.movesSinceLastCapture = parseInt(msc);

        for (let i = 0; i < 22; i++) {
            bd.hashTable[i] = crypto.getRandomValues(new Uint32Array(10));
        }

        bd.hashTableOther = crypto.getRandomValues(new Uint32Array(2));

        bd.calculateHash();

        return bd;
    }

    toFEN() {
        let s = "";

        s += this.board.map(x => x === null ? "*" : (x.type + 5 * x.color).toString()).join("");
        s += " ";
        s += this.pool.filter(x => x !== undefined).map(x => (x.type + 5 * x.color).toString()).join("");
        s += " ";
        s += this.colorToMove;
        s += this.status;
        s += " ";
        s += this.movesSinceLastCapture;

        return s;
    }

    calculateHash() {
        this.hash = 0;
        for (const [index, piece] of this.board.entries()) {
            if (piece !== null && piece !== undefined) {
                this.hash ^= this.hashTable[index][piece.type + piece.color * 5];
            }
        }
        for (const [index, piece] of this.pool.entries()) {
            this.hash ^= this.hashTable[index + 12][piece.type + piece.color * 5];
        }
        this.hash ^= this.hashTableOther[this.colorToMove];
    }

    * piecesForColor(color: Color) {
        for (const n of this.board.entries()) {
            if (color === n[1]?.color) {
                yield n;
            }
        }
    }

    * emptySquares() {
        for (const n of this.board.entries()) {
            if (n[1] === null) {
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
        this.history.push({
            board: [...this.board],
            status: this.status,
            pool: [...this.pool],
            msc: this.movesSinceLastCapture,
        });

        if (m.flag === Flag.Revive) {
            this.board[m.to] = this.pool[m.from - 12];
            delete this.pool[m.from - 12];

            this.pool = this.pool
                .filter(x => x !== undefined)
                .sort((a, b) => a.color - b.color);
        } else {
            const p = this.board[m.from];
            this.board[m.from] = null;
            if (m.flag === Flag.Capture) {
                const t = Object.create(this.board[m.to]);
                this.board[m.to] = p;
                // win detection
                if (t.type === PieceType.Wang && this.status === Status.OnGoing) {
                    this.status = t.color === Color.Yellow ? Status.BlueWin : Status.YellowWin;
                } else {
                    t.color ^= 1;
                    if (t.type === PieceType.Hou) {
                        this.pool.push(new Piece(PieceType.Zi, t.color));
                    } else {
                        this.pool.push(t);
                    }
                }
            } else if (m.flag === Flag.CapturePromotion) {
                const t = Object.create(this.board[m.to]);
                this.board[m.to] = p !== null ? new Piece(PieceType.Hou, p.color) : null;
                // win detection
                if (t.type === PieceType.Wang && this.status === Status.OnGoing) {
                    this.status = t.color === Color.Yellow ? Status.BlueWin : Status.YellowWin;
                } else {
                    t.color ^= 1;
                    this.pool.push(t);
                }
            } else if (m.flag === Flag.QuietPromotion) {
                this.board[m.to] = p !== null ? new Piece(PieceType.Hou, p.color) : null;
            } else if (m.flag === Flag.Quiet) {
                this.board[m.to] = p;
            }
        }

        this.colorToMove ^= 1;

        // TODO replace with updating method
        this.calculateHash();

        if (m.flag === Flag.Capture) {
            this.movesSinceLastCapture = 0;
        } else {
            this.movesSinceLastCapture++;
        }

        if (this.status === Status.OnGoing && this.movesSinceLastCapture >= 20) {
            this.status = Status.Draw;
        }
    }

    nullMove() {
        this.history.push({
            board: [...this.board],
            status: this.status,
            pool: [...this.pool],
            msc: this.movesSinceLastCapture,
        });

        this.colorToMove ^= 1;
        this.calculateHash();
    }

    undoMove() {
        const h = this.history.pop()!;
        this.board = h.board;
        this.status = h.status;
        this.pool = h.pool;
        this.colorToMove ^= 1;
        this.movesSinceLastCapture = h.msc;
        this.calculateHash();
    }

    * legalMoves(filter?: (x: PieceType | undefined) => boolean) {
        let pieces = filter === undefined ? this.piecesForColor(this.colorToMove) :
            Array.from(this.piecesForColor(this.colorToMove)).filter(x => filter(x[1]?.type));
        // normal moves
        for (const [index, piece] of pieces) {
            if (piece === null) continue;

            for (const dir of piece.pieceDirections()) {
                let newI;
                let m: Move | undefined;
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
                    if (piece.type === PieceType.Zi && (m.to % 4 === 0 || m.to % 4 === 3)) {
                        if (m.flag === Flag.Capture) m.flag = Flag.CapturePromotion;
                        else m.flag = Flag.QuietPromotion;
                    }
                    yield m;
                }
            }
        }

        // revive
        for (const [index, piece] of this.pool.entries()) {
            if (piece === undefined) continue;
            if (piece.color !== this.colorToMove) continue;

            for (const [i] of this.emptySquares()) {
                yield new Move(12 + index, i, Flag.Revive);
            }
        }
    }
}

export enum Flag {
    CapturePromotion,
    QuietPromotion,
    Capture,
    Revive,
    Quiet
}

export enum Status {
    OnGoing,
    YellowWin,
    BlueWin,
    Draw,
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
            case PieceType.Wang:
                return [0, 1, 2, 3, 4, 5, 6, 7];
            case PieceType.Jiang:
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
