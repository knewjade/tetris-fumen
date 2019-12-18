import { decode as _decode, Page as _Page, Pages as _Pages } from './lib/decoder';
import { encode as _encode, EncodePage as _EncodePage, EncodePages as _EncodePages } from './lib/encoder';

export type Page = _Page;
export type Pages = _Pages;

export type EncodePage = _EncodePage;
export type EncodePages = _EncodePages;

export { Field, Mino } from './lib/field';

export const decoder = {
    decode: (data: string): Pages => {
        return _decode(data);
    },
};

export const encoder = {
    encode: (data: EncodePages): string => {
        return `v115@${_encode(data)}`;
    },
};
