import { serialize } from 'cookie';
import { NextApiResponse } from 'next';
import { CookieArgs, CookiesMiddleware  } from '../types';

const cookieFn = (
    res: NextApiResponse,
    { name, value, options = {} }: CookieArgs,
) => {
    const stringValue: string = typeof value === 'object' ? 'j:' + JSON.stringify(value) : String(value);

    if (typeof options.maxAge === 'number') {
        options.expires = new Date(Date.now() + options.maxAge);
        options.maxAge /= 1000;
    }

    res.setHeader('Set-cookie', serialize(name, stringValue, options));
}

export const cookies: CookiesMiddleware = (handler) => (req, res) => {
    res.cookie = (args: CookieArgs) => cookieFn(res, args);

    return handler(req, res);
}
