let { decoder, encoder } = require('..');

describe('js-require', () => {
    test('decode', async () => {
        const data = "v115@vhGRQYHAvItJEJmhCAUGJKJJvMJTNJGBJFKYPAUEzP?EJG98AQmqhECDdCA";
        const pages = decoder.decode(data);
        expect(pages.length).toEqual(7);
    });

    test('decode -> encode', () => {
        const data = 'v115@vhGRQYHAvItJEJmhCAUGJKJJvMJTNJGBJFKYPAUEzP?EJG98AQmqhECDdCA';
        const pages = decoder.decode(data);
        const encoded = encoder.encode(pages);
        expect(encoded).toEqual(data);
    });
});
