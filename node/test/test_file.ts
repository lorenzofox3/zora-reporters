import {test} from '../src/test';
import {Assert} from 'zora';
import {Output} from '../src/output-stream';

export default (t: Assert) => {
    t.test(`factory should init an instance`, t => {
        //@ts-ignore
        const out: Output = {};
        const tf = test(`hello/world.js`, out);
        t.is(tf.out, out);
        t.eq(tf.file, `hello/world.js`);
        t.eq(tf.success, 0);
        t.eq(tf.skip, 0);
        t.eq(tf.failure, 0);
        t.eq(tf.total, 0);
        t.eq(tf.path, [`hello/world.js`]);
        t.eq(tf.failureList, []);
    });

    t.test(`testFile.incrementSuccess: should update success`, t => {
        //@ts-ignore
        const out: Output = {};
        const tf = test('foo', out);
        t.eq(tf.success, 0);
        tf.incrementSuccess();
        t.eq(tf.success, 1);
    });

    t.test(`testFile.incrementFailure: should update failure`, t => {
        //@ts-ignore
        const out: Output = {};
        const tf = test('foo', out);
        t.eq(tf.failure, 0);
        tf.incrementFailure();
        t.eq(tf.failure, 1);
    });

    t.test(`testFile.incrementSkip: should update skip`, t => {
        //@ts-ignore
        const out: Output = {};
        const tf = test('foo', out);
        t.eq(tf.skip, 0);
        tf.incrementSkip();
        t.eq(tf.skip, 1);
    });

    t.test(`testFile.total: should return the sum of "failure", "success" and "skip`, t => {
        //@ts-ignore
        const out: Output = {};
        const tf = test('foo', out);
        t.eq(tf.total, 0);
        tf.incrementSkip();
        tf.incrementSkip();
        t.eq(tf.skip, 2);
        t.eq(tf.failure, 0);
        t.eq(tf.success, 0);
        t.eq(tf.total, 2);
        tf.incrementFailure();
        t.eq(tf.skip, 2);
        t.eq(tf.failure, 1);
        t.eq(tf.success, 0);
        t.eq(tf.total, 3);
        tf.incrementSuccess();
        t.eq(tf.skip, 2);
        t.eq(tf.failure, 1);
        t.eq(tf.success, 1);
        t.eq(tf.total, 4);
    });

    t.test(`testFile.goIn should deepen the path`, t => {
        //@ts-ignore
        const out: Output = {};
        const tf = test('foo', out);
        t.eq(tf.path, ['foo']);
        tf.goIn('bar');
        t.eq(tf.path, ['foo', 'bar']);
        tf.goIn('baz');
        t.eq(tf.path, ['foo', 'bar', 'baz']);
    });

    t.test(`testFile.goOut should shallow the path`, t => {
        //@ts-ignore
        const out: Output = {};
        const tf = test('foo', out);
        t.eq(tf.path, ['foo']);
        tf.goIn('bar');
        t.eq(tf.path, ['foo', 'bar']);
        tf.goIn('baz');
        t.eq(tf.path, ['foo', 'bar', 'baz']);
        tf.goOut();
        t.eq(tf.path, ['foo', 'bar']);
        tf.goOut();
        t.eq(tf.path, ['foo']);
    });

    t.test(`testFile.addFailure: should save the failure with current path`, t => {
        //@ts-ignore
        const out: Output = {};
        const tf = test('foo', out);
        t.eq(tf.path, ['foo']);
        tf.addFailure({error: 'something is wrong'});
        t.eq(tf.failureList, [{path: ['foo'], data: {error: 'something is wrong'}}]);
        tf.goIn('bar');
        tf.addFailure({error: 'something is wrong again'});
        t.eq(tf.failureList, [{'path': ['foo'], 'data': {'error': 'something is wrong'}}, {
            'path': ['foo', 'bar'],
            'data': {'error': 'something is wrong again'}
        }]);
    });

    t.test(`testFile should be an iterable on failure`, t => {
        //@ts-ignore
        const out: Output = {};
        const tf = test('foo', out);
        t.ok(tf[Symbol.iterator]);
        tf.addFailure('fail1');
        tf.addFailure('fail2');
        t.eq([...tf], [{path: ['foo'], data: 'fail1'}, {path: ['foo'], data: 'fail2'}]);
        t.eq([...tf], [{path: ['foo'], data: 'fail1'}, {
            path: ['foo'],
            data: 'fail2'
        }], 'should be able to iterate several times');
    });
};