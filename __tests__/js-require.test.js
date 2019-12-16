let { decoder } = require('../build');

describe('js-require', () => {
    test('promise', (done) => {
        const data = "v115@vhGRQYHAvItJEJmhCAUGJKJJvMJTNJGBJFKYPAUEzP?EJG98AQmqhECDdCA";
        decoder.decode(data)
            .then((pages) => {
                expect(pages.length).toEqual(7);
                done();
            });
    });

    test('async', async () => {
        const data = "v115@vhGRQYHAvItJEJmhCAUGJKJJvMJTNJGBJFKYPAUEzP?EJG98AQmqhECDdCA";
        const pages = await decoder.decode(data);
        expect(pages.length).toEqual(7);
    });
});
