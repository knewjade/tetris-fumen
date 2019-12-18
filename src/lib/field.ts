import { getBlockXYs, InnerField, PlayField } from './inner_field';
import { parsePiece, parsePieceName, parseRotation, PieceType, RotationType } from './defines';

export interface Operation {
    type: PieceType;
    rotation: RotationType;
    x: number;
    y: number;
}

function toMino(operationOrMino: Operation | Mino) {
    return operationOrMino instanceof Mino ? operationOrMino.copy() : Mino.from(operationOrMino);
}

export class Field {
    public static create(field: string, garbage?: string): Field {
        return new Field(new InnerField({
            field: PlayField.load(field),
            garbage: garbage !== undefined ? PlayField.loadMinify(garbage) : undefined,
        }));
    }

    constructor(private readonly field: InnerField) {
    }

    canFill(operation?: Operation | Mino): boolean {
        if (operation === undefined) {
            return true;
        }

        const mino = toMino(operation);
        return this.field.canFillAll(mino.positions());
    }

    canLock(operation?: Operation | Mino): boolean {
        if (operation === undefined) {
            return true;
        }

        if (!this.canFill(operation)) {
            return false;
        }

        // Check on the ground
        return !this.canFill({ ...operation, y: operation.y - 1 });
    }

    fill(operation?: Operation | Mino): Mino | undefined {
        if (operation === undefined) {
            return undefined;
        }

        const mino = toMino(operation);

        if (!this.canLock(mino)) {
            throw Error('Cannot fill piece on field');
        }

        this.field.fillAll(mino.positions(), parsePiece(mino.type));

        return mino;
    }

    put(operation?: Operation | Mino): Mino | undefined {
        if (operation === undefined) {
            return undefined;
        }

        const mino = toMino(operation);

        for (; 0 <= mino.y; mino.y -= 1) {
            if (!this.canLock(mino)) {
                continue;
            }

            this.fill(mino);

            return mino;
        }

        throw Error('Cannot put piece on field');
    }

    clearLine(): void {
        this.field.clearLine();
    }

    at(x: number, y: number): PieceType {
        return parsePieceName(this.field.getNumberAt(x, y));
    }

    set(x: number, y: number, type: PieceType | string): void {
        this.field.setNumberAt(x, y, parsePiece(type));
    }

    copy(): Field {
        return new Field(this.field.copy());
    }

    str(option: { reduced?: boolean, separator?: string, garbage?: boolean } = {}): string {
        let skip = option.reduced !== undefined ? option.reduced : true;
        const separator = option.separator !== undefined ? option.separator : '\n';
        const minY = option.garbage === undefined || option.garbage ? -1 : 0;

        let output = '';

        for (let y = 22; minY <= y; y -= 1) {
            let line = '';
            for (let x = 0; x < 10; x += 1) {
                line += this.at(x, y);
            }

            if (skip && line === '__________') {
                continue;
            }

            skip = false;
            output += line;
            if (y !== minY) {
                output += separator;
            }
        }

        return output;
    }
}

export class Mino {
    static from(operation: Operation): Mino {
        return new Mino(operation.type, operation.rotation, operation.x, operation.y);
    }

    constructor(
        public type: PieceType,
        public rotation: RotationType,
        public x: number,
        public y: number,
    ) {
    }

    positions(): { x: number, y: number }[] {
        return getBlockXYs(parsePiece(this.type), parseRotation(this.rotation), this.x, this.y).sort((a, b) => {
            if (a.y === b.y) {
                return a.x - b.x;
            }
            return a.y - b.y;
        });
    }

    operation(): Operation {
        return {
            type: this.type,
            rotation: this.rotation,
            x: this.x,
            y: this.y,
        };
    }

    isValid(): boolean {
        try {
            parsePiece(this.type);
            parseRotation(this.rotation);
        } catch (e) {
            return false;
        }

        return this.positions().every(({ x, y }) => {
            return 0 <= x && x < 10 && 0 <= y && y < 23;
        });
    }

    copy(): Mino {
        return new Mino(this.type, this.rotation, this.x, this.y);
    }
}
