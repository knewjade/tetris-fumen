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

    put(operation?: {
        type: PieceType;
        rotation: RotationType;
        x: number;
        y: number;
    }): void {
        if (operation === undefined) {
            return;
        }

        this.field.put({
            type: parsePiece(operation.type),
            rotation: parseRotation(operation.rotation),
            x: operation.x,
            y: operation.y,
        });
    }

    canPut(operation?: {
        type: PieceType;
        rotation: RotationType;
        x: number;
        y: number;
    }): void {
        if (operation === undefined) {
            return;
        }

        this.field.canPut(parsePiece(operation.type), parseRotation(operation.rotation), operation.x, operation.y);
    }

    clearLine(): void {
        this.field.clearLine();
    }

    at(x: number, y: number): PieceType {
        return parsePieceName(this.field.getNumberAt(x, y));
    }

    set(x: number, y: number, type: PieceType): void {
        this.field.setNumberAt(x, y, parsePiece(type));
    }

    copy(): Field {
        return new Field(this.field.copy());
    }
}
