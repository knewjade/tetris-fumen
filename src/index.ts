import { decode as _decode, Pages as _Pages } from './lib/decoder';

export type Pages = _Pages;

export const decoder = {
    decode: (data: string): Promise<Pages> => {
        return _decode(data);
    },
};
