import { NextApiRequestWithUserId  } from "@/types";
import { authGuard } from "@/utils/authGuard";
import { checkFields } from "@/utils/checkFields";
import prisma from "@/utils/prisma";
import { Post } from "@prisma/client";
import { NextApiResponse } from "next";
import nextConnect from 'next-connect';

const postsHandler = nextConnect<NextApiRequestWithUserId, NextApiResponse>();

// обработка POST-запроса
// создание поста
postsHandler.post(async (req, res) => {
    // на самом деле `authorId` не содержится в теле запроса
    // он хранится в самом запросе
    const data: Pick<Post, 'title' | 'content' | 'authorId'> = JSON.parse(req.body);

    if (!checkFields(data, ['title', 'content'])) {
        res.status(400).json({ message: 'Some required fields are missing' });
    }

    // дополняем данные полем `authorId`
    data.authorId = req.userId;

    try {
        const post = await prisma.post.create({ data });
        res.status(200).json(post);
    } catch(e) {
        console.log('postsHandler.post', e);
        res.status(500).json({ message: 'Post create error' })
    }
});

// обработка PUT-запроса
// обновление поста
postsHandler.put(async (req, res) => {
    const data: Pick<Post, 'title' | 'content'> & { postId: string } = JSON.parse(req.body);

    if (!checkFields(data, ['title', 'content'])) {
        res.status(400).json({ message: 'Some required fields are missing' });
    }

    try {
        const post = await prisma.post.update({
            // гарантия того, что пользователь обновляет принадлежащий ему пост
            where: {
                id_authorId: { id: data.postId, authorId: req.userId }
            },
            data: {
                title: data.title,
                content: data.content,
            },
        });

        res.status(200).json(post);
    } catch(e) {
        console.log('postsHandler.put', e);
        res.status(500).json({ message: 'Update post error' })
    }
});

// обработка DELETE-запроса
// удаление поста
postsHandler.delete(async (req, res) => {
    const id = req.query.id as string;

    if (!id) {
        return res.status(400).json({ message: 'Post ID is missing' });
    }

    try {
        const post = await prisma.post.delete({
            where: {
                id_authorId: {
                    id,
                    authorId: req.userId,
                },
            },
        });

        res.status(200).json(post);
    } catch(e) {
        console.log('postsHandler.delete', e);
        res.status(500).json({ message: 'Post remove error' })
    }
});

export default authGuard(postsHandler);
