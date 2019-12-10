import { AssertionMessage, BailoutMessage, Message, StartTestMessage, TestEndMessage } from 'zora';
export interface Reporter {
    printComment(comment: string, offset?: number): void;
    printBailOut(message: BailoutMessage): void;
    printTestStart(message: StartTestMessage): void;
    printTestEnd(message: TestEndMessage): void;
    printAssertion(message: AssertionMessage): void;
    report(stream: AsyncIterable<Message<any>>): Promise<any>;
}
