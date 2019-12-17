import { decoder, encoder, Pages } from '..';

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
});
