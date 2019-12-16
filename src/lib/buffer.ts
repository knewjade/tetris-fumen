const ENCODE_TABLE = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
const ENCODE_TABLE_LENGTH = ENCODE_TABLE.length;

export class Buffer {
    private readonly values: number[];

    constructor(data: string = '') {
        this.values = data.split('').map(decodeToValue);
    }

    poll(max: number): number {
        let value = 0;
        for (let count = 0; count < max; count += 1) {
            const v = this.values.shift();
            if (v === undefined) {
                throw new Error('Unexpected fumen value');
            }
            value += v * Math.pow(ENCODE_TABLE_LENGTH, count);
        }
        return value;
    }

    push(value: number, splitCount: number = 1): void {
        let current = value;
        for (let count = 0; count < splitCount; count += 1) {
            this.values.push(current % ENCODE_TABLE_LENGTH);
            current = Math.floor(current / ENCODE_TABLE_LENGTH);
        }
    }

    merge(postBuffer: Buffer): void {
        for (const value of postBuffer.values) {
            this.values.push(value);
        }
    }

    isEmpty(): boolean {
        return this.values.length === 0;
    }

    get length(): number {
        return this.values.length;
    }

    get(index: number): number {
        return this.values[index];
    }

    set(index: number, value: number): void {
        this.values[index] = value;
    }

    toString(): string {
        return this.values.map(encodeFromValue).join('');
    }
}

function decodeToValue(v: string): number {
    return ENCODE_TABLE.indexOf(v);
}

function encodeFromValue(index: number): string {
    return ENCODE_TABLE[index];
}
