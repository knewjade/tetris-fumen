const COMMENT_TABLE =
    ' !"#$%&\'()*+,-./0123456789:;<=>?@ABCDEFGHIJKLMNOPQRSTUVWXYZ[\\]^_`abcdefghijklmnopqrstuvwxyz{|}~';
const MAX_COMMENT_CHAR_VALUE = COMMENT_TABLE.length + 1;

export const createCommentParser = () => {
    return {
        decode: (v: number): string => {
            let str: string = '';
            let value = v;
            for (let count = 0; count < 4; count += 1) {
                const index = value % MAX_COMMENT_CHAR_VALUE;
                str += COMMENT_TABLE[index];
                value = Math.floor(value / MAX_COMMENT_CHAR_VALUE);
            }
            return str;
        },
        encode: (ch: string, count: number): number => {
            return COMMENT_TABLE.indexOf(ch) * Math.pow(MAX_COMMENT_CHAR_VALUE, count);
        },
    };
};
