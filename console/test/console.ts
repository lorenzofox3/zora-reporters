import {Assert, Message, MessageType, Operator} from 'zora';
import {factory} from '../src/console';

interface TestLogger extends Console {
    buffer: { type: string, text?: any }[];
}

async function* asyncIter(messages: Message<any>[]) {
    yield* messages;
}

const loggerFactory = (): TestLogger => {
    const buffer: { type: string, text?: any }[] = [];

    return Object.defineProperties({
        log(message: string) {
            buffer.push({text: String(message), type: 'log'});
        },
        group(message: string) {
            buffer.push({text: String(message), type: 'group'});
        },
        groupEnd() {
            buffer.push({type: 'groupEnd'});
        },
        table(data: unknown) {
            buffer.push({type: 'table', text: data});
        },
        warn(message?: any): void {
            buffer.push({type: 'warn', text: String(message)});
        }
    }, {
        buffer: {value: buffer}
    });
};

export default (t: Assert) => {
    t.test(`printComment should simply log the message`, t => {
        const logger = loggerFactory();
        const c = factory(logger);
        c.printComment(`hello world`);
        t.eq(logger.buffer, [{type: 'log', text: `hello world`}]);
    });

    t.test(`printBailOut should not do anything`, t => {
        const logger = loggerFactory();
        const c = factory(logger);
        c.printBailOut({type: MessageType.BAIL_OUT, data: new Error('some erorr'), offset: 0});
        t.eq(logger.buffer, []);
    });

    t.test(`printTestStart should start a console group with the description as the label`, t => {
        const logger = loggerFactory();
        const c = factory(logger);
        c.printTestStart({
            type: MessageType.TEST_START, offset: 0, data: {
                description: 'new test'
            }
        });

        t.eq(logger.buffer, [{
            type: 'group',
            text: 'new test'
        }]);
    });

    t.test(`printTestEnd should end the current console group`, t => {
        const logger = loggerFactory();
        const c = factory(logger);
        //@ts-ignore
        c.printTestEnd({type: MessageType.TEST_END, data: 'whatever'});

        t.eq(logger.buffer, [{
            type: 'groupEnd'
        }]);
    });

    t.test(`printAssertion message when the assertion passes should simply log the description`, t => {
        const logger = loggerFactory();
        const c = factory(logger);
        c.printAssertion({
            type: MessageType.ASSERTION, offset: 0, data: {
                description: 'should pass',
                pass: true,
                expected: true,
                actual: true,
                operator: Operator.OK
            }
        });
        t.eq(logger.buffer, [{
            type: 'log',
            text: `should pass`
        }]);
    });

    t.test(`printAssertion message when the assertion fails should log the diagnostic with table console method`, t => {
        const logger = loggerFactory();
        const c = factory(logger);
        c.printAssertion({
            type: MessageType.ASSERTION, offset: 0, data: {
                description: 'should be ok',
                pass: false,
                expected: true,
                actual: false,
                operator: Operator.OK
            }
        });
        t.eq(logger.buffer, [{
            type: 'table',
            text: {expected: true, actual: false}
        }]);
    });

    t.test(`printAssertion when the assertions refers to a test point should not to anything`, t => {
        const logger = loggerFactory();
        const c = factory(logger);
        c.printAssertion({
            //@ts-ignore
            type: MessageType.ASSERTION, data: {
                pass: false
            }
        });

        t.eq(logger.buffer, []);
    });

    t.test(`printAssertion when the assertions refers to a skipped test point should set a warning in the console`, t => {
        const logger = loggerFactory();
        const c = factory(logger);
        c.printAssertion({
            //@ts-ignore
            type: MessageType.ASSERTION, data: {
                pass: true,
                skip: true,
                description: 'some description'
            }
        });

        t.eq(logger.buffer, [{
            type: 'warn',
            text: `SKIP: some description`
        }]);
    });

    t.test(`report method should throw when it encounters a BAILOUT message`, async t => {
        const logger = loggerFactory();
        const c = factory(logger);
        const err = new Error(`some error`);
        try {
            await c.report(asyncIter([{
                type: MessageType.TEST_START,
                data: {description: 'some test'},
                offset: 0
            }, {
                type: MessageType.BAIL_OUT,
                data: err,
                offset: 0
            }]));
            t.fail(`should not reach`);
        } catch (e) {
            t.is(e, err, 'should have thrown the error');
        }
    });

    t.test(`report method should route messages depending on their nature`, async t => {
        const logger = loggerFactory();
        const c = factory(logger);
        await c.report(asyncIter([{
            type: MessageType.TEST_START,
            data: {description: 'some test'},
            offset: 0
        }, {
            type: MessageType.ASSERTION,
            data: {
                pass: true,
                description: 'should pass',
                actual: true,
                expected: true,
                operator: Operator.OK
            },
            offset: 0
        }, {
            type: MessageType.TEST_END,
            data: {description: `some test`},
            offset: 0
        }]));

        t.eq(logger.buffer, [{'text': 'some test', 'type': 'group'}, {
            'text': 'should pass',
            'type': 'log'
        }, {'type': 'groupEnd'}]);
    });
}