export const map = (fn) => async function* (stream) {
    for await (const m of stream) {
        yield fn(m);
    }
};
// ! it mutates the underlying structure yet it is more efficient regarding performances
export const flatten = map((m) => {
    m.offset = 0;
    return m;
});
export const stringifySymbol = (key, value) => {
    if (typeof value === 'symbol') {
        return value.toString();
    }
    return value;
};
