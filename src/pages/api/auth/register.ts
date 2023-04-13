import { NextApiHandlerWithCookie } from "@/types";
import { checkFields } from "@/utils/checkFields";
import { cookies } from "@/utils/cookie";
import prisma from "@/utils/prisma";
import { User } from "@prisma/client";
import argon2 from "argon2";
import jwt from "jsonwebtoken";

const registerHandler: NextApiHandlerWithCookie = async (req, res) => {
    // извлекаем данные из тела запроса
    // одним из преимуществ Prisma является автоматическая генерация типов моделей
    const data: Pick<User, 'username' | 'email' | 'password'> = JSON.parse(req.body);

    // если отсутствует хотя бы одно обязательное поле
    if (!checkFields(data, ['email', 'password'])) {
        return res.status(400).json({ message: 'Some required fields are missing' });
    }

    try {
        // получаем данные пользователя
        const existingUser = await prisma.user.findUnique({
            where: { email: data.email }
        });

        // если данные имеются, значит, пользователь уже зарегистрирован
        if (existingUser) {
            return res.status(409).json({ message: 'Email already in use' });
        }

        // хешируем пароль
        const passwordHash = await argon2.hash(data.password);
        // и заменяем им оригинальный
        data.password = passwordHash;

        // создаём нового пользователя - записываем учетные данные пользователя в БД
        const newUser = await prisma.user.create({
            data,
            // важно!
            // не "выбираем" пароль
            select: {
                id: true,
                username: true,
                email: true,
            }
        })

        // генерируем токен ИДЕНТИФИКАЦИИ на основе id пользователя
        const idToken = await jwt.sign(
            { userId: newUser.id },
            process.env.ID_TOKEN_SECRET,
            {
                // срок жизни токена
                expiresIn: '7d'
            }
        )

        // генерируем токен ДОСТУПА на основе id пользователя
        const accessToken = await jwt.sign(
            { userId: newUser.id },
            process.env.ACCESS_TOKEN_SECRET,
            {
                // важно!
                // такой срок жизни токена доступа приемлем только при разработке приложения
                expiresIn: '1d'
            }
        )

        // записываем токен ИДЕНТИФИКАЦИИ в куки
        res.cookie({
            name: process.env.COOKIE_NAME,
            value: idToken,
            // https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Set-Cookie#attributes
            // важно!
            // настройки `httpOnly: true` и `secure: true` являются обязательными
            options: {
                httpOnly: true,

                // значение данной строки должно совпадать со значением `expiresIn` токена
                maxAge: 1000 * 60 * 60 * 24 * 7,

                // куки применяются для всего приложения
                path: '/',

                // клиент и сервер живут по одному адресу
                sameSite: true,
                secure: true,
            }
        })

        // возвращаем данные пользователя и токен доступа
        res.status(200).json({
            user: newUser,
            accessToken,
        });

    } catch (e) {
        console.log('registerHandler', e);
        res.status(500).json({ message: 'User register error' });
    }
}

export default cookies(registerHandler);
