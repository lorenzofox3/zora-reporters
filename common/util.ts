import {AssertionResult, Test} from 'zora';

export const isAssertionResult = (result: Test | AssertionResult): result is AssertionResult => {
    return 'operator' in result;
};