import {createHarness} from 'zora/dist/bundle/index.mjs';
import {tapReporter, indentedTapReporter} from './dist/index.mjs';

const h = createHarness();

const {test} = h;

test(`hello world`, t => {
    t.ok(true);

    t.test('nested', t => {
        t.eq('foo', 'fob');
    });
});

test(`hello world`, t => {
    t.ok(true);

    t.test('nested', t => {
        t.eq('foo', 'fob');
    });
});

h.report(indentedTapReporter());