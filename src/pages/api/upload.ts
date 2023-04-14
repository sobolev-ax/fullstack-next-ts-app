import { NextApiRequestWithUserId  } from "@/types";
import { authGuard } from "@/utils/authGuard";
import prisma from "@/utils/prisma";
import multer from "multer";
import { NextApiResponse } from "next";
import nextConnect from 'next-connect';

// создаём обработчик файлов
const upload = multer({
    storage: multer.diskStorage({
        // определяем директорию для хранения аватаров пользователей
        destination: './public/avatars',

        // важно!
        // названием файла является идентификатор пользователя + расширение исходного файла
        // это реализовано на клиенте
        filename: (req, file, cb) => cb(null, file.originalname),
    })
})

// создаём роут
const uploadHandler = nextConnect<
    NextApiRequestWithUserId & { file?: Express.Multer.File },
    NextApiResponse
>();

// добавляем посредника
// важно !
// поле для загрузки файла на клиенте должно называться `avatar`
// <input type="file" name="avatar" />
uploadHandler.use(upload.single('avatar'));

// обрабатываем POST-запрос
uploadHandler.post(async (req, res) => {
    // multer сохраняет файл в директории `public/avatars`
    // и записывает данные файла в объект `req.file`
    if (!req.file) {
        return res.status(500).json({ message: 'File write error' });
    }

    try {
        // обновляем данные пользователя
        const user = await prisma.user.update({
            // идентификатор пользователя хранится в объекте запроса
            // после обработки запроса посредником `authGuard`
            where: { id: req.userId },

            data: {
                // удаляем `public`
                avatarUrl: req.file.path.replace('public', ''),
            },

            // важно!
            // не получаем пароль
            select: {
                id: true,
                username: true,
                avatarUrl: true,
                email: true,
            },
        });

        // возвращаем данные пользователя
        res.status(200).json(user);

    } catch(e) {
        console.log('uploadHandler.post', e);
        res.status(500).json({ message: 'User update error' });
    }
});

// роут является защищённым
export default authGuard(uploadHandler);

// важно!
// отключаем преобразование тела запроса в JSON
export const config = {
    api: {
        bodyParser: false,
    },
}

