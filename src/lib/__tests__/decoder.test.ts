import { decode, extract } from '../decoder';
import { createNewInnerField, InnerField, PlayField } from '../inner_field';
import { Field } from '../field';

enum Piece {
    I = 'I',
    L = 'L',
    O = 'O',
    Z = 'Z',
    T = 'T',
    J = 'J',
    S = 'S',
}

export enum Rotation {
    Spawn = 'Spawn',
    Right = 'Right',
    Reverse = 'Reverse',
    Left = 'Left',
}

function to(field: InnerField) {
    return new Field(field);
}

describe('decoder', () => {
    describe('extract', () => {
        test('v115@', () => {
            const data = extract('v115@vhATLJ');
            expect(data).toEqual({ version: '115', data: 'vhATLJ' });
        });

        test('m115@', () => {
            const data = extract('m115@vhAJEJ');
            expect(data).toEqual({ version: '115', data: 'vhAJEJ' });
        });

        test('d115@', () => {
            const data = extract('d115@vhAMLJ');
            expect(data).toEqual({ version: '115', data: 'vhAMLJ' });
        });

        test('fumen.zui.jp', () => {
            const data = extract('http://fumen.zui.jp/?v115@vhANKJ');
            expect(data).toEqual({ version: '115', data: 'vhANKJ' });
        });

        test('harddrop.com', () => {
            expect(extract('https://harddrop.com/fumen/?v115@vhAxPJ')).toEqual({
                version: '115',
                data: 'vhAxPJ',
            });
        });

        test('knewjade.github.io with options', () => {
            const data = extract('https://knewjade.github.io/fumen-for-mobile/?d=v115@vhAmKJ&dummy=3');
            expect(data).toEqual({ version: '115', data: 'vhAmKJ' });
        });

        test('with spaces', () => {
            const data = extract('     v115@ehD 8 MeA gH   ');
            expect(data).toEqual({ version: '115', data: 'ehD8MeAgH' });
        });

        test('includes ?', () => {
            const data = extract('v115@vfA8HeA8HeA8JeA8HeA8JeA8HeA8JeA8HeA8JeA8He?A8JeA8ReAgH');
            expect(data).toEqual({ version: '115', data: 'vfA8HeA8HeA8JeA8HeA8JeA8HeA8JeA8HeA8JeA8HeA8JeA8ReAgH' });
        });

        test('v110@', () => {
            const data = extract('v110@7eAA4G?A8JeA8ReAgH');
            expect(data).toEqual({ version: '110', data: '7eAA4GA8JeA8ReAgH' });
        });

        test('data only', () => {
            expect(() => extract('7eAA4G')).toThrow(Error);
        });
    });

    describe('decode', () => {
        test('empty', async () => {
            const pages = await decode('v115@vhAAgH');
            expect(pages).toHaveLength(1);

            {
                const page = pages[0];
                expect(page.index).toEqual(0);
                expect(page.field).toEqual(to(new InnerField({})));
                expect(page.comment).toEqual('');
                expect(page.operation).toBeUndefined();
                expect(page.flags).toEqual({
                    lock: true,
                    mirror: false,
                    colorize: true,
                    rise: false,
                    quiz: false,
                });
                expect(page.refs).toEqual({});
            }
        });

        test('mirror', async () => {
            const pages = decode('v115@RhA8IeB8HeC8GeAQLvhAAAA');

            expect(pages).toHaveLength(2);

            {
                const page = pages[0];
                expect(page.field).toEqual(to(new InnerField({
                    field: PlayField.load(
                        '',
                        'X_________',
                        'XX________',
                    ),
                    garbage: PlayField.loadMinify('XXX_______'),
                })));
                expect(page.flags).toMatchObject({
                    mirror: true,
                    quiz: false,
                });
            }

            {
                const page = pages[1];
                expect(page.field).toEqual(to(new InnerField({
                    field: PlayField.load(
                        '',
                        '_________X',
                        '________XX',
                    ),
                    garbage: PlayField.loadMinify('XXX_______'),
                })));
                expect(page.flags).toMatchObject({
                    mirror: false,
                    quiz: false,
                });
            }
        });

        test('send', async () => {
            const pages = decode('v115@RhA8IeB8HeC8GeAYJvhAAAA');

            expect(pages).toHaveLength(2);

            {
                const page = pages[0];
                expect(page.field).toEqual(to(new InnerField({
                    field: PlayField.load(
                        '',
                        'X_________',
                        'XX________',
                    ),
                    garbage: PlayField.loadMinify('XXX_______'),
                })));
                expect(page.flags).toMatchObject({
                    rise: true,
                    quiz: false,
                });
            }

            {
                const page = pages[1];
                expect(page.field).toEqual(to(new InnerField({
                    field: PlayField.load(
                        '',
                        'X_________',
                        'XX________',
                        'XXX_______',
                    ),
                    garbage: PlayField.loadMinify('__________'),
                })));
                expect(page.flags).toMatchObject({
                    rise: false,
                    quiz: false,
                });
                expect(page.refs).toEqual({
                    field: 0,
                    comment: 0,
                });
            }
        });

        test('I-Spawn', async () => {
            const pages = decode('v115@vhARQJ');

            expect(pages).toHaveLength(1);

            {
                const page = pages[0];
                expect(page.operation).toEqual({
                    type: Piece.I,
                    rotation: Rotation.Spawn,
                    x: 4,
                    y: 0,
                });
                expect(page.comment).toEqual('');
                expect(page.flags).toMatchObject({
                    lock: true,
                    mirror: false,
                    colorize: true,
                    rise: false,
                    quiz: false,
                });
                expect(page.field).toEqual(to(new InnerField({})));

                const field = page.field;
                field.put(page.operation);
                expect(field).toEqual(to(new InnerField({
                    field: PlayField.load(
                        '',
                        '__________',
                        '___IIII___',
                    ),
                    garbage: PlayField.loadMinify('__________'),
                })));

                expect(page.field).toEqual(to(new InnerField({})));
            }
        });

        test('Comment', async () => {
            const pages = decode('v115@vhDAgWFAooMDEPBAAAAAPFA3XaDEEBAAAAAAAAPDAFrmAA');
            expect(pages).toHaveLength(4);

            {
                const page = pages[0];
                expect(page.comment).toEqual('hello');
                expect(page.refs.comment).toBeUndefined();
            }

            {
                const page = pages[1];
                expect(page.comment).toEqual('world');
                expect(page.refs.comment).toBeUndefined();
            }

            {
                const page = pages[2];
                expect(page.comment).toEqual('world');
                expect(page.refs).toMatchObject({
                    comment: 1,
                });
            }

            {
                const page = pages[3];
                expect(page.comment).toEqual('!');
                expect(page.refs.comment).toBeUndefined();
            }
        });

        test('Quiz', async () => {
            const pages = decode('v115@vhGSSYXAFLDmClcJSAVDEHBEooRBMoAVBUtfBAXsBAAANrBmnBAAAAAA');
            expect(pages).toHaveLength(7);

            {
                const page = pages[0];
                expect(page.comment).toEqual('#Q=[](L)TSJ');
                expect(page.operation).toEqual({
                    type: Piece.L,
                    rotation: Rotation.Spawn,
                    x: 8,
                    y: 0,
                });
                expect(page.flags).toMatchObject({
                    lock: true,
                    quiz: true,
                });
                expect(page.refs.comment).toBeUndefined();
            }

            {
                const page = pages[1];
                expect(page.comment).toEqual('#Q=[](T)SJ');
                expect(page.operation).toEqual({
                    type: Piece.S,
                    rotation: Rotation.Spawn,
                    x: 6,
                    y: 0,
                });
                expect(page.flags).toMatchObject({
                    lock: true,
                    quiz: true,
                });
                expect(page.refs.comment).toEqual(0);
            }

            {
                const page = pages[2];
                expect(page.comment).toEqual('#Q=[T](J)');
                expect(page.operation).toBeUndefined();
                expect(page.flags).toMatchObject({
                    quiz: true,
                });
                expect(page.refs.comment).toEqual(0);
            }

            {
                const page = pages[3];
                expect(page.comment).toEqual('#Q=[T](J)');
                expect(page.operation).toEqual({
                    type: Piece.T,
                    rotation: Rotation.Right,
                    x: 4,
                    y: 1,
                });
                expect(page.flags).toMatchObject({
                    quiz: true,
                });
                expect(page.refs.comment).toEqual(0);
            }

            {
                const page = pages[4];
                expect(page.comment).toEqual('#Q=[](J)');
                expect(page.operation).toEqual({
                    type: Piece.J,
                    rotation: Rotation.Reverse,
                    x: 7,
                    y: 2,
                });
                expect(page.flags).toMatchObject({
                    lock: true,
                    quiz: true,
                });
                expect(page.refs.comment).toEqual(0);
            }

            {
                const page = pages[5];
                expect(page.comment).toEqual('');
                expect(page.operation).toBeUndefined();
                expect(page.flags).toMatchObject({
                    lock: true,
                    quiz: true,
                });
                expect(page.refs.comment).toEqual(0);
            }

            {
                const page = pages[6];
                expect(page.comment).toEqual('');
                expect(page.operation).toBeUndefined();
                expect(page.flags).toMatchObject({
                    lock: true,
                    quiz: true,
                });
                expect(page.refs.comment).toEqual(0);
            }
        });

        test('No lock', async () => {
            const pages = decode('v115@vhAAgl');
            expect(pages).toHaveLength(1);

            {
                const page = pages[0];
                expect(page.flags).toMatchObject({
                    lock: false,
                });
            }
        });

        test('Lock after quiz', async () => {
            const pages = decode('v115@vhCWSYVAFLDmClcJSAVDEHBEooRBKoAVB6AAAAUoBT?pB');
            expect(pages).toHaveLength(3);

            {
                const page = pages[0];
                expect(page.comment).toEqual('#Q=[](J)Z');
                expect(page.operation).toEqual({
                    type: Piece.J,
                    rotation: Rotation.Spawn,
                    x: 8,
                    y: 0,
                });
                expect(page.flags).toMatchObject({
                    lock: true,
                    quiz: true,
                });
                expect(page.refs.comment).toBeUndefined();
            }

            {
                const page = pages[1];
                expect(page.comment).toEqual('#Q=[](Z)');
                expect(page.operation).toEqual({
                    type: Piece.Z,
                    rotation: Rotation.Spawn,
                    x: 8,
                    y: 1,
                });
                expect(page.flags).toMatchObject({
                    lock: true,
                    quiz: true,
                });
                expect(page.refs.comment).toEqual(0);
            }

            {
                const page = pages[2];
                expect(page.comment).toEqual('');
                expect(page.operation).toEqual({
                    type: Piece.O,
                    rotation: Rotation.Spawn,
                    x: 0,
                    y: 0,
                });
                expect(page.flags).toMatchObject({
                    lock: true,
                    quiz: true,
                });
                expect(page.refs.comment).toEqual(0);
            }
        });

        test('No lock with quiz', async () => {
            const pages = decode('v115@vhBSSYaAFLDmClcJSAVDEHBEooRBPoAVBTejWC0/AA?AAAA');
            expect(pages).toHaveLength(2);

            {
                const page = pages[0];
                expect(page.comment).toEqual('#Q=[](O)SIZLTJ');
                expect(page.operation).toEqual({
                    type: Piece.L,
                    rotation: Rotation.Spawn,
                    x: 8,
                    y: 0,
                });
                expect(page.flags).toMatchObject({
                    quiz: true,
                });
                expect(page.refs.comment).toBeUndefined();
            }

            {
                const page = pages[1];
                expect(page.comment).toEqual('#Q=[](O)SIZLTJ');
                expect(page.operation).toBeUndefined();
                expect(page.flags).toMatchObject({
                    quiz: true,
                });
                expect(page.refs.comment).toEqual(0);
            }
        });

        test('long data', async () => {
            const data = 'v115@' +
                'vh/xOY7cFLDmClcJSAVDEHBEooRBJoAVBzuHgCsn9VCq+ytCan/wCauTWCqSFgC0HUWCKtrgCpOmFDzyCMCKdFgCsXmPCJH' +
                'UPCaNmFDPe/VCUNstCPezPCUeLuCKHWWC6/VWCPdFgC6OUPCTejxCpintCvSFgCKNmFDzeFgCsfjWCzXmPCP+lPCJ9KWCaujFDMn/wCp' +
                'irgCKNWxCsnltCvPNFDKHWWCzOstCpfrgC0PltC6ySgC6vLMCs+CMCz3/VCUXNFD0intCvXExCKd9wCvPltC6izPCv+LMCMubgC6/VWC' +
                'UNUFDpvSgCadNPC0yTxCqnFgCMezPC0yytCa+rtCUn3LCsXegCKdNFDMt/wCvXExCJ3jPCz3/wCvSNFDp/9tCvCmPCauTWCvnNPCv+TW' +
                'CT+dgCqXExCs33LCPNmFDM3jPCJ3jFDqCOMCM3jFD0PNFDU9CMCsvaFD0i3LCTubgCqXWWCauytCsuPPCMNegCa+dgCpfjWCTujPCs+' +
                'aFDPNmPCa+DWC6+jPCJ3aPCpX+tCMnzPCUuTWCpfrgC0yTxCzPNFDvybgC6i/wCpvTxCP+TFDMtrgCp/NMCv+jFDqi3LCsXegCTn/VC' +
                'T+lFDMeHgCzujWCpHcgC0/NMCz3/VCvXWWCvvLMCan/wCMujFDzeFgCqyjPCpurgCM9KxC6P9VC0frgCMdFgC0SltC6fjxCMn3LCzSN' +
                'FDzuHgCKX9wCMtLuC6e9VCvf3LCsHUxCvXMgCKd9wCPt/wCpXstCqX8LCv+TWCvnNPC0vCMCs+jFDpuHgCaN8LCa3TxCsvTxCs3HgCp' +
                'SNFDKH+tCp3ntCUHExCadFgCqyjFDvSNPC0XegCJNUPCvuPFDzSltCaHmPCM+VWCPtbMCK9KWC0fbMCUd9VCvfzPCpHLxCMt/VCUdFg' +
                'Can/VCa+9tCzXUPCP+lPCPNWWCaONFDU3jPCsu/VCJ9aFD6vLMCs+ytC0fbMCMn/VCz+aFDpvaFDJNWWCv3/VCUujFDPe/wCM9KxCKd' +
                'NFDsXMgCK+9tCzeFgCsfzPCM9CMC03LuCseFgCq3/wCPuTWCzu/VCaXltCvXExCK+LgCp/9tC6uHgCpHUWCvOstCKebMCTHmPCsXstC' +
                'JnzPC0/dgCpyjFDKuaFDMNmFDUdNPCMXltCsuzPCv+bgCpfjWCM9aFDqeNPCaHExCJ9jFDvCOMCKX9VCKtjxC03HgCT+TFD0intCJHM' +
                'gCKtjxCp/NMCPNUFDJtjWCUnPFD0SNPCP9KWC0HkPCp+aFDMt3LCpXmPCzyKWCKNegCaejxCMuytCK+rtCUnzPCpvKxCMtjxCvi3LCz' +
                'X8LCzXegCqvytCUejWCMNmFDPentCs/NMCa3aFD0P9VCTnLuCqCOMC6OstCJnPFDqybgCU+dgC6vLMCsiLuCKX9wCM3TxCae3LCzXWW' +
                'CKHOMCPtjWCKePFDMNegC0vCMCMtLuCvfjxCM+TPCvubMCzHLxCKd9VCMdNFDq+KWCqHDMCzeNFDvyTxCq3ntCMX9wCvHUWCUe/wCan' +
                '3LCzC8LCvHkPCUnbMC0intCPNmFDp/rtC0P9VCv3bMC0ybgCKNMgCpuPFDM+9tCqHLxCv/rtCae/wCPdNFDMeHgCzijxCpyKxCKtjxC' +
                'a9KWCKuLMCs/dgCaujFDUn/VCaXltCqC+tCK+VWCvnNPCviLuC0X8LCz/dgCqXegCT+TFDTHOMCsf3LCM3jFD0fbMC0ybgCpHcgC0in' +
                'tCqSFgC6eNFDq+ytCsvTWCUergCqXWWCTuCMCaNmPCMn/wCJHUFDz/dgCT+TFDzyCMCqXWxCvSNPCzXWWCKuytCaHExCzfbMCPNExCa' +
                'e3LCaHUPCUdNPCU9aFDsHMMCsuHgCMe/wCa3TxCvHUWCKO9VCK9aFDUHmFDMujPCsvjFDp+aPCM+dgCz3jWCKubgC0O8LCvfLuCqHcg' +
                'CU+7LCzvaFDsuLuCP+VWCqCmPCPujFD6vTWCUuaFDM3jPCp+TWCK+lFDPtjWCpvKxCqOstCpHbFDJtHgC0C8LCa3TxCq+jPC6yCMCJH' +
                'stC0fjWCJ3jPC6eNPCMNegC6/VWCTergCzvKxCMeLuCvizPCp+KWCzfbMCUuTxCqHLWCJ3jFDsuntCpCmPCvX+tCJHUPC6eFgCsvjFD' +
                'v33LCs+LMCv/lFDzyCMCs3ntC0CegCpvjFDJNWWCv3/VCJtPFDvOUPCU9CMC6OUPCaXltCznNPCs+ytCpHLxCqyytCpijxCK9aPC6e9' +
                'VCvPltCsubMCUHUPCa9TWCv3/wCpvaFDp+TWCsXmPCPd9wCKdFgCsXMgCqndBAXsB+tBFiB6eBMrBxpBykBzgBWcBTaBPWBUSBdoBGc' +
                'BlsB8sBZkBPlB6oBuiBShBTVBTLBNbBMXB/RBpUBeUBfNB0IByGBT8A9FBlJB0HBfDB5JByBBpDBT3Am4AJnBTDBKBBMZBXPBFOB+MB' +
                'zGBSUBJnBMXBXeB2VBFdBzdBpZB0VB6bBOXB3MBKLBXHBvh/lBBJPBT3AWOBMDBpFBFYB/MBuYBMKBTJBK8AU9AFIB+IBqJBTFB/8AJ' +
                'nBzWBNRBUNBSUBlGBXKBJnBGcB8YBxWB6UB+MBNNBTQByLB3BBTFBZ3AGDBVTBcJBXEBXDBNCBTFBSAB58AWIBMABf+A6+AM8ANyAzu' +
                'AJ4Au/A9oAZ/AuOBPTBiMBzOBpPBPTBURBvh/MUBTTBWMBKCBZLBFSBMUBTGBuTB3SBK8A9CBFNBSPBJnBXZBTcB8TBpKBUSBGNBzQB' +
                'tJByLB3BBWIBi8AX5AJnBmXBMZBFdBzdB2fBpUBPdBsVBlbBzdBqbBTXBcaBXUBOQBCPBRSBTFBRNB/CBdRB2QBMNBFTBCUBzMBJnBU' +
                'eBibBGZB/kB9aBcQByWBTMBvh/WUBFiBpcBfSBTUBWPBZHBfIBcQBFTBcQB6SBTPB+FBNGB5EBSIBPCBX+AJnBTMBOUBUIBCKBNLBXC' +
                'BSFB9DBJnB2RBTQBMPBTGB0HBvIBuOBJnBaUB1RB/CBWWB9NBpPBMDBa/Az4AMzAOQBp7AFYBT5Aa6AXvA8pAZuAPrAKfAzaAmQBNdB' +
                'qdBJUB8JBTVBvh/+VBNLBpKB8OB/LBvKB6GBlOBWTBTJBSIB9KBMDBzGB/CB2JBZLBXNB+UBMKBTQBKGBlTBURBRSBWKB9YBRdBTPBy' +
                'bB/RBlVBUSB+QBZGBSPBPHBMFBzHBuEBT3AFTBpSBKHBfIBvDBJnBVZBGPB8MByQBFTBTQBSUBUMBpNBzHBOGBHCBMKBy8AT+At4AuJ' +
                'Bvh/JnBzOBvIBsGBOGB6PBtEBvABJnBzSB3LBiGBlRBMSBuRBpPBFYBXNB8YBzQBZLBWMBT8AKCBFTBMZB+NBqHBZ+AX9A3zAZ3Au3A' +
                '8TBtJB6KBT7AJnBTFBPYBcdBCdB2aBeXBSZBFdBXZBTPB0aBpXB9bBzQB5OBOQBdSBUHBvIBiBB59A+FBfABy8AFEBTDBvh/TAB38AM' +
                '5Au4AM3AZoAazAF/ASFBM0AX7AuzAF6Az3Az6A2yAp2A0oAJnBfFBqCBFJBTIBmBB09Ap5A3qAd5AJnB+ZBqTBMPBTLBFHBiBB33AXF' +
                'BWABl9AZyAT7A04ACzAT0AE/ACABX0A+2AJnBNHB/GBFOBzOBWNBSKBUDBJnB/aBMUBSSBJRBzHB9QBZBBvhdzBBFYBGNB8YBvPBSIB' +
                'eCB5JBq9A+8A9FBT5AX7A81AO3A6xAToAJnBNHBUDB34Ay3A+/AT2A3tA9+AM0A6zAJnBM+AofAtHeAtGehlGeQ4wwGeQ4AeQLBeAPB' +
                'eRpRLAewwQpwwAeg0BexhwwAegWCeRaRphWRaAegWglDewSRaBeQpwwBewhDeQpAegWDeRaAegHgWAeQLGeglAeQahHiWAeQawDQLJe' +
                '3zAvhFTABZ3Au3AFJBZiB9dBfgwhh0R4AtFewhAewSBewwCewhAeQLDeRpglAPAewwxhAewhRaRphWRaAegWglAehHRLBPAeBPgWTeU' +
                'UBvhEvPByLBTBBMIBuHB3fRpAeh0AtFeglAegWCeQ4AeRaCeAPCeQ4QaBtwhQpAtAeAtwSCewhAewSBewhAewSAewhAeQLDeRaglAPA' +
                'ewwxhAewhRaRphWRaAegWglAehHRLBPAeBPgWdeFJBvhFiCBT8AW+AvKB5EBTyAZfRpKeg0Jeh0AewhDeglBPgHBeQ4DeCtCeQ4DegW' +
                'EegWQpwwwhCeAtxSAewhAeQLDeRaglAPAewwxhAewhRaRphWRaAegWglAehHRLBPAeBPgWneOzAvhE97AKvAJTBXFB84AdfAtHeAtJe' +
                'gWEeRpg0glDeR4EeglAeQ4AegWDeBtAegHgWCeCPgHBeglDeCtCeglDegWEexSgWgHBPAeQaxDxec/AvhDt+AZ3ATABe9AjfwhKeg0A' +
                'eAtHeAtAewwBeRpglQpAehlwhAewhhlBeCPgHBeglDeCtCeglDegWEexSgWgHBPAeQaxD7e36AvhDv2Au3AJJB6HB5fhlDeQ4Aewhg0' +
                'AtFeQ4DeAtBeQ4BeglwSAPAegWAewhgHAegWxSiWAeRawDQLFfcEBvhET3AN+Av7AKzATtAPfRpglOeQ4DeglwwDeQ4EewwAeAtBegW' +
                'QpAtBeQLAtGeQaBeQpBeglwSAPAegWAewSgHAegWxSiWAeRawDQLPfc1AvhEtuAGxASsAl0AO1AVfh0AeglCewwCeAPglAeRpglAeww' +
                'BeCtgWQpAtwSBehWxhDeQaBeQpBeglwSAPAegWAewSgHAegWxSiWAeRawDQLZfMnAvhFzoAZjAfqAqeAp5AzuAQfglAeRpEewhHeAtB' +
                'eglAtwSCeAtBexhAeQ4Aeh0AegWCegWCeAPgWAeQaxSQLwDAegHiWjfapAvhDZeA/fAcwAtqAnewhAeQ4JeQ4GeglQLBewwGeAPQpAe' +
                'wwAtHeQaBeAtCeAtwSQLAeAPAtBexhAeQ4Aeglg0AegWCegWCeAPgWAeQaxSQLwDAegHiWtfMnAvhC+iAalAlrA6eg0whAeQ4hlHeww' +
                'Deg0BeglQLAegWAeAtwwhWAexhAeQ4AeglwhAegWCegWCeAPgWAeQaxSQLwDAegHiW3fThAvhEpqAmmA6oA3kAxmA+eR4AezhhlQ4Ae' +
                'wDAezwQaBeQLglAexSDeQLwwgWxhglhWQahWwDAeQaAPQLBPBgUXAvhFfYA2eA9lAekATeARgAxeRpg0zhQ4EeRaRpAeQ4AeRpCeAPA' +
                'ewSBeQLBPQ4AewhAewhwSAtQahWwDAeQaAPQLBPLgTPAvhD6iAFlA0kAXmA7eRpDeR4DeBtAeQ4AewDBexSBPAexDYgPaAvh/MgAVnA' +
                '6fAZUAGiAOgATdASaA0PA3XAFhApdAUgAihAzcAmeA3VABgATZAlgATiA+hAPfAZUA8aAlgA/UA+iAqgAyhAUXApOAFfAzcAXbACOAT' +
                'PARXA2kAlfAcfATbAJcA2ZACXAFdAUYARfA/aAGYAleAMgATeAXbAKUAUVAzXAJcA3bA6iAlZAGcAlfAXgAvh/KZAUaAmhAzXARbAyW' +
                'A0PApdAWiATYAvbAlfAxjAWdA3aAUTATZAFhAiZA0gAPcApTAzVAFfAKeA2mAUbAzcAXXApOAmSAFfA0eASlANZARcA/PAzSAmaAzWA' +
                'FfAGdAUaAykASiARlAXhAMdA3XAzeAOeANgA6fAlgAxjASnATeAMdAXhAubAnXATUAZaAtfAvh/agA2jA0fApdA/ZA9gAJdAThA+hAU' +
                'fA2ZARgASaATdAccAFgA3gA+iAyhAyjA3ZAZPAzWA8XAFgAGfA6dATXAMVAFbA5UA3bA0cAvdAOgAafATXA9YAuWAzPAXOAtaAZZAiZ' +
                'AxbAxXAsPA9VATWAUSAOUAfYA6YAdgAGfAieAXhAxZATdAUWAUXA2ZARXASdAvh/FgAXgAXfATeA+iA8hAxfASYATUA2aAFcAXYASgA' +
                'TUA1aAURAmPATOApNAJcA0gA3fAKeAzZAUdAGYA9bAlVAKPAJcAXfAThApdAsZANUAaiAXTAugAzRAdbAufA/cA0ZAKdAcaA6YATUAm' +
                'PApSAFgA3gAPcAFgAxjATiACdAxeA2ZAOcA0PA/QATTAxRAFbAvh/MgASnA0fAXdACYAZZATOAmgAtZA0aAOcA9bATXA/aAabA5OAle' +
                'AugAKeAseAzaAvcAvWATUAUQAJdAiZAGdARbAlbAyZA5VATRAlhA+iAMYA3ZAlhAuhAZZAzZAXbA0SA6VAdhATgAviAGYAKZApOAZKA' +
                'XfA8ZANhAGgAzcACaAMgAahAZWAzcAXXAGfA0eAvh/9fA2eATiARaACdAlgAMhA2eA/UATdA0aAxXASTAlbAUaAfbANXAXQApbAagAW' +
                'iAZZATYA6bAtZAMcA3aAzbANiA2jA/eApdATfA8hAigASmA/eATfAMdAecAOgAthAWkAUfA5YATgAFcAadAvaAfWA0RAZZAzXAyVAlZ' +
                'AGYAJXATVA6bAWYA/eAUYA9eARlAvh/MeAGdAzbAXWAZPA6KAVYAMSAFVAifAviA2kAzaAiVATPAGYAHcAxXA1VApbAUdA2eAZWAFhA' +
                '/eATfAscAqgApdA0ZA/aASYATPAFcAUQAFbAahAOiAGhAZUAfgAzeASnAzcAUgA9bAGYA3VAlUAJcATiAKeAUfAfgAmVApbAkUAZcAu' +
                'hA9iA3bAyeAKUAzPAvh/uaAlhATiA0bAvYA8VAlcAyeA5cAzbAvdAuZAZUApOAXXAlaAzXAsbAGaAyUARSATKAFWAagA+iA3hAsgAzX' +
                'AKZAGTARaA3QAsPAlWAZPAXXAifAMgATdAuZA+XATTAlaAtfAXaA0gAihApYA3bAtZAUQAzXAiSAZZAHgAieAWlA+iAxeA8hAzgATUA' +
                'UXAFbAvh/OaARcASiA3UATTAUSAFWAOUACYAVaAZbAXcAUYAKUAvWAlaAzZAGdA5aA2ZASdAvbA0PAzSAJcA9dAzUAsgAOUAlfA/hA6' +
                'fAZbAMdA/XAKPATQApbAFiACfATgA+iA3hA1jA0fAZUAOhAHdARaAUSA9gAWlATiA6eAlcATPAvYAMbAZaA6fApYAuhAMgAKUAvh/PT' +
                'A2aAzQAtPAFXAGWATTACOAZKAfQAPSA0QATOAmQAlKASSAJcAylAsbATZAWiAMWAlfAPfAUiAZUAzPAGdAPXAlaASiAZWAycAvTA5aA' +
                '2jA0ZAThACcAGYAcSAzPAlaAZUAvgAlbA5aAzZAUWAaiAvYA2UA8NAFXA/UAaVAzWAeWApdA9dATcAvbAyZA1XAvh/UOA+PAlRA5aAT' +
                'fAOeAUgAviAiaApTAKUAzPARWAsXA2PAFhAXhAzfA0cARaACRA+YAtgAXdAXWAzeAMVAZZAuUAiKAFcAXiANhAugAagAzhAxZAUWAUX' +
                'AdYAyUA5dATeAviA+hA3gAyZApTAlfAWlAMbATZAJYAFhA3fA2eAahA0UAzVA9YAzRAmPAXOA0LAvh/pcA2lAKeAzZAvdApWA8aAlhA' +
                'pYAuhAzSA3aAKZA6UANVAURAJcASiATZA9gA3aAmUA0QAUXAFYATUASdAXTA+WAxPAJcAykA3hA2jAzgA0fAlZAfbA0cA9WATPAmXAi' +
                'QApdATZApdAXbAeiAcaAdhA3WA2ZARVAlcACiASnATeARhA2lATfASnAMdAXhAMgAvh/dfAiWApaA3UA8XANPAmWAGXAUVAzQA9YAXY' +
                'AZZAzbAseACiAXgATYAxaAleAucAahAGTAKZAzZAPXAJKAtfA+aAUXAUYAtZAZbAvdATXAiaApbA0aAvdAleAThAGdA3eAiZAWgAigA' +
                'xjAUgATiAdhAUWA5cA+dAzWAfYAKeAFfA/eAebAKPApTAdYAzWAOfAvh/UaA0aAyVA3cAlbAxcATTAsWA/ZA5XAVfAueATdAOeAqfAp' +
                'OAzSAKPAcVAvgAdhA2cAzZAngAxZAFgA0hAfgAyeATUAKdApTAuXAsbAFVAFbAiZAzXA2UA/KAsgApTAiXAuWAFgAzXA/fA0PAzRA6V' +
                'AZbAXaAWnAUdAJXAFgATbACaA9dA8XA3RAZZA2eAsfAvh/pYAzWAucACfAXWA1ZAmcANfAxhATYA3bA8aAsZAvXAZZA6gASiA9eA2cA' +
                'SYAZPATRAlfA+fAzeAXiA0ZATYAMbA/aAKPAFhAuhApTA6UAeTAXbATVAURAJcAVmATZANfACiAxZAEgAvgASiA2ZAGVAMYAxWAXTAF' +
                'cA2eACYATbA9aATRA/UAJcAcfASnAmgAvh/0cAxaATYAleA3cACfA9YATbAWaAMXA3RAZZAmeAMdA3XANbAzRAyZApJA3PA5aAzhA0f' +
                'AicA+bAtZA0VAXTAZZATZASdAmfAFhASlAmeAzaAZPAXdAFcAcaAuZAMbA/PAKdAFhAThApdAUcAKfAfdATTAZKAFgAXgACfAWfAmaA' +
                'RVAMhATdAtgAUhASnAXdAvh/xjATZA+aAmUANgASdAFhAXhAMdAZUAzZA8XA3bA5VAzUAOgAqXA6dAxZANhATTA3bAEgA2jAleA1kA3' +
                'cAkgAGiAzgARkAxcAieATZA/fAtbAGVASdAyXAcPAZbAviAThA2kA0aApTANZA6gA3hA2lAzcA0eAmZA1UASYAXOA5aAlgATbAcUAOc' +
                'ATaA3bASiAvh/ZUAUaAfbAzUAFdAUWA+TAxQAFXATUAycAShAmgAUfAxmA3gAZZAtZA/cA+dAlfA0fAyZATPApTAvgAzWA8VAaiAthA' +
                '3fAOiAChARaA2eAFhATiA1jA0fAXVATYApcAOZAkgAVgAahATeASnAOhAHdA0fAxXATUAUbAOfA6gApdAXfANeAJdAegAlVAkUAzgAv' +
                'h/KKAzWA5cAPfASnAmUAXhAMdAlXAlbACWAzfA2jA/ZA0fApdAvgAthAJcAaiAUfAGgASnAzgAXdAWcAxXA0fAdbATeA2eAFfASnAXh' +
                'AxjAzZAMdA6aAOZA8XATbAdcApTAXVAsXAZPA3NACQAFbATbAOcAXaAUYATUAFgAGdAigATaA3ZAxcAiUAxXAlgA0aAvhwvXATUA+YA' +
                'OTAlbA0fAxZAabA2UATOAvXApbA6hA1kAseAZUATYACVAlgAegA3cAvYAMXASaATPAGOAURAZLAubATZA8aAlgARmAVhAfdACbAyeAs' +
                'UAOUAVWAvYAzNAFXAGVAhQAJNADKASMAAAA';

            const pages = decode(data);

            const quiz = '#Q=[](I)STJOLZILJTOSZOJTZISLJLIOTZSLJSZOITTZSLOIJSIOLZTJIOLJZSTZOIJLTSLSOIZJTIZSJOTLZ' +
                'JTLOSIOZTLJSIZTILJSOLIOJSTZSTIOLJZLSZTJOITJISOLZISZLOJTILZOJSTTLZISOJIZJOTLSTLSIJZOTJISZLOO' +
                'ZJSILTOISZJLTOIZTLJSOZLTJSITOJISZLZJOTSILISOZJTLTSLZIJOOZSIJTLSTJZIOLIZJTLOSZILSTOJILZTOJSIZ' +
                'LSJTOZLTIOSJSZJTOLIZIJTSOLTJZISLOZIJOTSLSITOJZLTLZJIOSTZLOSJIOSZJLTILOSZTJIZTSOILJOZTLJISISO' +
                'JZTLZIOSLTJJLSTOZITOIJZLSISJLTOZOSTJZILLZTSJIOOJIZTSLOZJTISLIJZOTLSTSJIZOLSOZLJTIJSTOILZLSZO' +
                'IJTIOTSZJLJILZTOSOJLSITZLIJOSTZLIZSOTJTISZJLOZTLOJSIZOJTLISZSTIOJLSJITZOLSOTZJILTJZOLSIOTLIS' +
                'ZJZTLOJISLIZSTJOJOITLSZSZTILOJJILZSTOZLOJSITOSJTIZLSJZLIOTSLOZIJTJOILTSZITJOZSLIZOSTLJSTLZJO' +
                'ILIZJOTSIZJSTOLTZSIOJLSZOLIJTZTOISLJOTJZSLISZOTJLITLOSZIJSOLTJZITSILOJZJIZOTLSJLTSIOZOJLZITS' +
                'SZLJOITJOSTLZIIZTOSJLTJLISOZZJSILTOSTJZILOJLSTOZIJOZISTLOZJLTISZOIJTLSOTJSIZLZLOJITSSTIOLJZJ' +
                'LSOITZZSLTIOJZJTOISLSTJLZOISOZLTJILOIJTSZTJOIZSLOTLSJIZISOTJLZLSIOZJTJTOILSZJIOZLSTZTSIJLOIS' +
                'LTZJOTSOIJZLLSOZJTIJZOLTISSZOLTIJOILJSZTTZJOSILZTLJSIOLOJSZTIJTIOSLZISZLTOJZTLIJOSOLTZSJITOZ' +
                'LSJIIZTJSLOLJSTOZIZTLIOSJILSTOZJIJOTLSZTOLJISZLISZTOJJOSTIZLLSTZOIJSLJTIZOOZTJILSOZSJLTIZTLS' +
                'IOJZJLSOTITOZJSILLZSJOITLOSTZIJISZTLJOTIOSZLJIJZLSTOTJOILSZSOJZTLILJOTZISZOTJSILLSIZJTOLJZOI' +
                'STIZOLSTJZJSLOITOZSLTIJTZOJISLLIOZSJTOZITLJSOSTZIJLSTJILOZZITLSOJSLOITJZLITSJZOTOJLSZIJTOSIZ' +
                'LIJOSLZTILOTJSZTZSOLJISILJTOZISZTOJLZOISJLTSJITLOZIJOLZSTZLISJTOJZTOSILZSOTILJJILOSZTJZITLSO' +
                'IZSOTLJSJLIOZTIZJTOSLJSLTIZOJZTLSIOIZSTJLOJTIOLZSJTOSILZSLOIJZTTOLIJSZTLJIOSZOLTSJZIOSLTZIJI' +
                'ZOLJTSIJTSOZLZSILTJOLIJTZOSTOZSLJIILJSOZTOTZLISJLJSZITOJLITOSZZLJISOTTLIOJZSJZSOTILISJOZLTZS' +
                'OITLJLTJOISZZJSLTIOZLOSJITSLJITZOSZLIJOTJTLSIZOZISJOTLLIZOSTJTSJZLOIIOLSTJZLIOSJZTIJLSTOZJTL' +
                'SIZOSJOTLIZSOLZJITOLSJZITISTJZOLIOSZLTJSILTJOZTSIOLJZTIOLJSZOZJILTSIOJTZSLOILZJSTLTOIJSZISTL' +
                'OZJLISJZOTLJTSOIZTLJZOISSZIJLTOSIZOTJLOSILZTJSOJZTILOJISLTZITOLJZSSLOZJTIJOZITSLLZTJOSITJSIO' +
                'LZLOJZI';

            expect(pages).toHaveLength(1826);

            {
                const page = pages[0];
                expect(page.comment).toEqual(quiz);
                expect(page.operation).toEqual({
                    type: Piece.I,
                    rotation: Rotation.Spawn,
                    x: 1,
                    y: 0,
                });
                expect(page.flags).toMatchObject({
                    quiz: true,
                });
                expect(page.field).toEqual(to(createNewInnerField()));
            }

            {
                const page = pages[478];
                expect(page.operation).toEqual({
                    type: Piece.S,
                    rotation: Rotation.Spawn,
                    x: 3,
                    y: 11,
                });
                expect(page.flags).toMatchObject({
                    quiz: true,
                });
                expect(page.field).toEqual(to(new InnerField({
                    field: PlayField.load(
                        '_____Z____',
                        '____ZZ____',
                        '__LLZZ____',
                        '_SSLZZ____',
                        'SSLLZ___OO',
                        'LLLSST_JOO',
                        'OOSSTT_JLL',
                        'JJTTZZ_ZZL',
                        'JJTLOO_ZSS',
                        'JJJLOO_SST',
                        'JJJLLL_ITT',
                        'IJJLLL_IST',
                        '__________',
                    ),
                    garbage: PlayField.loadMinify('__________'),
                })));
                expect(page.refs.comment).toEqual(0);
            }

            {
                const page = pages[1824];
                expect(page.operation).toEqual({
                    type: Piece.L,
                    rotation: Rotation.Spawn,
                    x: 4,
                    y: 20,
                });
                expect(page.flags).toMatchObject({
                    quiz: true,
                });
                expect(page.refs).toEqual({
                    field: 560,
                    comment: 0,
                });
            }

            {
                const page = pages[1825];
                expect(page.operation).toBeUndefined();
                expect(page.flags).toMatchObject({
                    quiz: true,
                });
                expect(page.refs).toEqual({
                    field: 560,
                    comment: 0,
                });
            }
        });

        test('illegal short fumen', async () => {
            // right: vhAyOJ
            expect(() => decode('v115@vhAyO')).toThrow('Unexpected fumen');
        });
    });
});
