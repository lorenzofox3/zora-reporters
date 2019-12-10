import {Message} from 'zora';

export const rawReporter = (logger = console) => async (stream: AsyncIterable<Message<any>>) => {
    for await (const m of stream) {
        logger.log(JSON.stringify(m));
    }
};