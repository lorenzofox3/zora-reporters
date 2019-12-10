import {Message} from 'zora';
import {factory as indentedTapReporterFactory} from './tap-indent'
import {factory as tapReporterFactory} from './tap';

export {TapReporter} from './tap';

const report = (factory: Function) => (logger: Console = console) => {
    const log = logger.log.bind(logger);
    return async (stream: AsyncIterable<Message<any>>) => factory(log).report(stream);
};

export const tapReporter = report(tapReporterFactory);
export const indentedTapReporter = report(indentedTapReporterFactory);