import {EOL} from 'os';
import {Direction, WriteStream} from 'tty';
import {Theme} from './theme';

interface TTY {
    clearLine(dir: Direction, callback?: () => void): boolean;

    cursorTo(x: number, y?: number, callback?: () => void): boolean;

    cursorTo(x: number, callback: () => void): boolean;

    moveCursor(dx: number, dy: number, callback?: () => void): boolean;

    write(str: string): void;

    width: number;
}

export const delegate = <T, K extends keyof T>(...methods: K[]) => (target: T): Pick<T, K> => {
    const output = {} as Pick<T, K>;

    for (const m of methods) {
        // @ts-ignore
        output[m] = (...args: unknown[]) => target[m](...args);
    }

    return output;
};

// @ts-ignore
const delegateTTY = delegate('write', 'clearLine', 'cursorTo', 'moveCursor');

export interface Output extends TTY, Theme {
    writeLine(message: string, padding?: number): void;

    writeBlock(message: string, padding?: number): void;
}

export const output = (stream: WriteStream): Output => {
    return Object.assign(delegateTTY(stream), {
        writeLine(message = '', padding = 0) {
            this.write(' '.repeat(padding) + message + EOL);
        },
        writeBlock(message: string, padding = 0) {
            this.writeLine();
            this.writeLine(message, padding);
        }
    });
};