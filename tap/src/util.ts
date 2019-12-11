import {Message} from 'zora';

export const map = (fn: Function) => async function* (stream: AsyncIterable<Message<any>>) {
    for await (const m of stream) {
        yield fn(m);
    }
};

// ! it mutates the underlying structure yet it is more efficient regarding performances
export const flatten = map((m: any) => {
    m.offset = 0;
    return m;
});

export const stringifySymbol = (key: string, value: Symbol) => {
    if (typeof value === 'symbol') {
        return value.toString();
    }

    return value;
};