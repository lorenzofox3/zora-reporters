import { isAssertionResult } from '../../common/util';
const ConsoleReporter = {
    printComment(comment) {
        this.logger.log(comment);
    },
    printBailOut(message) {
    },
    printTestStart(message) {
        this.logger.group(message.data.description);
    },
    printTestEnd(message) {
        this.logger.groupEnd();
    },
    printAssertion(message) {
        if (isAssertionResult(message.data)) {
            if (message.data.pass) {
                this.logger.log(message.data.description);
            }
            else {
                const { expected, actual } = message.data;
                this.logger.table({ expected, actual });
            }
        }
        else if (message.data.skip) {
            // we log sub test point only when they are skipped
            this.logger.warn(`SKIP: ${message.data.description}`);
        }
    },
    async report(stream) {
        for await (const message of stream) {
            switch (message.type) {
                case "BAIL_OUT" /* BAIL_OUT */:
                    throw message.data;
                case "TEST_START" /* TEST_START */:
                    this.printTestStart(message);
                    break;
                case "ASSERTION" /* ASSERTION */:
                    this.printAssertion(message);
                    break;
                case "TEST_END" /* TEST_END */:
                    this.printTestEnd(message);
                    break;
            }
        }
    }
};
export const factory = (logger) => {
    return Object.create(ConsoleReporter, {
        logger: { value: logger }
    });
};
