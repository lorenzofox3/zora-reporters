import { factory as indentedTapReporterFactory } from './tap-indent';
import { factory as tapReporterFactory } from './tap';
const report = (factory) => (logger = console) => {
    const log = logger.log.bind(logger);
    return async (stream) => factory(log).report(stream);
};
export const tapReporter = report(tapReporterFactory);
export const indentedTapReporter = report(indentedTapReporterFactory);
