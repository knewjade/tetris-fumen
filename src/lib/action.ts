import { isMinoPiece, InnerOperation, Piece, Rotation } from './defines';

interface Action {
    piece: InnerOperation;
    rise: boolean;
    mirror: boolean;
    colorize: boolean;
    comment: boolean;
    lock: boolean;
}

function decodeBool(n: number) {
    return n !== 0;
}

export const createActionDecoder = (width: number, fieldTop: number, garbageLine: number) => {
    const fieldMaxHeight = fieldTop + garbageLine;
    const numFieldBlocks = fieldMaxHeight * width;

    function decodePiece(n: number) {
        switch (n) {
        case 0:
            return Piece.Empty;
        case 1:
            return Piece.I;
        case 2:
            return Piece.L;
        case 3:
            return Piece.O;
        case 4:
            return Piece.Z;
        case 5:
            return Piece.T;
        case 6:
            return Piece.J;
        case 7:
            return Piece.S;
        case 8:
            return Piece.Gray;
        }
        throw new Error('Unexpected piece');
    }

    function decodeRotation(n: number) {
        switch (n) {
        case 0:
            return Rotation.Reverse;
        case 1:
            return Rotation.Right;
        case 2:
            return Rotation.Spawn;
        case 3:
            return Rotation.Left;
        }
        throw new Error('Unexpected rotation');
    }

    function decodeCoordinate(n: number, piece: Piece, rotation: Rotation) {
        let x = n % width;
        const originY = Math.floor(n / 10);
        let y = fieldTop - originY - 1;

        if (piece === Piece.O && rotation === Rotation.Left) {
            x += 1;
            y -= 1;
        } else if (piece === Piece.O && rotation === Rotation.Reverse) {
            x += 1;
        } else if (piece === Piece.O && rotation === Rotation.Spawn) {
            y -= 1;
        } else if (piece === Piece.I && rotation === Rotation.Reverse) {
            x += 1;
        } else if (piece === Piece.I && rotation === Rotation.Left) {
            y -= 1;
        } else if (piece === Piece.S && rotation === Rotation.Spawn) {
            y -= 1;
        } else if (piece === Piece.S && rotation === Rotation.Right) {
            x -= 1;
        } else if (piece === Piece.Z && rotation === Rotation.Spawn) {
            y -= 1;
        } else if (piece === Piece.Z && rotation === Rotation.Left) {
            x += 1;
        }

        return { x, y };
    }

    return {
        decode: (v: number): Action => {
            let value = v;
            const type = decodePiece(value % 8);
            value = Math.floor(value / 8);
            const rotation = decodeRotation(value % 4);
            value = Math.floor(value / 4);
            const coordinate = decodeCoordinate(value % numFieldBlocks, type, rotation);
            value = Math.floor(value / numFieldBlocks);
            const isBlockUp = decodeBool(value % 2);
            value = Math.floor(value / 2);
            const isMirror = decodeBool(value % 2);
            value = Math.floor(value / 2);
            const isColor = decodeBool(value % 2);
            value = Math.floor(value / 2);
            const isComment = decodeBool(value % 2);
            value = Math.floor(value / 2);
            const isLock = !decodeBool(value % 2);

            return {
                rise: isBlockUp,
                mirror: isMirror,
                colorize: isColor,
                comment: isComment,
                lock: isLock,
                piece: {
                    ...coordinate,
                    type,
                    rotation,
                },
            };
        },
    };
};

function encodeBool(flag: boolean): number {
    return flag ? 1 : 0;
}

export const createActionEncoder = (width: number, fieldTop: number, garbageLine: number) => {
    const fieldMaxHeight = fieldTop + garbageLine;
    const numFieldBlocks = fieldMaxHeight * width;

    function encodePosition(
        operation: { x: number, y: number, type: Piece, rotation: Rotation },
    ): number {
        const { type, rotation } = operation;
        let x = operation.x;
        let y = operation.y;

        if (!isMinoPiece(type)) {
            x = 0;
            y = 22;
        } else if (type === Piece.O && rotation === Rotation.Left) {
            x -= 1;
            y += 1;
        } else if (type === Piece.O && rotation === Rotation.Reverse) {
            x -= 1;
        } else if (type === Piece.O && rotation === Rotation.Spawn) {
            y += 1;
        } else if (type === Piece.I && rotation === Rotation.Reverse) {
            x -= 1;
        } else if (type === Piece.I && rotation === Rotation.Left) {
            y += 1;
        } else if (type === Piece.S && rotation === Rotation.Spawn) {
            y += 1;
        } else if (type === Piece.S && rotation === Rotation.Right) {
            x += 1;
        } else if (type === Piece.Z && rotation === Rotation.Spawn) {
            y += 1;
        } else if (type === Piece.Z && rotation === Rotation.Left) {
            x -= 1;
        }

        return (fieldTop - y - 1) * width + x;
    }

    function encodeRotation({ type, rotation }: { type: Piece, rotation: Rotation }): number {
        if (!isMinoPiece(type)) {
            return 0;
        }

        switch (rotation) {
        case Rotation.Reverse:
            return 0;
        case Rotation.Right:
            return 1;
        case Rotation.Spawn:
            return 2;
        case Rotation.Left:
            return 3;
        }

        throw new Error('No reachable');
    }

    return {
        encode: (action: Action): number => {
            const { lock, comment, colorize, mirror, rise, piece } = action;

            let value = encodeBool(!lock);
            value *= 2;
            value += encodeBool(comment);
            value *= 2;
            value += (encodeBool(colorize));
            value *= 2;
            value += encodeBool(mirror);
            value *= 2;
            value += encodeBool(rise);
            value *= numFieldBlocks;
            value += encodePosition(piece);
            value *= 4;
            value += encodeRotation(piece);
            value *= 8;
            value += piece.type;

            return value;
        },
    };
};
