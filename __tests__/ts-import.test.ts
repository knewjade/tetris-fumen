import { decoder, EncodePages, encoder, Field, Pages } from '..';

describe('usage', () => {
    test('decode', () => {
        const data = 'v115@vhGRQYHAvItJEJmhCAUGJKJJvMJTNJGBJFKYPAUEzP?EJG98AQmqhECDdCA';
        const pages: Pages = decoder.decode(data);
        expect(pages.length).toEqual(7);

        const page = pages[0];
        expect(page.index).toEqual(0);
        expect(page.comment).toEqual('Opening');
        expect(page.flags).toEqual({
            colorize: true,
            lock: true,
            mirror: false,
            quiz: false,
            rise: false,
        });
        expect(page.operation).toEqual({
            type: 'I',
            rotation: 'Spawn',
            x: 4,
            y: 0,
        });
        expect(page.refs).toEqual({});

        const field = page.field;
        expect(field.at(4, 0)).toEqual('_');

        field.put(page.operation);
        expect(field.at(4, 0)).toEqual('I');
    });

    test('decode -> encode', () => {
        const data = 'v115@vhGRQYHAvItJEJmhCAUGJKJJvMJTNJGBJFKYPAUEzP?EJG98AQmqhECDdCA';
        const pages = decoder.decode(data);
        const encoded: string = encoder.encode(pages);
        expect(encoded).toEqual(data);
    });

    test('encode', () => {
        const pages: EncodePages = [];
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
                type: 'T', rotation: 'Left', x: 9, y: 1,
            },
        });

        pages.push({
            operation: {
                type: 'Z', rotation: 'Spawn', x: 7, y: 0,
            },
        });

        pages.push({
            operation: {
                type: 'S', rotation: 'Spawn', x: 8, y: 2,
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

        const encoded: string = encoder.encode(pages);
        expect(encoded).toEqual('v115@9gilGeglRpGeg0RpGei0GeI8AeAgWYAQIKvDll2TAS?IvBElCyTASIqPEFGNXEvhE9tB0sBXjBAwSYATwgkDlt0TAz?B88AQx2vAx178AwngHBAAPMAFbuYCJciNEyoAVB');
    });

    test('field', () => {
        // Block colors
        // TIOLJSZ => 'TIOLJSZ'
        // Gray => 'X'
        // Empty => '_'
        const field = Field.create(
            'LLL_______' +
            'LOO_______' +
            'JOO_______' +
            'JJJ_______',  // field
            'XXXXXXXXX_',  // garbage
        );

        expect(field.str({ separator: '', garbage: false })).toEqual(
            'LLL_______' +
            'LOO_______' +
            'JOO_______' +
            'JJJ_______',
        );

        expect(field.str({ separator: '' })).toEqual(
            'LLL_______' +
            'LOO_______' +
            'JOO_______' +
            'JJJ_______' +
            'XXXXXXXXX_',
        );

        field.str();
        field.canPut({ type: 'T', rotation: 'Left', x: 9, y: 1 });  // true

        field.put({ type: 'T', rotation: 'Left', x: 9, y: 1 });

        field.at(9, 1);  // 'T'

        expect(field.str({ separator: '' })).toEqual(
            'LLL_______' +
            'LOO______T' +
            'JOO_____TT' +
            'JJJ______T' +
            'XXXXXXXXX_',
        );

        field.set(9, 0, 'O');
        field.set(9, 1, 'Gray');
        field.set(9, 2, 'Empty');

        const copied = field.copy();

        expect(copied.str({ separator: '' })).toEqual(
            'LLL_______' +
            'LOO_______' +
            'JOO_____TX' +
            'JJJ______O' +
            'XXXXXXXXX_',
        );
    });
});
