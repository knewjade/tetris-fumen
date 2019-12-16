import { decoder, Pages } from '..';

describe('usage', () => {
    test('case1', () => {
        const data = 'v115@vhGRQYHAvItJEJmhCAUGJKJJvMJTNJGBJFKYPAUEzP?EJG98AQmqhECDdCA';
        const pages: Pages = decoder.decode(data);
        expect(pages.length).toEqual(7);

        const page = pages[0];
        expect(page.comment).toEqual('Opening');
    });
});
