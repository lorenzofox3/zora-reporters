import {Tap, TapReporter} from './tap';
import {AssertionMessage, AssertionResult, Message, MessageType, StartTestMessage, TestEndMessage} from 'zora';
import {isAssertionResult} from './util';

const indentedDiagnostic = ({expected, pass, description, actual, operator, at = 'N/A', ...rest}: AssertionResult) => ({
    wanted: expected,
    found: actual,
    at,
    operator,
    ...rest
});

const id = function* () {
    let i = 0;
    while (true) {
        yield ++i;
    }
};

interface IdGenerator extends IterableIterator<number> {
    fork(): void;

    merge(): void;
}

const idGen = (): IdGenerator => {
    let stack = [id()];
    return {
        [Symbol.iterator]() {
            return this;
        },
        next() {
            return stack[0].next();
        },
        fork() {
            stack.unshift(id());
        },
        merge() {
            stack.shift();
        }
    };
};

const IndentedTap = Object.assign({}, Tap, {
    printTestStart(message: StartTestMessage) {
        const {data: {description}, offset} = message;
        this.printComment(`Subtest: ${description}`, offset);
    },
    printAssertion(message: AssertionMessage) {
        const {data, offset} = message;
        const {pass, description} = data;
        const label = pass === true ? 'ok' : 'not ok';
        const id = this.nextId();
        if (isAssertionResult(data)) {
            this.print(`${label} ${id} - ${description}`, offset);
            if (pass === false) {
                this.printYAML(indentedDiagnostic(data), offset);
            }
        } else {
            const comment = data.skip === true ? 'SKIP' : `${data.executionTime}ms`;
            this.print(`${pass ? 'ok' : 'not ok'} ${id} - ${description} # ${comment}`, message.offset);
        }
    },
    printTestEnd(message: TestEndMessage) {
        const length = message.data.length;
        const {offset} = message;
        this.print(`1..${length}`, offset);
    }
});

export const factory = (log: (m: any) => void): TapReporter => {
    const id = idGen();
    return Object.create(IndentedTap, {
        nextId: {
            enumerable: true,
            value: () => {
                return id.next().value;
            }
        },
        report: {
            enumerable: true,
            value: async function (stream: AsyncIterable<Message<any>>) {
                this.print('TAP version 13');
                let lastMessage = null;
                for await (const message of stream) {
                    lastMessage = message;
                    switch (message.type) {
                        case MessageType.TEST_START:
                            id.fork();
                            this.printTestStart(message);
                            break;
                        case MessageType.ASSERTION:
                            this.printAssertion(message);
                            break;
                        case  MessageType.TEST_END:
                            id.merge();
                            this.printTestEnd(message);
                            break;
                        case MessageType.BAIL_OUT:
                            this.printBailOut(message);
                            throw message.data;
                    }
                }
                this.printSummary(lastMessage);
            }
        },
        log: {value: log}
    });
};