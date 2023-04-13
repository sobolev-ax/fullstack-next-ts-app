import prisma from '@/utils/prisma';
import jwt from 'jsonwebtoken';
import { NextApiHandler } from 'next';

const userHandler: NextApiHandler = async (req, res) => {
    // извлекаем токен идентификации из куки
    const idToken = req.cookies[process.env.COOKIE_NAME];

    if (!idToken) {
        return res.status(401).json({ message: 'ID token must be provided' });
    }

    try {
        // декодируем токен
        const decodedToken = (await jwt.verify(
            idToken,
            process.env.ID_TOKEN_SECRET,
        )) as unknown as { userId: string };

        // если полезная нагрузка отсутствует
        if (!decodedToken || !decodedToken.userId) {
            return res.status(403).json({ message: 'Invalid token' });
        }

        // получаем данные пользователя
        const user = await prisma.user.findUnique({
            where: {
                id: decodedToken.userId,
            },
            // важно!
            // не получаем пароль
            select: {
                id: true,
                email: true,
                username: true,
                avatarUrl: true,
            }
        })

        // если данные отсутствуют
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // генерируем токен доступа
        const accessToken = await jwt.sign(
            { userId: user.id },
            process.env.ACCESS_TOKEN_SECRET,
            {
                expiresIn: '1d',
            },
        );

        // возвращаем данные пользователя и токен доступа
        res.status(200).json({ user, accessToken });

    } catch (e) {
        console.log('userHandler', e);
        res.status(500).json({ message: 'User get error' });
    }
}

export default userHandler;
