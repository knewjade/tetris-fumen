import { createInnerField, createNewInnerField, InnerField } from './inner_field';
import { Buffer } from './buffer';
import { Field, Operation } from './field';
import { isMinoPiece, parsePiece, parseRotation, Piece, Rotation } from './defines';
import { createActionEncoder } from './action';
import { createCommentParser } from './comments';
import { Quiz } from './quiz';

export interface EncodePage {
    comment?: string;
    operation?: Operation;
    field?: Field;
    flags?: {
        lock?: boolean;
        mirror?: boolean;
        colorize?: boolean;
        rise?: boolean;
    };
}

export type EncodePages = EncodePage[];

const FieldConstants = {
    GarbageLine: 1,
    Width: 10,
};

export function encode(pages: EncodePage[]): string {
    const updateField = (prev: InnerField, current: InnerField) => {
        const { changed, values } = encodeField(prev, current);

        if (changed) {
            // フィールドを記録して、リピートを終了する
            buffer.merge(values);
            lastRepeatIndex = -1;
        } else if (lastRepeatIndex < 0 || buffer.get(lastRepeatIndex) === Buffer.tableLength - 1) {
            // フィールドを記録して、リピートを開始する
            buffer.merge(values);
            buffer.push(0);
            lastRepeatIndex = buffer.length - 1;
        } else if (buffer.get(lastRepeatIndex) < (Buffer.tableLength - 1)) {
            // フィールドは記録せず、リピートを進める
            const currentRepeatValue = buffer.get(lastRepeatIndex);
            buffer.set(lastRepeatIndex, currentRepeatValue + 1);
        }
    };

    let lastRepeatIndex = -1;
    const buffer = new Buffer();
    let prevField = createNewInnerField();

    const actionEncoder = createActionEncoder(FieldConstants.Width, 23, FieldConstants.GarbageLine);
    const commentParser = createCommentParser();

    let prevComment: string | undefined = '';
    let prevQuiz: Quiz | undefined = undefined;

    const innerEncode = (index: number) => {
        const currentPage = pages[index];
        currentPage.flags = currentPage.flags ? currentPage.flags : {};

        const field: Field = currentPage.field;

        const currentField: InnerField = field !== undefined ? createInnerField(field) : prevField.copy();

        // フィールドの更新
        updateField(prevField, currentField);

        // アクションの更新
        const currentComment = currentPage.comment !== undefined
            ? ((index !== 0 || currentPage.comment !== '') ? currentPage.comment : undefined)
            : undefined;
        const piece = currentPage.operation !== undefined ? {
            type: parsePiece(currentPage.operation.type),
            rotation: parseRotation(currentPage.operation.rotation),
            x: currentPage.operation.x,
            y: currentPage.operation.y,
        } : {
            type: Piece.Empty,
            rotation: Rotation.Reverse,
            x: 0,
            y: 22,
        };

        let nextComment;
        if (currentComment !== undefined) {
            if (currentComment.startsWith('#Q=')) {
                // Quiz on
                if (prevQuiz !== undefined && prevQuiz.format().toString() === currentComment) {
                    nextComment = undefined;
                } else {
                    nextComment = currentComment;
                    prevComment = nextComment;
                    prevQuiz = new Quiz(currentComment);
                }
            } else {
                // Quiz off
                if (prevQuiz !== undefined && prevQuiz.format().toString() === currentComment) {
                    nextComment = undefined;
                    prevComment = currentComment;
                    prevQuiz = undefined;
                } else {
                    nextComment = prevComment !== currentComment ? currentComment : undefined;
                    prevComment = prevComment !== currentComment ? nextComment : prevComment;
                    prevQuiz = undefined;
                }
            }
        } else {
            nextComment = undefined;
            prevQuiz = undefined;
        }

        if (prevQuiz !== undefined && prevQuiz.canOperate() && currentPage.flags.lock) {
            if (isMinoPiece(piece.type)) {
                try {
                    const nextQuiz = prevQuiz.nextIfEnd();
                    const operation = nextQuiz.getOperation(piece.type);
                    prevQuiz = nextQuiz.operate(operation);
                } catch (e) {
                    // console.error(e.message);

                    // Not operate
                    prevQuiz = prevQuiz.format();
                }
            } else {
                prevQuiz = prevQuiz.format();
            }
        }

        const currentFlags = {
            lock: true,
            colorize: index === 0,
            ...currentPage.flags,
        };

        const action = {
            piece,
            rise: !!currentFlags.rise,
            mirror: !!currentFlags.mirror,
            colorize: !!currentFlags.colorize,
            lock: !!currentFlags.lock,
            comment: nextComment !== undefined,
        };

        const actionNumber = actionEncoder.encode(action);
        buffer.push(actionNumber, 3);

        // コメントの更新
        if (nextComment !== undefined) {
            const comment = escape(currentPage.comment);
            const commentLength = Math.min(comment.length, 4095);

            buffer.push(commentLength, 2);

            // コメントを符号化
            for (let index = 0; index < commentLength; index += 4) {
                let value = 0;
                for (let count = 0; count < 4; count += 1) {
                    const newIndex = index + count;
                    if (commentLength <= newIndex) {
                        break;
                    }
                    const ch = comment.charAt(newIndex);
                    value += commentParser.encode(ch, count);
                }

                buffer.push(value, 5);
            }
        } else if (currentPage.comment === undefined) {
            prevComment = undefined;
        }

        // 地形の更新
        if (action.lock) {
            if (isMinoPiece(action.piece.type)) {
                currentField.fill(action.piece);
            }

            currentField.clearLine();

            if (action.rise) {
                currentField.riseGarbage();
            }

            if (action.mirror) {
                currentField.mirror();
            }
        }

        prevField = currentField;
    };

    for (let index = 0; index < pages.length; index += 1) {
        innerEncode(index);
    }

    // テト譜が短いときはそのまま出力する
    // 47文字ごとに?が挿入されるが、実際は先頭にv115@が入るため、最初の?は42文字後になる
    const data = buffer.toString();
    if (data.length < 41) {
        return data;
    }

    // ?を挿入する
    const head = [data.substr(0, 42)];
    const tails = data.substring(42);
    const split = tails.match(/[\S]{1,47}/g) || [];
    return head.concat(split).join('?');
}

// フィールドをエンコードする
// 前のフィールドがないときは空のフィールドを指定する
// 入力フィールドの高さは23, 幅は10
function encodeField(prev: InnerField, current: InnerField) {
    const FIELD_TOP = 23;
    const FIELD_MAX_HEIGHT = FIELD_TOP + 1;
    const FIELD_BLOCKS = FIELD_MAX_HEIGHT * FieldConstants.Width;

    const buffer = new Buffer();

    // 前のフィールドとの差を計算: 0〜16
    const getDiff = (xIndex: number, yIndex: number) => {
        const y: number = FIELD_TOP - yIndex - 1;
        return current.getNumberAt(xIndex, y) - prev.getNumberAt(xIndex, y) + 8;
    };

    // データの記録
    const recordBlockCounts = (diff: number, counter: number) => {
        const value: number = diff * FIELD_BLOCKS + counter;
        buffer.push(value, 2);
    };

    // フィールド値から連続したブロック数に変換
    let changed = false;
    let prev_diff = getDiff(0, 0);
    let counter = -1;
    for (let yIndex = 0; yIndex < FIELD_MAX_HEIGHT; yIndex += 1) {
        for (let xIndex = 0; xIndex < FieldConstants.Width; xIndex += 1) {
            const diff = getDiff(xIndex, yIndex);
            if (diff !== prev_diff) {
                recordBlockCounts(prev_diff, counter);
                counter = 0;
                prev_diff = diff;
                changed = true;
            } else {
                counter += 1;
            }
        }
    }

    // 最後の連続ブロックを処理
    recordBlockCounts(prev_diff, counter);

    return {
        changed,
        values: buffer,
    };
}
