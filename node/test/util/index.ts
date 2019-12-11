interface Stub {
    addCall(...args: any[]): void;

    argsFor(call?: number): any[];
}

const stubBehavior = {
    addCall(...args: any[]) {
        this.callList.push(...args);
    },
    argsFor(call = 0) {
        return this.callList[call];
    }
};

export const stubFn = () => {
    const callList: any[][] = [];
    //@ts-ignore
    const fn: Stub = function (...args: any[]) {
        fn.addCall(args);
        return fn;
    };

    Object.assign(fn, stubBehavior);

    return Object.defineProperties(fn, {
        callList: {value: callList},
        callCount: {
            get() {
                return callList.length;
            }
        }
    });
};

export const flags = Object.freeze({
    black: 1,
    cyan: 1 << 1,
    gray: 1 << 2,
    green: 1 << 3,
    red: 1 << 4,
    yellow: 1 << 5,
    bgGreen: 1 << 6,
    bgRed: 1 << 7,
    bgYellow: 1 << 8,
    bold: 1 << 9,
    underline: 1 << 10
});

export const fakeKleur = () => {
    let string = '';
    let flag = 0;
    const instance = Object.defineProperties({}, {
        flag: {
            get() {
                return flag;
            }
        },
        string: {
            get() {
                return string;
            }
        },
        style: {
            get() {
                //@ts-ignore
                return Object.keys(flags).filter(k => flag & flags[k]);
            }
        }
    });
    for (const key of Object.keys(flags)) {
        instance[key] = function (s: any) {
            string = s !== void 0 ? s : string;
            //@ts-ignore
            flag |= flags[key];
            return instance;
        };
    }
    return instance;
};
