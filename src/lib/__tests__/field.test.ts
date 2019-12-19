import { Field } from '../field';

describe('field', () => {
    test('canFill()', () => {
        const field = Field.create(
            'IIII______',
        );
        expect(field.canFill({ type: 'T', rotation: 'spawn', x: 5, y: 0 })).toEqual(true);
        expect(field.canFill({ type: 'T', rotation: 'spawn', x: 5, y: 1 })).toEqual(true);
        expect(field.canFill({ type: 'T', rotation: 'spawn', x: 4, y: 1 })).toEqual(true);
    });

    test('fill()', () => {
        {
            const field = Field.create('' +
                'IIII______',
            );
            expect(field.fill({ type: 'T', rotation: 'spawn', x: 5, y: 0 })).toEqual(
                { type: 'T', rotation: 'spawn', x: 5, y: 0 },
            );
            expect(field.str({ separator: '', garbage: false })).toEqual(
                '_____T____' +
                'IIIITTT___',
            );
        }

        {
            const field = Field.create('' +
                'IIII______',
            );
            expect(field.fill({ type: 'T', rotation: 'spawn', x: 5, y: 1 })).toEqual(
                { type: 'T', rotation: 'spawn', x: 5, y: 1 },
            );
            expect(field.str({ separator: '', garbage: false })).toEqual(
                '_____T____' +
                '____TTT___' +
                'IIII______',
            );
        }

        {
            const field = Field.create('' +
                'IIII______',
            );
            expect(field.fill({ type: 'T', rotation: 'spawn', x: 4, y: 1 })).toEqual(
                { type: 'T', rotation: 'spawn', x: 4, y: 1 },
            );
            expect(field.str({ separator: '', garbage: false })).toEqual(
                '____T_____' +
                '___TTT____' +
                'IIII______',
            );
        }

        {
            const field = Field.create('' +
                'IIII______',
            );
            expect(() => field.fill({ type: 'T', rotation: 'spawn', x: 1, y: 0 })).toThrowError();
        }

        {
            const field = Field.create('' +
                'IIII______',
            );
            expect(field.fill({ type: 'T', rotation: 'spawn', x: 1, y: 0 }, true)).toEqual(
                { type: 'T', rotation: 'spawn', x: 1, y: 0 },
            );
            expect(field.str({ separator: '', garbage: false })).toEqual(
                '_T________' +
                'TTTI______',
            );
        }
    });

    test('canLock()', () => {
        const field = Field.create(
            'IIII______',
        );
        expect(field.canLock({ type: 'T', rotation: 'spawn', x: 5, y: 0 })).toEqual(true);
        expect(field.canLock({ type: 'T', rotation: 'spawn', x: 5, y: 1 })).toEqual(false);
        expect(field.canLock({ type: 'T', rotation: 'spawn', x: 4, y: 1 })).toEqual(true);
    });

    test('put()', () => {
        {
            const field = Field.create('' +
                'IIII______',
            );
            expect(field.put({ type: 'T', rotation: 'spawn', x: 5, y: 0 })).toEqual(
                { type: 'T', rotation: 'spawn', x: 5, y: 0 },
            );
            expect(field.str({ separator: '', garbage: false })).toEqual(
                '_____T____' +
                'IIIITTT___',
            );
        }

        {
            const field = Field.create('' +
                'IIII______',
            );
            expect(field.put({ type: 'T', rotation: 'spawn', x: 5, y: 1 })).toEqual(
                { type: 'T', rotation: 'spawn', x: 5, y: 0 },
            );
            expect(field.str({ separator: '', garbage: false })).toEqual(
                '_____T____' +
                'IIIITTT___',
            );
        }

        {
            const field = Field.create('' +
                'IIII______',
            );
            expect(() => field.put({ type: 'T', rotation: 'spawn', x: 1, y: 0 })).toThrowError();
        }
    });
});
