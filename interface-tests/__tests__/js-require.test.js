const { decoder, encoder, Field } = require('../../index');

describe('js-require', () => {
    test('Example: case1', () => {
        const data = "v115@vhGRQYHAvItJEJmhCAUGJKJJvMJTNJGBJFKYPAUEzP?EJG98AQmqhECDdCA";
        const pages = decoder.decode(data);

        expect(pages.length).toEqual(7);
        expect(pages[0].comment).toEqual('Opening');
        expect(pages[0].operation).toEqual({ type: 'I', rotation: 'spawn', x: 4, y: 0 });
    });

    test('Example: case1 (URL)', () => {
        const data = 'https://harddrop.com/fumen/?v115@vhGRQYHAvItJEJmhCAUGJKJJvMJTNJGBJFKYPAUEzP?EJG98AQmqhECDdCA';
        const pages = decoder.decode(data);

        expect(pages.length).toEqual(7);
        expect(pages[0].comment).toEqual('Opening');
        expect(pages[0].operation).toEqual({ type: 'I', rotation: 'spawn', x: 4, y: 0 });
    });

    test('Example: case2.1', () => {
        const pages = decoder.decode('v115@9gI8AeI8AeI8AeI8KeAgH');
        pages[0].comment = '4 Lines';
        pages[0].operation = { type: 'I', rotation: 'left', x: 9, y: 1 };

        expect(encoder.encode(pages)).toEqual('v115@9gI8AeI8AeI8AeI8Ke5IYJA0no2AMOprDTBAAA');
    });

    test('Example: case2.2', () => {
        const pages = [];
        pages.push({
            field: Field.create(
                'LLL_______' +
                'LOO_______' +
                'JOO_______' +
                'JJJ_______',
                'XXXXXXXXX_',
            ),
            comment: 'Perfect Clear Opener',
        });

        pages.push({
            operation: {
                type: 'T', rotation: 'left', x: 9, y: 1,
            },
        });

        pages.push({
            operation: {
                type: 'Z', rotation: 'spawn', x: 7, y: 0,
            },
        });

        pages.push({
            operation: {
                type: 'S', rotation: 'spawn', x: 8, y: 2,
            },
        });

        pages.push({
            comment: 'Success: 61.19 %',
            flags: {
                mirror: true,
            },
        });

        pages.push({
            comment: '(Mirror)',
        });

        expect(encoder.encode(pages)).toEqual('v115@9gilGeglRpGeg0RpGei0GeI8AeAgWYAQIKvDll2TAS?IvBElCyTASIqPEFGNXEvhE9tB0sBXjBAwSYATwgkDlt0TAz?B88AQx2vAx178AwngHBAAPMAFbuYCJciNEyoAVB');
    });

    test('Example: case3', () => {
        const pages = decoder.decode('v115@vhGRQYHAvItJEJmhCAUGJKJJvMJTNJGBJFKYPAUEzP?EJG98AQmqhECDdCA');
        const page = pages[0];

        expect(page.index).toEqual(0);
        expect(page.comment).toEqual('Opening');
        expect(page.operation).toEqual({ type: 'I', rotation: 'spawn', x: 4, y: 0 });
        expect(page.flags).toEqual({ colorize: true, lock: true, mirror: false, quiz: false, rise: false });

        const field = page.field;
        expect(field.at(4, 0)).toEqual('_');

        field.put(page.operation);  // field object is mutable
        expect(field.at(4, 0)).toEqual('I');

        const mino = page.mino();
        expect(mino.operation()).toEqual(page.operation);
        expect(mino.positions()).toEqual([{ x: 3, y: 0 }, { x: 4, y: 0 }, { x: 5, y: 0 }, { x: 6, y: 0 }]);
        expect(mino.isValid()).toEqual(true);
        mino.x = 0;  // Out of the field
        expect(mino.isValid()).toEqual(false);
    });

    test('Example: case4', () => {
        const field = Field.create(
            'LLL_______' +
            'LOO_______' +
            'JOO_______' +
            'JJJ_______',
            'XXXXXXXXX_',
        );

        expect(field.at(9, 0)).toEqual('_');

        field.set(9, 0, 'O');
        field.set(9, 1, 'GRAY');
        field.set(9, 2, 'EMPTY');

        field.set(0, -1, 'X');
        field.set(9, -1, '_');

        const field1 = Field.create(
            'LLL_______' +
            'LOO_______' +
            'JOO______X' +
            'JJJ______O',
            'XXXXXXXXX_',
        );
        expect(field.str()).toEqual(field1.str());

        expect(field.canFill({ type: 'I', rotation: 'left', x: 9, y: 3 })).toEqual(true);

        field.fill({ type: 'I', rotation: 'left', x: 9, y: 3 });

        expect(field.canLock({ type: 'O', rotation: 'spawn', x: 4, y: 0 })).toEqual(true);
        expect(field.canLock({ type: 'O', rotation: 'spawn', x: 4, y: 1 })).toEqual(false);

        const afterMino = field.put({ type: 'O', rotation: 'spawn', x: 4, y: 10 });
        expect(afterMino).toEqual({ type: 'O', rotation: 'spawn', x: 4, y: 0 });
        expect(afterMino.operation()).toEqual({ type: 'O', rotation: 'spawn', x: 4, y: 0 });

        const field2 = Field.create(
            '              _________I' +
            '_________I' +
            'LLL______I' +
            'LOO______I' +
            'JOO_OO___X' +
            'JJJ_OO___O',
            'XXXXXXXXX_',
        );
        expect(field.str()).toEqual(field2.str());

        const copied = field.copy();
        expect(copied.str()).toEqual(field.str());
        copied.set(0, 0, 'T');
        expect(copied.str()).not.toEqual(field.str());
    });
});
