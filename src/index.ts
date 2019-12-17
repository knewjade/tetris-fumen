import { decode as _decode, Pages as _Pages } from './lib/decoder';
import { encode as _encode, EncodePage as _EncodePage } from './lib/encoder';

export type Pages = _Pages;
export type EncodePage = _EncodePage;

export const decoder = {
    decode: (data: string): Pages => {
        return _decode(data);
    },
};

export const encoder = {
    encode: (data: EncodePage[]): string => {
        return `v115@${_encode(data)}`;
    },
};
