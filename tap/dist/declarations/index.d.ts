import { Message } from 'zora';
export { TapReporter } from './tap';
export declare const tapReporter: (logger?: Console) => (stream: AsyncIterable<Message<any>>) => Promise<any>;
export declare const indentedTapReporter: (logger?: Console) => (stream: AsyncIterable<Message<any>>) => Promise<any>;
