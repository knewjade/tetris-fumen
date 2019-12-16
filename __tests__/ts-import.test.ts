import { decoder, Pages } from '../build';

describe('usage', () => {
    test('case1', async () => {
        const data = 'v115@vhGRQYHAvItJEJmhCAUGJKJJvMJTNJGBJFKYPAUEzP?EJG98AQmqhECDdCA';
        const pages: Pages = await decoder.decode(data);
        expect(pages.length).toEqual(7);

        const page = pages[0];
        expect(page.comment).toEqual('Opening');
    });
});
