import {Reporter} from '../../tap/src/interfaces';
import {AssertionMessage, BailoutMessage, Message, MessageType, StartTestMessage, TestEndMessage} from 'zora';
import {isAssertionResult} from '../../common/util';

const ConsoleReporter = {
    printComment(comment: string) {
        this.logger.log(comment);
    },
    printBailOut(message: BailoutMessage) {
    },
    printTestStart(message: StartTestMessage) {
        this.logger.group(message.data.description);
    },
    printTestEnd(message: TestEndMessage): void {
        this.logger.groupEnd();
    },
    printAssertion(message: AssertionMessage): void {
        if (isAssertionResult(message.data)) {
            if (message.data.pass) {
                this.logger.log(message.data.description);
            } else {
                const {expected, actual} = message.data;
                this.logger.table({expected, actual});
            }
        } else if (message.data.skip) {
            // we log sub test point only when they are skipped
            this.logger.warn(`SKIP: ${message.data.description}`);
        }
    },
    async report(stream: AsyncIterable<Message<any>>): Promise<void> {
        for await (const message of stream) {
            switch (message.type) {
                case MessageType.BAIL_OUT:
                    throw message.data;
                case MessageType.TEST_START:
                    this.printTestStart(message);
                    break;
                case MessageType.ASSERTION:
                    this.printAssertion(message);
                    break;
                case MessageType.TEST_END:
                    this.printTestEnd(message);
                    break;
            }
        }
    }
};

export const factory = (logger: Console): Reporter => {
    return Object.create(ConsoleReporter, {
        logger: {value: logger}
    });
};