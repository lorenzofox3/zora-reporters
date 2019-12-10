import { Tap } from './tap';
import { isAssertionResult } from './util';
const indentedDiagnostic = ({ expected, pass, description, actual, operator, at = 'N/A', ...rest }) => ({
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
const idGen = () => {
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
    printTestStart(message) {
        const { data: { description }, offset } = message;
        this.printComment(`Subtest: ${description}`, offset);
    },
    printAssertion(message) {
        const { data, offset } = message;
        const { pass, description } = data;
        const label = pass === true ? 'ok' : 'not ok';
        const id = this.nextId();
        if (isAssertionResult(data)) {
            this.print(`${label} ${id} - ${description}`, offset);
            if (pass === false) {
                this.printYAML(indentedDiagnostic(data), offset);
            }
        }
        else {
            const comment = data.skip === true ? 'SKIP' : `${data.executionTime}ms`;
            this.print(`${pass ? 'ok' : 'not ok'} ${id} - ${description} # ${comment}`, message.offset);
        }
    },
    printTestEnd(message) {
        const length = message.data.length;
        const { offset } = message;
        this.print(`1..${length}`, offset);
    }
});
export const factory = (log) => {
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
            value: async function (stream) {
                this.print('TAP version 13');
                let lastMessage = null;
                for await (const message of stream) {
                    lastMessage = message;
                    switch (message.type) {
                        case "TEST_START" /* TEST_START */:
                            id.fork();
                            this.printTestStart(message);
                            break;
                        case "ASSERTION" /* ASSERTION */:
                            this.printAssertion(message);
                            break;
                        case "TEST_END" /* TEST_END */:
                            id.merge();
                            this.printTestEnd(message);
                            break;
                        case "BAIL_OUT" /* BAIL_OUT */:
                            this.printBailOut(message);
                            throw message.data;
                    }
                }
                this.printSummary(lastMessage);
            }
        },
        log: { value: log }
    });
};
