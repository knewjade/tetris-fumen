let { decoder } = require('..');

describe('js-require', () => {
    test('async', async () => {
        const data = "v115@vhGRQYHAvItJEJmhCAUGJKJJvMJTNJGBJFKYPAUEzP?EJG98AQmqhECDdCA";
        const pages = decoder.decode(data);
        expect(pages.length).toEqual(7);
    });
});
