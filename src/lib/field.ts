import { InnerField, PlayField } from './inner_field';
import { parsePiece, parsePieceName, parseRotation, PieceType, RotationType } from './defines';

export class Field {
    public static create(field: string, garbage?: string): Field {
        return new Field(new InnerField({
            field: PlayField.load(field),
            garbage: garbage !== undefined ? PlayField.loadMinify(garbage) : undefined,
        }));
    }

    constructor(private readonly field: InnerField) {
    }

    canFill(operation?: {
        type: PieceType;
        rotation: RotationType;
        x: number;
        y: number;
    }): boolean {
        if (operation === undefined) {
            return true;
        }

        return this.field.canFill(
            parsePiece(operation.type), parseRotation(operation.rotation), operation.x, operation.y,
        );
    }

    canLock(operation?: {
        type: PieceType;
        rotation: RotationType;
        x: number;
        y: number;
    }): boolean {
        if (operation === undefined) {
            return true;
        }

        if (!this.canFill(operation)) {
            return false;
        }

        // Check on the ground
        return !this.canFill({ ...operation, y: operation.y - 1 });
    }

    fill(operation?: {
        type: PieceType;
        rotation: RotationType;
        x: number;
        y: number;
    }): void {
        if (operation === undefined) {
            return;
        }

        if (!this.canLock(operation)) {
            throw Error('Cannot fill piece on field');
        }

        this.field.fill({
            type: parsePiece(operation.type),
            rotation: parseRotation(operation.rotation),
            x: operation.x,
            y: operation.y,
        });
    }

    put(operation?: {
        type: PieceType;
        rotation: RotationType;
        x: number;
        y: number;
    }): void {
        if (operation === undefined) {
            return;
        }

        const op = { ...operation };

        for (; 0 <= op.y; op.y -= 1) {
            if (!this.canLock(op)) {
                continue;
            }

            this.field.fill({
                type: parsePiece(op.type),
                rotation: parseRotation(op.rotation),
                x: op.x,
                y: op.y,
            });

            return;
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
