import { decode } from '../decoder';
import { encode } from '../encoder';

describe('encoder', () => {
    describe('encode', () => {
        test('empty', () => {
            const pages = decode('v115@vhAAgH');
            expect(encode(pages)).toEqual('vhAAgH');
        });

        test('last page', () => {
            const pages = decode('v115@vhBAgHAAA');
            expect(encode(pages)).toEqual('vhBAgHAAA');
        });

        test('mirror', () => {
            const pages = decode('v115@RhA8IeB8HeC8GeAQLvhAAAA');
            expect(encode(pages)).toEqual('RhA8IeB8HeC8GeAQLvhAAAA');
        });

        test('send', () => {
            const pages = decode('v115@RhA8IeB8HeC8GeAYJvhAAAA');
            expect(encode(pages)).toEqual('RhA8IeB8HeC8GeAYJvhAAAA');
        });

        test('I-Spawn', () => {
            const pages = decode('v115@vhARQJ');
            expect(encode(pages)).toEqual('vhARQJ');
        });

        test('Comment', () => {
            const pages = decode('v115@vhDAgWFAooMDEPBAAAAAPFA3XaDEEBAAAAAAAAPDAF?rmAA');
            expect(encode(pages)).toEqual('vhDAgWFAooMDEPBAAAAAPFA3XaDEEBAAAAAAAAPDAF?rmAA');
        });

        test('Quiz', () => {
            const pages = decode('v115@vhGSSYXAFLDmClcJSAVDEHBEooRBMoAVBUtfBAXsBA?AANrBmnBAAAAAA');
            expect(encode(pages)).toEqual('vhGSSYXAFLDmClcJSAVDEHBEooRBMoAVBUtfBAXsBA?AANrBmnBAAAAAA');
        });

        test('No lock', () => {
            const pages = decode('v115@vhAAgl');
            expect(encode(pages)).toEqual('vhAAgl');
        });

        test('Lock after quiz', () => {
            const pages = decode('v115@vhCWSYVAFLDmClcJSAVDEHBEooRBKoAVB6AAAAUoBT?pB');
            expect(encode(pages)).toEqual('vhCWSYVAFLDmClcJSAVDEHBEooRBKoAVB6AAAAUoBT?pB');
        });

        test('Long', () => {
            const fumen = 'v115@' +
                'vhHRQYfDFLDmClcJSAVDEHBEooRBaoAVBJt/wCMnbM?CKHExCTHmPCsnltCzHLxCqS9VCKHOMCz3/wC6ybgCpyLM' +
                'Cv?XmPCJt/wCMnzFDM9CMCqOstC6P9wCPnzPCp+TWCp3ntCUHE?xCK3jFDMOltCvOUFDqS9wCTnPFD6u3LCM3TxCJHUPCadNFD' +
                '?M3jPCUujPCvCmFDa3TWCK+lPC0nFgCzCOMCvXstCq+jPCvX?8LCsPNFDTHOMCM3jFD0vKxCzfjWCpn9wCMnntCMergCz/NM?C' +
                'zXMgC0vzBA3mB+tBcqBihBTpBlsBMtBogAtDeilAeBtCeA?tglR4AeAtg0C8AeI8AeE8AtC8Aei0A8BtC8APg0xhA8Atgl?Jeu' +
                'YBvhVRSBKVBFWB/VBTUBTTBeSBSPBMFBpNBNJB//AM7A?TGBFRB3RBaWB5lB+rBipBOmBliBPgh0ywAtDeh0Q4wwBtil?Aeh0R' +
                '4BtilAeh0wwQ4BtC8AeI8AehlSpAtC8AehlwhQpBti?0AehlxhBti0AehlQpwhBtJezGBvhHZBBs8A+AB3/As+AlCB?XABT8A';
            const pages = decode(fumen);
            expect(encode(pages)).toEqual(fumen.substr(5));
        });

        test('ほｗｙISO', () => {
            const fumen = 'v115@' +
                'vhPAgWFBlvs2AXDEfEmJYOBlfnBC11ktCPooRBlvs2?AXDEfETo42Alvs2AVG88A5XHDBQxLSA1jxEB0XHDBwCO' +
                'SAV?yfzBZAAAASvQAAGgQ2Al/32ADFEfE5Ci9Al/X6B4vDfE4Cl?wBlfrHBjDEfET4p9Bl/PVB4pDfEZ0mRBlvs2A2iAAARxQ' +
                'AA?/tBMrBTnBNaQVBlfnBCxpDfEZk0KBlvFLBFIEfETYk2AJYH?DBQOHSAVyn9B5XHDBQ+NSA1d0KBBYHDBQelRA1d0KB4XnQ' +
                'B?kelRA1dkRBxXHDBQxCSA1dEEBUAAAAxQQAAAAPkAlP5ABGt?DfET4p9BlPZOBjDEfETYO6AlfrHBC2DfET4BBC+HBKGB/jB' +
                '?TdBchQRBzHjSA1d8UByX3JBm0nRA1d0KB0XHDBQxLSA1dEE?BDY3JBi0wRA1AlVBBYHDBwvwRA1dkRBCYPNBDKsRA1dEEBD?' +
                'YHDBwvwRA1dkRBiAAAAAAALggWBegHFegWBegHFehWhHFeA?tSaGewwIewhh0AeAPxSwDEeAPDewDdeAAPxAlfnBCRrDfEZ?k' +
                '0KBlvFLBFIEfET4p9BJYHDBQOHSA1m0KBwXHDBQelRAVCS?EBSAAAAvhG2QB/MBMhBbdBaeB5eBAAAXgwDGegHAexDFeQa?hH' +
                'wDGewwEehWQaAewhh0AeAPxSgWQaDeAPDeQadeAAP4Alf?nBCRrDfEZk0KBlvFLBFIEfET4p9BJYHDBQhmOClvs2A0EEf?EZ4' +
                'x2Alvs2AUuDfEWhd9AvhWAAPeAlvs2A0EEfEToABBlvs?2AXoDfET45ABlvs2AWhAAA6jQAAMhQoBlvs2A1sDfETY+2B?aYHD' +
                'BQ+sVClPBLBGCEfEVDRwBlvs2AQoDfE18dBBlvs2A2H?EfE3hUEBlvs2AW0DfEVekRBlvs2AYJEfETofzBlvs2AWxDf?EYYsA' +
                'Blvs2AU0DfET4BLBbUQAA/KQtBUYHDBQOHSA1QvEBC?YPNB4swRA1d0KBCY3JBGqnRA1d0KBzXHDBQ+ESA1dEEBCYH?DBQ0wR' +
                'A1d0KBBYHDBQelRA1dkRB4XHDBQ+pRA1d0KBCYXXB?QIjRA1dEEBDYHDBwPsRA1d0KBWAAAA2iQAAxVBVbeNbtGAl?P5ABGdA' +
                'AANcuGAlfC6A5cAAAFcuGAlP5ABGdAAAFbuIBlfC?6AZoDfETYk2AFbuRAVau6AyXXXBQLjRAVChHBzXHDBQ+ESA?1Qn6AxXH' +
                'DBwPsRA12XOB3XPNBSjHSA1dcHB3nAVBdluGAlP?5ABGdAAA1puMAlP5ABGtDfE18dBBNpQSAlP5ABGtDfE18dB?BlP5ABGdA' +
                'AAAAPAAV0eN0tGAlP5ABGdAAANhuGAlfC6A5cA?AAFhuGAlP5ABGdAAAFguGAlfC6AZYAAAdqQGAlP5ABGdAAA?AAAfgB8EeE' +
                '8EeA8AeD8DeA8BeD8BeC8GeB8HeB8IeA8LeAA?P8AlvNwBUGEfEToABBlvs2A2yDfETYd9Alvs2A2sDfETo/A?Clvs2A4BEfE' +
                'ToHVBlvs2AYDEfET4xRBvhAAAPFBlfzRBU0D?fE112KBSYgSA1dEEBDYHDBQhlRA1d0KBBYHDBQOHSA1d0KB?zXHDBw/NSA1d' +
                'kRBBYHDBwvwRA1dkRBiAAAAjfB8EeE8EeA8?Q4D8DeA8R4D8BeC8Q4zhBeB8RpwwEeB8RpxSwwBeAtg0Aeh?HCeD8AewhCeAA' +
                'D8AexhBeAAAeB8CewhR4QaQ4B8BexwQpA8?AeC8BexwSpB8AtgHAeh0JeAAthAFLDmClcJSAVDEHBEooRB?KoAVBzurgCMuTW' +
                'Cp3/wCvAAAAvhK3+AdDBuIBkMBTHBiNB/?LBZgBilBcsBWHtjBlvs2A1sDfETY+2Blvs2A2yDfEVuWzBl?vs2AYrDfETIkzBl' +
                'fnBC1yDfEmJIVBJ9iSA1dE6BFYHDBQDx?RA1dUzBGYHDBQpHSA1d0KBwXPDCmoeRAVaW3AxXPDCmomAA?egglzhCeilwwFei0' +
                'xwCeAtRpQ4g0wwi0BtRpR4Ceg0BtRpR?4wDBeglBtQpQaR4wDQLBeglwhxSwhQ4JeAAPSAlvs2A0BEf?ETIs9Blvs2A1ZAAAv' +
                'hgAAtAAecfmbfGbfOlu0AKYHDBQDxR?A1dE6B0XHDBQp7bCFXEfET45ABlvs2AXGEfETYNEBlvs2AY?uDfET4REBAAtAAUIfM' +
                'NuGAlP5ABGdAAAMcuGAlfC6A5cAAA?sbuGAlfC6AZYAAAkbuGAlP5ABGdAAAEbuGAlfC6AZYAAA8k?uGAlP5ABGdAAA0kuMAl' +
                'P5ABGtDfE18dBBMpuSAlP5ABGtDf?E18dBBlP5ABGdAAAMpuTAaYHDBQEhRA1w2KB1XHDBQENBAA?AtAAUIfMNuGAlP5ABGdA' +
                'AAMcuGAlfC6A5cAAAsbuGAlfC6A?ZYAAA0MuGAlPR6BlhAAAUNuGAlfC6AZbAAAMSuGAlP5ABGd?AAAMcuGAlfC6A5cAAAsbu' +
                'GAlfC6AZYAAA0MuGAlPR6BlhAA?AUNuGAlfC6AZbAAAUNueAl/m9BFwDfE03UzBlvs2AlDEfET?4d3Blvs2AEjAAAAAtAAUbf' +
                'UbBzXBZgB8IeA8JfAAAvhBdcQ?OBlvs2AUrDfETY+2Blvs2AwpDfETo3ABlvs2A2sDfET4J6A?lvs2A2HEfETIkzBlvs2AUxD' +
                'fETY12Blv12AWDEfEVrozBlP?J6AGyAAAAAPaBlvs2AU0DfEmJYOBlvs2A3vDfETY1ABlvs2?AU0DfETIk9Alvs2AUrDfETY1' +
                '2Blvs2A0EEfETY9KBlvs2A0?yDfETY12Blvs2AUxDfETYVOBlfnBCVbAAA';
            const pages = decode(fumen);
            expect(encode(pages)).toEqual(fumen.substr(5));
        });
    });
});
