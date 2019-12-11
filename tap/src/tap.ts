import {AssertionResult, BailoutMessage, Message, MessageType, StartTestMessage, Test, TestEndMessage} from 'zora';
import {flatten, stringifySymbol} from './util';
import {Reporter} from './interfaces';
import {isAssertionResult} from '../../common/util';

// @ts-ignore
const flatDiagnostic = ({pass, description, ...rest}) => rest;

export interface TapReporter extends Reporter {
    nextId(): number;

    print(message: string, offset?: number): void;

    printYAML(obj: Object, offset ?: number): void;

    printSummary(endMessage: TestEndMessage): void;
}

export const Tap = {
    print(message: string, offset = 0) {
        this.log(message.padStart(message.length + (offset * 4))); // 4 white space used as indent (see tap-parser)
    },

    printYAML(obj: object, offset = 0) {
        const YAMLOffset = offset + 0.5;
        this.print('---', YAMLOffset);
        for (const [prop, value] of Object.entries(obj)) {
            this.print(`${prop}: ${JSON.stringify(value, stringifySymbol)}`, YAMLOffset + 0.5);
        }
        this.print('...', YAMLOffset);
    },

    printComment(comment: string, offset = 0) {
        this.print(`# ${comment}`, offset);
    },

    printBailOut(message: BailoutMessage) {
        this.print('Bail out! Unhandled error.');
    },

    printTestStart(message: StartTestMessage) {
        const {data: {description}, offset} = message;
        this.printComment(description, offset);
    },

    printTestEnd(message: TestEndMessage): void {
        // do nothing
    },

    printAssertion(message: Message<Test | AssertionResult>): void {
        const {data, offset} = message;
        const {pass, description} = data;
        const label = pass === true ? 'ok' : 'not ok';
        if (isAssertionResult(data)) {
            const id = this.nextId();
            this.print(`${label} ${id} - ${description}`, offset);
            if (pass === false) {
                this.printYAML(flatDiagnostic(data), offset);
            }
        } else if (data.skip) {
            const id = this.nextId();
            this.print(`${pass ? 'ok' : 'not ok'} ${id} - ${description} # SKIP`, offset);
        }
    },

    printSummary(endMessage: TestEndMessage) {
        this.print('', 0);
        this.printComment(endMessage.data.pass ? 'ok' : 'not ok', 0);
        this.printComment(`success: ${endMessage.data.successCount}`, 0);
        this.printComment(`skipped: ${endMessage.data.skipCount}`, 0);
        this.printComment(`failure: ${endMessage.data.failureCount}`, 0);
    },

    async report(stream: AsyncIterable<Message<any>>) {
        const src = flatten(stream);
        let lastMessage = null;
        this.print('TAP version 13');
        for await (const message of src) {
            lastMessage = message;
            switch (message.type) {
                case MessageType.TEST_START:
                    this.printTestStart(message);
                    break;
                case MessageType.ASSERTION:
                    this.printAssertion(message);
                    break;
                case MessageType.BAIL_OUT:
                    this.printBailOut(message);
                    throw message.data;
            }
        }
        this.print(`1..${lastMessage.data.count}`, 0);
        this.printSummary(lastMessage);
    }
};

export const factory = (log: (p: any) => void): TapReporter => {
    let i = 0;
    return Object.create(Tap, {
        nextId: {
            enumerable: true,
            value: () => {
                return ++i;
            }
        },
        log: {value: log}
    });
};