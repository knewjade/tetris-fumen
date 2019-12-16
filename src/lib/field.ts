import { Inner_field } from './inner_field';
import { parsePiece, parsePieceName, parseRotation, PieceType, RotationType } from './defines';

export class Field {
    constructor(private readonly field: Inner_field) {
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

    at(x: number, y: number): PieceType {
        return parsePieceName(this.field.getNumberAt(x, y));
    }
}
