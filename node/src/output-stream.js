import { EOL } from 'os';
export const delegate = (...methods) => (target) => {
    const output = {};
    for (const m of methods) {
        // @ts-ignore
        output[m] = (...args) => target[m](...args);
    }
    return output;
};
// @ts-ignore
const delegateTTY = delegate('write', 'clearLine', 'cursorTo', 'moveCursor');
export const output = (stream) => {
    return Object.assign(delegateTTY(stream), {
        writeLine(message = '', padding = 0) {
            this.write(' '.repeat(padding) + message + EOL);
        },
        writeBlock(message, padding = 0) {
            this.writeLine();
            this.writeLine(message, padding);
        }
    });
};
