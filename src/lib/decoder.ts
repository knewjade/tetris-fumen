import { createInnerField, createNewInnerField, InnerField } from './inner_field';
import { Buffer } from './buffer';
import {
    isMinoPiece,
    Operation,
    parsePiece,
    parsePieceName,
    parseRotation,
    parseRotationName,
    Piece,
    PieceType,
    Rotation,
    RotationType,
} from './defines';
import { createActionDecoder } from './action';
import { createCommentParser } from './comments';
import { Quiz } from './quiz';
import { Field } from './field';

export class Page {
    private _field: InnerField;
    private _operation: Operation | undefined;

    constructor(
        public index: number,
        field: InnerField,
        operation: Operation | undefined,
        public comment: string,
        public flags: { lock: boolean; mirror: boolean; colorize: boolean; rise: boolean; quiz: boolean },
        public refs: { field?: number; comment?: number },
    ) {
        this._field = field.copy();
        this._operation = operation;
    }

    get field(): Field {
        return new Field(this._field.copy());
    }

    set field(field: Field) {
        this._field = createInnerField(field);
    }

    get operation(): {
        type: PieceType,
        rotation: RotationType,
        x: number,
        y: number,
    } | undefined {
        if (this._operation === undefined) {
            return undefined;
        }
        return {
            type: parsePieceName(this._operation.type),
            rotation: parseRotationName(this._operation.rotation),
            x: this._operation.x,
            y: this._operation.y,
        };
    }

    set operation(operation: {
        type: PieceType,
        rotation: RotationType,
        x: number,
        y: number,
    } | undefined) {
        if (operation === undefined) {
            this._operation = undefined;
            return;
        }

        this._operation = {
            type: parsePiece(operation.type),
            rotation: parseRotation(operation.rotation),
            x: operation.x,
            y: operation.y,
        };
    }
}

export type Pages = Page[];

const FieldConstants = {
    GarbageLine: 1,
    Width: 10,
};

export function extract(str: string): { version: '115' | '110', data: string } {
    const format = (version: '115' | '110', data: string) => {
        const trim = data.trim().replace(/[?\s]+/g, '');
        return { version, data: trim };
    };

    let data = str;

    // url parameters
    const paramIndex = data.indexOf('&');
    if (0 <= paramIndex) {
        data = data.substring(0, paramIndex);
    }

    // v115@~
    {
        const match = str.match(/[vmd]115@/);
        if (match !== undefined && match !== null && match.index !== undefined) {
            const sub = data.substr(match.index + 5);
            return format('115', sub);
        }
    }

    // v110@~
    {
        const match = str.match(/[vmd]110@/);
        if (match !== undefined && match !== null && match.index !== undefined) {
            const sub = data.substr(match.index + 5);
            return format('110', sub);
        }
    }

    throw new Error('Unsupported fumen version');
}

export function decode(fumen: string): Pages {
    const { version, data } = extract(fumen);
    switch (version) {
    case '115':
        return innerDecode(data, 23);
    case '110':
        return innerDecode(data, 21);
    }
    throw new Error('Unsupported fumen version');
}

function innerDecode(data: string, fieldTop: number): Pages {
    const fieldMaxHeight = fieldTop + FieldConstants.GarbageLine;
    const numFieldBlocks = fieldMaxHeight * FieldConstants.Width;

    const buffer = new Buffer(data);

    const updateField = (prev: InnerField) => {
        const result = {
            changed: false,
            field: prev,
        };

        let index = 0;
        while (index < numFieldBlocks) {
            const diffBlock = buffer.poll(2);
            const diff = Math.floor(diffBlock / numFieldBlocks);

            const numOfBlocks = diffBlock % numFieldBlocks;

            if (numOfBlocks !== numFieldBlocks - 1) {
                result.changed = true;
            }

            for (let block = 0; block < numOfBlocks + 1; block += 1) {
                const x = index % FieldConstants.Width;
                const y = fieldTop - Math.floor(index / FieldConstants.Width) - 1;
                result.field.addNumber(x, y, diff - 8);
                index += 1;
            }
        }

        return result;
    };

    let pageIndex = 0;
    let prevField = createNewInnerField();

    const store: {
        repeatCount: number,
        refIndex: {
            comment: number,
            field: number,
        };
        quiz?: Quiz,
        lastCommentText: string;
    } = {
        repeatCount: -1,
        refIndex: {
            comment: 0,
            field: 0,
        },
        quiz: undefined,
        lastCommentText: '',
    };

    const pages: Pages = [];
    const actionDecoder = createActionDecoder(FieldConstants.Width, fieldTop, FieldConstants.GarbageLine);
    const commentDecoder = createCommentParser();

    while (!buffer.isEmpty()) {
        // Parse field
        let currentFieldObj;
        if (0 < store.repeatCount) {
            currentFieldObj = {
                field: prevField,
                changed: false,
            };

            store.repeatCount -= 1;
        } else {
            currentFieldObj = updateField(prevField.copy());

            if (!currentFieldObj.changed) {
                store.repeatCount = buffer.poll(1);
            }
        }

        // Parse action
        const actionValue = buffer.poll(3);
        const action = actionDecoder.decode(actionValue);

        // Parse comment
        let comment: { text?: string, ref?: number };
        if (action.comment) {
            // コメントに更新があるとき
            const commentValues: number[] = [];
            const commentLength = buffer.poll(2);

            for (let commentCounter = 0; commentCounter < Math.floor((commentLength + 3) / 4); commentCounter += 1) {
                const commentValue = buffer.poll(5);
                commentValues.push(commentValue);
            }

            let flatten: string = '';
            for (const value of commentValues) {
                flatten += commentDecoder.decode(value);
            }

            const commentText = unescape(flatten.slice(0, commentLength));
            store.lastCommentText = commentText;
            comment = { text: commentText };
            store.refIndex.comment = pageIndex;

            const text = comment.text;
            if (Quiz.isQuizComment(text)) {
                try {
                    store.quiz = new Quiz(text);
                } catch (e) {
                    store.quiz = undefined;
                }
            } else {
                store.quiz = undefined;
            }
        } else if (pageIndex === 0) {
            // コメントに更新がないが、先頭のページのとき
            comment = { text: '' };
        } else {
            // コメントに更新がないとき
            comment = {
                text: store.quiz !== undefined ? store.quiz.format().toString() : undefined,
                ref: store.refIndex.comment,
            };
        }

        // Quiz用の操作を取得し、次ページ開始時点のQuizに1手進める
        let quiz = false;
        if (store.quiz !== undefined) {
            quiz = true;

            if (store.quiz.canOperate() && action.lock) {
                if (isMinoPiece(action.piece.type)) {
                    try {
                        const nextQuiz = store.quiz.nextIfEnd();
                        const operation = nextQuiz.getOperation(action.piece.type);
                        store.quiz = nextQuiz.operate(operation);
                    } catch (e) {
                        // console.error(e.message);

                        // Not operate
                        store.quiz = store.quiz.format();
                    }
                } else {
                    store.quiz = store.quiz.format();
                }
            }
        }

        // データ処理用に加工する
        let currentPiece: {
            type: Piece;
            rotation: Rotation;
            x: number;
            y: number;
        } | undefined;
        if (action.piece.type !== Piece.Empty) {
            currentPiece = action.piece;
        }

        // pageの作成
        let field: { ref?: number };
        if (currentFieldObj.changed || pageIndex === 0) {
            // フィールドに変化があったとき
            // フィールドに変化がなかったが、先頭のページだったとき
            field = {};
            store.refIndex.field = pageIndex;
        } else {
            // フィールドに変化がないとき
            field = { ref: store.refIndex.field };
        }

        pages.push(new Page(
            pageIndex,
            currentFieldObj.field,
            currentPiece,
            comment.text !== undefined ? comment.text : store.lastCommentText,
            {
                quiz,
                lock: action.lock,
                mirror: action.mirror,
                colorize: action.colorize,
                rise: action.rise,
            },
            {
                field: field.ref,
                comment: comment.ref,
            },
        ));

        // callback(
        //     currentFieldObj.field.copy()
        //     , currentPiece
        //     , store.quiz !== undefined ? store.quiz.format().toString() : store.lastCommentText,
        // );

        pageIndex += 1;

        if (action.lock) {
            if (isMinoPiece(action.piece.type)) {
                currentFieldObj.field.fill(action.piece);
            }

            currentFieldObj.field.clearLine();

            if (action.rise) {
                currentFieldObj.field.riseGarbage();
            }

            if (action.mirror) {
                currentFieldObj.field.mirror();
            }
        }

        prevField = currentFieldObj.field;
    }

    return pages;
}
