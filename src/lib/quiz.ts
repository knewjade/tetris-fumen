import { parsePiece, parsePieceName, Piece } from './defines';

enum Operation {
    Direct = 'direct',
    Swap = 'swap',
    Stock = 'stock',
}

export class Quiz {
    private get next(): string | undefined {
        const index = this.quiz.indexOf(')') + 1;
        const name = this.quiz[index];
        if (name === undefined || name === ';') {
            return '';
        }
        return name;
    }

    static isQuizComment(comment: string) {
        return comment.startsWith('#Q=');
    }

    static create(nexts: string): Quiz;
    static create(hold: string, nexts: string): Quiz;
    static create(first: string, second?: string): Quiz {
        const create = (hold: string | undefined, other: string) => {
            const parse = (s?: string) => s ? s : '';
            return new Quiz(`#Q=[${parse(hold)}](${parse(other[0])})${parse(other.substring(1))}`);
        };

        return second !== undefined ? create(first, second) : create(undefined, first);
    }

    private static trim(quiz: string) {
        return quiz.trim().replace(/\s+/g, '');
    }

    private readonly quiz: string;

    constructor(quiz: string) {
        this.quiz = Quiz.verify(quiz);
    }

    private get least(): string {
        const index = this.quiz.indexOf(')');
        return this.quiz.substr(index + 1);
    }

    private get current(): string {
        const index = this.quiz.indexOf('(') + 1;
        const name = this.quiz[index];
        if (name === ')') {
            return '';
        }
        return name;
    }

    private get hold(): string {
        const index = this.quiz.indexOf('[') + 1;
        const name = this.quiz[index];
        if (name === ']') {
            return '';
        }
        return name;
    }

    private get leastAfterNext2(): string {
        const index = this.quiz.indexOf(')');
        if (this.quiz[index + 1] === ';') {
            return this.quiz.substr(index + 1);
        }
        return this.quiz.substr(index + 2);
    }

    getOperation(used: Piece): Operation {
        const usedName = parsePieceName(used);
        const current = this.current;
        if (usedName === current) {
            return Operation.Direct;
        }

        const hold = this.hold;
        if (usedName === hold) {
            return Operation.Swap;
        }

        // 次のミノを利用できる
        if (hold === '') {
            if (usedName === this.next) {
                return Operation.Stock;
            }
        } else {
            if (current === '' && usedName === this.next) {
                return Operation.Direct;
            }
        }

        throw new Error(`Unexpected hold piece in quiz: ${this.quiz}`);
    }

    private get leastInActiveBag(): string {
        const separateIndex = this.quiz.indexOf(';');
        const quiz = 0 <= separateIndex ? this.quiz.substring(0, separateIndex) : this.quiz;
        const index = quiz.indexOf(')');
        if (quiz[index + 1] === ';') {
            return quiz.substr(index + 1);
        }
        return quiz.substr(index + 2);
    }

    private static verify(quiz: string): string {
        const replaced = this.trim(quiz);

        if (replaced.length === 0 || quiz === '#Q=[]()' || !quiz.startsWith('#Q=')) {
            return quiz;
        }

        if (!replaced.match(/^#Q=\[[TIOSZJL]?]\([TIOSZJL]?\)[TIOSZJL]*;?.*$/i)) {
            throw new Error(`Current piece doesn't exist, however next pieces exist: ${quiz}`);
        }

        return replaced;
    }

    direct(): Quiz {
        if (this.current === '') {
            const least = this.leastAfterNext2;
            return new Quiz(`#Q=[${this.hold}](${least[0]})${least.substr(1)}`);
        }
        return new Quiz(`#Q=[${this.hold}](${this.next})${this.leastAfterNext2}`);
    }

    swap(): Quiz {
        if (this.hold === '') {
            throw new Error(`Cannot find hold piece: ${this.quiz}`);
        }
        const next = this.next;
        return new Quiz(`#Q=[${this.current}](${next})${this.leastAfterNext2}`);
    }

    stock(): Quiz {
        if (this.hold !== '' || this.next === '') {
            throw new Error(`Cannot stock: ${this.quiz}`);
        }

        const least = this.leastAfterNext2;
        const head = least[0] !== undefined ? least[0] : '';

        if (1 < least.length) {
            return new Quiz(`#Q=[${this.current}](${head})${least.substr(1)}`);
        }

        return new Quiz(`#Q=[${this.current}](${head})`);
    }

    operate(operation: Operation): Quiz {
        switch (operation) {
        case Operation.Direct:
            return this.direct();
        case Operation.Swap:
            return this.swap();
        case Operation.Stock:
            return this.stock();
        }
        throw new Error('Unexpected operation');
    }

    format(): Quiz {
        const quiz = this.nextIfEnd();
        if (quiz.quiz === '#Q=[]()') {
            return new Quiz('');
        }

        const current = quiz.current;
        const hold = quiz.hold;

        if (current === '' && hold !== '') {
            return new Quiz(`#Q=[](${hold})${quiz.least}`);
        }

        if (current === '') {
            const least = quiz.least;
            const head = least[0];
            if (head === undefined) {
                return new Quiz('');
            }

            if (head === ';') {
                return new Quiz(least.substr(1));
            }

            return new Quiz(`#Q=[](${head})${least.substr(1)}`);
        }

        return quiz;
    }

    getHoldPiece(): Piece {
        if (!this.canOperate()) {
            return Piece.Empty;
        }

        const name = this.hold;
        if (name === undefined || name === '' || name === ';') {
            return Piece.Empty;
        }
        return parsePiece(name);
    }

    getNextPieces(max?: number): Piece[] {
        if (!this.canOperate()) {
            return max !== undefined ? Array.from({ length: max }).map(() => Piece.Empty) : [];
        }

        let names = (this.current + this.next + this.leastInActiveBag).substr(0, max);
        if (max !== undefined && names.length < max) {
            names += ' '.repeat(max - names.length);
        }

        return names.split('').map((name) => {
            if (name === undefined || name === ' ' || name === ';') {
                return Piece.Empty;
            }
            return parsePiece(name);
        });
    }

    toString(): string {
        return this.quiz;
    }

    canOperate(): boolean {
        let quiz = this.quiz;
        if (quiz.startsWith('#Q=[]();')) {
            quiz = this.quiz.substr(8);
        }
        return quiz.startsWith('#Q=') && quiz !== '#Q=[]()';
    }

    nextIfEnd(): Quiz {
        if (this.quiz.startsWith('#Q=[]();')) {
            return new Quiz(this.quiz.substr(8));
        }
        return this;
    }
}
