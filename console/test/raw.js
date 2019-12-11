import { rawReporter } from '../src';
const fakeOutputStream = () => {
    const buffer = [];
    return {
        log(val) {
            buffer.push(val);
        },
        compare(assert, expected) {
            return assert.eq(buffer.map(i => JSON.parse(i)), expected);
        }
    };
};
export default (t) => {
    t.test(`dump messages as they enter`, async (t) => {
        const out = fakeOutputStream();
        //@ts-ignore
        const report = rawReporter(out);
        const error = new Error('an error');
        const messages = [
            { type: 'TEST_START', data: 1 },
            { type: 'TEST_START', data: 2 },
            { type: 'ASSERTION', data: 4 },
            { type: 'BAIL_OUT', data: error },
            { type: 'TEST_END', data: 3 },
            { type: 'TEST_END', data: -1 }
        ];
        //@ts-ignore
        await report(messages);
        out.compare(t, messages);
    });
};
