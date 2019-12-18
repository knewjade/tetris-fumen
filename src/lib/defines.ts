export enum Piece {
    Empty = 0,
    I = 1,
    L = 2,
    O = 3,
    Z = 4,
    T = 5,
    J = 6,
    S = 7,
    Gray = 8,
}

export type PieceType = 'I' | 'L' | 'O' | 'Z' | 'T' | 'J' | 'S' | 'X' | '_';

export function isMinoPiece(piece: Piece) {
    return piece !== Piece.Empty && piece !== Piece.Gray;
}

export function parsePieceName(piece: Piece): PieceType {
    switch (piece) {
    case Piece.I:
        return 'I';
    case Piece.L:
        return 'L';
    case Piece.O:
        return 'O';
    case Piece.Z:
        return 'Z';
    case Piece.T:
        return 'T';
    case Piece.J:
        return 'J';
    case Piece.S:
        return 'S';
    case Piece.Gray:
        return 'X';
    case Piece.Empty:
        return '_';
    }
    throw new Error(`Unknown piece: ${piece}`);
}

export function parsePiece(piece: string): Piece {
    switch (piece.toUpperCase()) {
    case 'I':
        return Piece.I;
    case 'L':
        return Piece.L;
    case 'O':
        return Piece.O;
    case 'Z':
        return Piece.Z;
    case 'T':
        return Piece.T;
    case 'J':
        return Piece.J;
    case 'S':
        return Piece.S;
    case 'X':
    case 'GRAY':
        return Piece.Gray;
    case ' ':
    case '_':
    case 'EMPTY':
        return Piece.Empty;
    }
    throw new Error(`Unknown piece: ${piece}`);
}

export enum Rotation {
    Spawn = 0,
    Right = 1,
    Reverse = 2,
    Left = 3,
}

export type RotationType = 'spawn' | 'right' | 'reverse' | 'left';

export function parseRotationName(rotation: Rotation): RotationType {
    switch (rotation) {
    case Rotation.Spawn:
        return 'spawn';
    case Rotation.Left:
        return 'left';
    case Rotation.Right:
        return 'right';
    case Rotation.Reverse:
        return 'reverse';
    }
    throw new Error(`Unknown rotation: ${rotation}`);
}

export function parseRotation(rotation: RotationType): Rotation {
    switch (rotation.toLowerCase()) {
    case 'spawn':
        return Rotation.Spawn;
    case 'left':
        return Rotation.Left;
    case 'right':
        return Rotation.Right;
    case 'reverse':
        return Rotation.Reverse;
    }
    throw new Error(`Unknown rotation: ${rotation}`);
}

export interface InnerOperation {
    type: Piece;
    rotation: Rotation;
    x: number;
    y: number;
}
