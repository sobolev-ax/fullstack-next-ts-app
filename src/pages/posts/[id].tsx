import EditPostButton from '@/components/Buttons/EditPost'
import LikePostButton from '@/components/Buttons/LikePost'
import RemovePostButton from '@/components/Buttons/RemovePost'
import CustomHead from '@/components/Head'
import prisma from '@/utils/prisma'
import { useUser } from '@/utils/swr'
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew'
import {
  Avatar,
  Box,
  Button,
  Card,
  CardActions,
  CardContent,
  CardHeader,
  CardMedia,
  Typography
} from '@mui/material'
import type {
  GetServerSidePropsContext,
  InferGetServerSidePropsType
} from 'next'
import Link from 'next/link'

// компонент динамической страницы
export default function PostPage({
  post
}: InferGetServerSidePropsType<typeof getServerSideProps>) {
  const { user } = useUser()
  // определяем принадлежность поста пользователю
  const isPostBelongsToUser = user && user.id === post.authorId

  return (
    <>
      <CustomHead title={post.title} description={post.content.slice(0, 10)} />
      <Box py={2}>
        <Card>
          <CardHeader
            avatar={<Avatar src={post.author.avatarUrl || '/img/user.png'} />}
            action={
              <Link href='/posts'>
                <Button aria-label='return to about page'>
                  <ArrowBackIosNewIcon fontSize='small' />
                  <Typography variant='body2'>Back</Typography>
                </Button>
              </Link>
            }
            title={post.title}
            subheader={post.createdAt}
          />
          <CardMedia
            component='img'
            height='200'
            // у нет роута для загрузки изображений поста
            image='https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1172&q=80'
            alt=''
          />
          <CardContent>
            <Typography variant='body1'>{post.content}</Typography>
          </CardContent>
          {/* лайкать посты могут только авторизованные пользователи */}
          <CardActions>
            <Box display='flex' justifyContent='flex-end' gap={2} width='100%'>
              <LikePostButton post={post} />
              {/* редактировать и удалять посты могут только создавшие их пользователи */}
              {isPostBelongsToUser && (
                <>
                  <EditPostButton post={post} icon={false} />
                  <RemovePostButton
                    postId={post.id}
                    authorId={post.authorId}
                    icon={false}
                  />
                </>
              )}
            </Box>
          </CardActions>
        </Card>
      </Box>
    </>
  )
}

// функция серверного рендеринга
export async function getServerSideProps({
  params
}: GetServerSidePropsContext<{ id: string }>) {
  try {
    // получаем данные поста по id
    const post = await prisma.post.findUnique({
      where: {
        id: params?.id
      },
      select: {
        id: true,
        title: true,
        content: true,
        author: true,
        authorId: true,
        likes: true,
        createdAt: true
      }
    })
    // если данные поста отсутствуют,
    // возвращаем страницу 404
    if (!post) {
      return {
        notFound: true
      }
    }
    return {
      props: {
        post: {
          ...post,
          // предотвращаем ошибку, связанную с несериализуемостью объекта `Date`
          createdAt: new Date(post.createdAt).toLocaleDateString()
        }
      }
    }
  } catch (e) {
    console.error(e)
  }
}