import {factory} from './console';
import {Message} from 'zora';

export {rawReporter} from './raw';
export const consoleReporter = (logger: Console = console) => {
    const reporter = factory(logger);
    return (stream: AsyncIterable<Message<any>>) => reporter.report(stream);
};