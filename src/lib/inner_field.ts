import { Operation, parsePiece, Piece, Rotation } from './defines';
import { Field } from './field';

const FieldConstants = {
    Width: 10,
    Height: 23,
    PlayBlocks: 23 * 10,  // Height * Width
};

export function createNewInnerField(): InnerField {
    return new InnerField({});
}

export function createInnerField(field: Field): InnerField {
    const innerField = new InnerField({});
    for (let y = -1; y < FieldConstants.Height; y += 1) {
        for (let x = 0; x < FieldConstants.Width; x += 1) {
            const at = field.at(x, y);
            innerField.setNumberAt(x, y, parsePiece(at));
        }
    }
    return innerField;
}

export class InnerField {
    private readonly field: PlayField;
    private readonly garbage: PlayField;

    private static create(length: number): PlayField {
        return new PlayField({ length });
    }

    constructor({
                    field = InnerField.create(FieldConstants.PlayBlocks),
                    garbage = InnerField.create(FieldConstants.Width),
                }: {
                    field?: PlayField,
                    garbage?: PlayField,
                },
    ) {
        this.field = field;
        this.garbage = garbage;
    }

    fill(operation: Operation): void {
        this.field.fill(operation);
    }

    canFill(piece: Piece, rotation: Rotation, x: number, y: number) {
        const positions = getBlockPositions(piece, rotation, x, y);
        return positions.every(([px, py]) => {
            return 0 <= px && px < 10
                && 0 <= py && py < FieldConstants.Height
                && this.getNumberAt(px, py) === Piece.Empty;
        });
    }

    isOnGround(piece: Piece, rotation: Rotation, x: number, y: number) {
        return !this.canFill(piece, rotation, x, y - 1);
    }

    clearLine(): void {
        this.field.clearLine();
    }

    riseGarbage(): void {
        this.field.up(this.garbage);
        this.garbage.clearAll();
    }

    mirror(): void {
        this.field.mirror();
    }

    shiftToLeft(): void {
        this.field.shiftToLeft();
    }

    shiftToRight(): void {
        this.field.shiftToRight();
    }

    shiftToUp(): void {
        this.field.shiftToUp();
    }

    shiftToBottom(): void {
        this.field.shiftToBottom();
    }

    copy(): InnerField {
        return new InnerField({ field: this.field.copy(), garbage: this.garbage.copy() });
    }

    equals(other: InnerField): boolean {
        return this.field.equals(other.field) && this.garbage.equals(other.garbage);
    }

    addNumber(x: number, y: number, value: number): void {
        if (0 <= y) {
            this.field.addOffset(x, y, value);
        } else {
            this.garbage.addOffset(x, -(y + 1), value);
        }
    }

    setNumberFieldAt(index: number, value: number): void {
        this.field.setAt(index, value);
    }

    setNumberGarbageAt(index: number, value: number): void {
        this.garbage.setAt(index, value);
    }

    setNumberAt(x: number, y: number, value: number): void {
        return 0 <= y ? this.field.set(x, y, value) : this.garbage.set(x, -(y + 1), value);
    }

    getNumberAt(x: number, y: number): Piece {
        return 0 <= y ? this.field.get(x, y) : this.garbage.get(x, -(y + 1));
    }

    getNumberAtIndex(index: number, isField: boolean): Piece {
        if (isField) {
            return this.getNumberAt(index % 10, Math.floor(index / 10));
        }
        return this.getNumberAt(index % 10, -(Math.floor(index / 10) + 1));
    }

    toFieldNumberArray(): Piece[] {
        return this.field.toArray();
    }

    toGarbageNumberArray(): Piece[] {
        return this.garbage.toArray();
    }
}

export class PlayField {
    static load(...lines: string[]): PlayField {
        const blocks = lines.join('').trim();
        return PlayField.loadInner(blocks);
    }

    static loadMinify(...lines: string[]): PlayField {
        const blocks = lines.join('').trim();
        return PlayField.loadInner(blocks, blocks.length);
    }

    private static loadInner(blocks: string, length?: number): PlayField {
        const len = length !== undefined ? length : blocks.length;
        if (len % 10 !== 0) {
            throw new Error('Num of blocks in field should be mod 10');
        }

        const field = length !== undefined ? new PlayField({ length }) : new PlayField({});
        for (let index = 0; index < len; index += 1) {
            const block = blocks[index];
            field.set(index % 10, Math.floor((len - index - 1) / 10), parsePiece(block));
        }
        return field;
    }

    private readonly length: number;
    private pieces: Piece[];

    constructor({ pieces, length = FieldConstants.PlayBlocks }: {
        pieces?: Piece[],
        length?: number,
    }) {
        if (pieces !== undefined) {
            this.pieces = pieces;
        } else {
            this.pieces = Array.from({ length }).map(() => Piece.Empty);
        }
        this.length = length;
    }

    get(x: number, y: number): Piece {
        return this.pieces[x + y * FieldConstants.Width];
    }

    addOffset(x: number, y: number, value: number) {
        this.pieces[x + y * FieldConstants.Width] += value;
    }

    set(x: number, y: number, piece: Piece) {
        this.setAt(x + y * FieldConstants.Width, piece);
    }

    setAt(index: number, piece: Piece) {
        this.pieces[index] = piece;
    }

    fill({ type, rotation, x, y }: { type: Piece, rotation: Rotation, x: number, y: number }) {
        const blocks = getBlocks(type, rotation);
        for (const block of blocks) {
            const [nx, ny] = [x + block[0], y + block[1]];
            this.set(nx, ny, type);
        }
    }

    clearLine() {
        let newField = this.pieces.concat();
        const top = this.pieces.length / FieldConstants.Width - 1;
        for (let y = top; 0 <= y; y -= 1) {
            const line = this.pieces.slice(y * FieldConstants.Width, (y + 1) * FieldConstants.Width);
            const isFilled = line.every(value => value !== Piece.Empty);
            if (isFilled) {
                const bottom = newField.slice(0, y * FieldConstants.Width);
                const over = newField.slice((y + 1) * FieldConstants.Width);
                newField = bottom.concat(over, Array.from({ length: FieldConstants.Width }).map(() => Piece.Empty));
            }
        }
        this.pieces = newField;
    }

    up(blockUp: PlayField) {
        this.pieces = blockUp.pieces.concat(this.pieces).slice(0, this.length);
    }

    mirror() {
        const newField: Piece[] = [];
        for (let y = 0; y < this.pieces.length; y += 1) {
            const line = this.pieces.slice(y * FieldConstants.Width, (y + 1) * FieldConstants.Width);
            line.reverse();
            for (const obj of line) {
                newField.push(obj);
            }
        }
        this.pieces = newField;
    }

    shiftToLeft(): void {
        const height = this.pieces.length / 10;
        for (let y = 0; y < height; y += 1) {
            for (let x = 0; x < FieldConstants.Width - 1; x += 1) {
                this.pieces[x + y * FieldConstants.Width] = this.pieces[x + 1 + y * FieldConstants.Width];
            }
            this.pieces[9 + y * FieldConstants.Width] = Piece.Empty;
        }
    }

    shiftToRight(): void {
        const height = this.pieces.length / 10;
        for (let y = 0; y < height; y += 1) {
            for (let x = FieldConstants.Width - 1; 1 <= x; x -= 1) {
                this.pieces[x + y * FieldConstants.Width] = this.pieces[x - 1 + y * FieldConstants.Width];
            }
            this.pieces[y * FieldConstants.Width] = Piece.Empty;
        }
    }

    shiftToUp(): void {
        const blanks = Array.from({ length: 10 }).map(() => Piece.Empty);
        this.pieces = blanks.concat(this.pieces).slice(0, this.length);
    }

    shiftToBottom(): void {
        const blanks = Array.from({ length: 10 }).map(() => Piece.Empty);
        this.pieces = this.pieces.slice(10, this.length).concat(blanks);
    }

    toArray(): Piece[] {
        return this.pieces.concat();
    }

    get numOfBlocks(): number {
        return this.pieces.length;
    }

    copy(): PlayField {
        return new PlayField({ pieces: this.pieces.concat(), length: this.length });
    }

    toShallowArray() {
        return this.pieces;
    }

    clearAll() {
        this.pieces = this.pieces.map(() => Piece.Empty);
    }

    equals(other: PlayField): boolean {
        if (this.pieces.length !== other.pieces.length) {
            return false;
        }

        for (let index = 0; index < this.pieces.length; index += 1) {
            if (this.pieces[index] !== other.pieces[index]) {
                return false;
            }
        }

        return true;
    }
}

export function getBlockPositions(piece: Piece, rotation: Rotation, x: number, y: number): number[][] {
    return getBlocks(piece, rotation).map((position) => {
        position[0] += x;
        position[1] += y;
        return position;
    });
}

export function getBlocks(piece: Piece, rotation: Rotation): number[][] {
    const blocks = getPieces(piece);
    switch (rotation) {
    case Rotation.Spawn:
        return blocks;
    case Rotation.Left:
        return rotateLeft(blocks);
    case Rotation.Reverse:
        return rotateReverse(blocks);
    case Rotation.Right:
        return rotateRight(blocks);
    }
    throw new Error('Unsupported block');
}

export function getPieces(piece: Piece): number[][] {
    switch (piece) {
    case Piece.I:
        return [[0, 0], [-1, 0], [1, 0], [2, 0]];
    case Piece.T:
        return [[0, 0], [-1, 0], [1, 0], [0, 1]];
    case Piece.O:
        return [[0, 0], [1, 0], [0, 1], [1, 1]];
    case Piece.L:
        return [[0, 0], [-1, 0], [1, 0], [1, 1]];
    case Piece.J:
        return [[0, 0], [-1, 0], [1, 0], [-1, 1]];
    case Piece.S:
        return [[0, 0], [-1, 0], [0, 1], [1, 1]];
    case Piece.Z:
        return [[0, 0], [1, 0], [0, 1], [-1, 1]];
    }
    throw new Error('Unsupported rotation');
}

function rotateRight(positions: number[][]): number[][] {
    return positions.map(current => [current[1], -current[0]]);
}

function rotateLeft(positions: number[][]): number[][] {
    return positions.map(current => [-current[1], current[0]]);
}

function rotateReverse(positions: number[][]): number[][] {
    return positions.map(current => [-current[0], -current[1]]);
}
