import { AssertionResult, BailoutMessage, Message, StartTestMessage, Test, TestEndMessage } from 'zora';
import { Reporter } from './interfaces';
export interface TapReporter extends Reporter {
    nextId(): number;
    print(message: string, offset?: number): void;
    printYAML(obj: Object, offset?: number): void;
    printSummary(endMessage: TestEndMessage): void;
}
export declare const Tap: {
    print(message: string, offset?: number): void;
    printYAML(obj: object, offset?: number): void;
    printComment(comment: string, offset?: number): void;
    printBailOut(message: BailoutMessage): void;
    printTestStart(message: StartTestMessage): void;
    printTestEnd(message: TestEndMessage): void;
    printAssertion(message: Message<AssertionResult | Test>): void;
    printSummary(endMessage: TestEndMessage): void;
    report(stream: AsyncIterable<Message<any>>): Promise<void>;
};
export declare const factory: (log: (p: any) => void) => TapReporter;
