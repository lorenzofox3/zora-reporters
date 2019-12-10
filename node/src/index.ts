import {Failure, Test, test} from './test';
import {EOL} from 'os';
import {Output, output} from './output-stream';
import {Message, MessageType, Reporter} from 'zora';
import {paint} from './theme';
import {isAssertionResult} from '../../tap/src/util';
import {getDiagnosticReporter} from './diagnostic';

const printHeader = (message: string, out: Output): void => {
    const header = message.toUpperCase();
    out.writeBlock(out.emphasis(header), 1);
};

const printFailures = (tests: Test[], out: Output) => {
    const failing: Failure[] = tests
        .filter(t => t.failure)
        .reduce((acc, curr) => acc.concat([...curr]), []);

    if (failing.length === 0) {
        out.writeLine('N/A', 2);
        return;
    }

    failing.forEach((failure, index) => {
        const data = failure.data;
        const [file, ...testPath] = failure.path;
        const header = testPath.concat(out.emphasis(data.description)).join(out.adornment(' > '));
        out.writeBlock((`${paint.adornment(`${index + 1}.`)} ${header} ${out.adornment('<--')} ${out.operator(data.operator)}`));
        out.writeLine(`${paint.adornment('at')} ${paint.stackTrace(data.at)}`, 4);
        getDiagnosticReporter(data).report(out);
        out.writeLine(out.adornment('_'.repeat(out.width)));

    });
};

const printFooter = (tests: Test[], out: Output) => {
    const skipped = tests.reduce((acc, curr) => acc + curr.skip, 0);
    const failure = tests.reduce((acc, curr) => acc + curr.failure, 0);
    const success = tests.reduce((acc, curr) => acc + curr.success, 0);

    out.writeLine(paint.summaryPass(success), 1);
    out.writeLine(paint.summarySkip(skipped), 1);
    out.writeLine(paint.summaryFail(failure), 1);

    out.writeLine(`${EOL}`);
};

export const factory = (theme = paint, stream = process.stdout): Reporter => {

    const out = Object.assign(output(stream), theme, {
        width: stream.columns || 80
    });

    return async (stream: AsyncIterable<Message<any>>) => {
        const tests = [];
        let testLines = 0;
        let pass = true;

        printHeader('tests files', out);
        out.writeLine('');

        for await (const message of stream) {
            const current = tests[tests.length - 1];
            const {data, offset, type} = message;

            if (type === MessageType.BAIL_OUT) {
                throw data;
            }

            if (type === MessageType.TEST_END && offset > 0) {
                current.goOut();
            }

            if (type === MessageType.TEST_START) {
                if (offset === 0) {
                    testLines++;
                    const newTest = test(data.description, out);
                    newTest.writeLine();
                    tests.push(newTest);
                } else {
                    current.goIn(data.description);
                }
            }

            if (type === MessageType.ASSERTION) {
                if (isAssertionResult(data) || data.skip) {
                    pass = pass && data.pass;
                    if (data.pass === false) {
                        current.incrementFailure();
                        current.addFailure(data);
                    } else if (data.skip) {
                        current.incrementSkip();
                    } else {
                        current.incrementSuccess();
                    }
                    out.moveCursor(0, -1);
                    out.clearLine(0);
                    tests[tests.length - 1].writeLine();
                }
            }

        }

        printHeader('failures', out);
        printFailures(tests, out);

        printHeader('summary', out);

        out.writeLine('');

        printFooter(tests, out);
    };
};
