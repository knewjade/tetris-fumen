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

export function isMinoPiece(piece: Piece) {
    return piece !== Piece.Empty && piece !== Piece.Gray;
}

export function parsePieceName(piece: Piece) {
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
        return 'Gray';
    case Piece.Empty:
        return 'Empty';
    }
    throw new Error('Unexpected piece');
}

export function parsePiece(piece: string) {
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
        return Piece.Gray;
    case ' ':
    case '_':
        return Piece.Empty;
    }
    throw new Error(`Unexpected piece: ${piece}`);
}

export enum Rotation {
    Spawn = 0,
    Right = 1,
    Reverse = 2,
    Left = 3,
}

export function parseRotationName(rotation: Rotation) {
    switch (rotation) {
    case Rotation.Spawn:
        return 'Spawn';
    case Rotation.Left:
        return 'Left';
    case Rotation.Right:
        return 'Right';
    case Rotation.Reverse:
        return 'Reverse';
    }
    throw new Error('Unexpected rotation');
}

export interface Operation {
    type: Piece;
    rotation: Rotation;
    x: number;
    y: number;
}
