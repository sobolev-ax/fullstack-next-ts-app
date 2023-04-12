import { CookieSerializeOptions } from 'cookie';
import { NextApiRequest, NextApiResponse } from 'next';

// #### типы для посредника cookie

// параметры, принимаемые функцией
export type CookieArgs = {
    name: string;
    value: any;
    options?: CookieSerializeOptions;
}

// объект ответа
export type NextApiResponseWithCookie = NextApiResponse & {
    cookie: (args: CookieArgs) => void
}

// обработчик запросов
export type NextApiHandlerWithCookie = (
    req: NextApiRequest,
    res: NextApiResponseWithCookie,
) => unknown | Promise<unknown>

// посредник
export type CookiesMiddleware = (
    handler: NextApiHandlerWithCookie,
) => (req: NextApiRequest, res: NextApiResponseWithCookie) => void;

// #### типы для посредника authGuard

export type NextApiRequestWithUserId = NextApiRequest & {
    userId: string;
}

export type NextApiHandlerWithUserId = (
    req: NextApiRequestWithUserId,
    res: NextApiResponse,
) => unknown | Promise<unknown>;

export type AuthGuardMiddleware = (
    handler: NextApiHandlerWithUserId,
) => (req: NextApiRequestWithUserId, res: NextApiResponse) => void;
