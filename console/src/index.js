import { factory } from './console';
export { rawReporter } from './raw';
export const consoleReporter = (logger = console) => {
    const reporter = factory(logger);
    return (stream) => reporter.report(stream);
};
