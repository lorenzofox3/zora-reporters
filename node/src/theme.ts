import * as kleur from 'kleur';

type primitive = string | boolean | number;

export interface Theme {
    emphasis(message: primitive): string;

    successBadge(message: primitive): string;

    failureBadge(message: primitive): string;

    skipBadge(message: primitive): string;

    path(message: primitive): string;

    operator(operator: primitive): string;

    adornment(symbol: primitive): string;

    stackTrace(stack: primitive): string;

    summaryPass(count: number): string;

    summarySkip(count: number): string

    summaryFail(count: number): string

    error(value: primitive): string

    success(value: primitive): string

    diffSame(val: primitive): string

    diffRemove(val: primitive): string

    diffAdd(val: primitive): string
}

export const theme = ({
                          bgGreen,
                          bgRed,
                          bgYellow,
                          green,
                          red,
                          cyan,
                          gray,
                          yellow,
                          bold,
                          underline
                      }: kleur.Kleur = kleur): Theme => ({
    emphasis(message: string) {
        return underline().bold(message);
    },
    successBadge(message: string) {
        return bgGreen().black().bold(message);
    },
    failureBadge(message: string) {
        return bgRed().black().bold(message);
    },
    skipBadge(m: string) {
        return bgYellow().black().bold(m);
    },
    path(message: string) {
        const [first, ...rest] = message.split('/').reverse();
        return underline(gray(rest.reverse().join('/')) + '/' + first);
    },
    operator(operator: string) {
        return yellow(`${gray('[')} ${operator} ${gray(']')}`);
    },
    adornment(symbol: string) {
        return gray(symbol);
    },
    stackTrace(stack: string) {
        return cyan().underline(stack.trim());
    },
    summaryPass(count: number) {
        return green(`${bold('✔ PASS')}: ${count}`);
    },
    summarySkip(count: number) {
        return yellow(`${bold('⚠ SKIP')}: ${count}`);
    },
    summaryFail(count: number) {
        return red(`${bold('✔ FAIL')}: ${count}`);
    },
    error(value: string) {
        return red(value);
    },
    success(value: string) {
        return green(value);
    },
    diffSame(val: string) {
        return gray(val);
    },
    diffRemove(val: string) {
        return bgRed().black(val);
    },
    diffAdd(val: string) {
        return bgGreen().black(val);
    }
});

export const paint = theme();