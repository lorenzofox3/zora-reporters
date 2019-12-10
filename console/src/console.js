import { isAssertionResult } from '../../tap/src/util.js';
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
                const { at: location, expected, actual } = message.data;
                const parts = location.split('/');
                let pathIndex = parts.findIndex((p) => p.includes('localhost'));
                const filePath = parts.slice(pathIndex + 1);
                // todo
                // const url = new URL(filePath.join('/'), typeof window !== 'undefined' ? window.location.origin : process.cwd());
                // this.logger.error(url.href);
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
