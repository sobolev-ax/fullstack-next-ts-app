import Animate from '@/components/AnimateIn'
import CreatePostButton from '@/components/Buttons/CreatePost'
import CustomHead from '@/components/Head'
import PostPreview from '@/components/PostPreview'
import prisma from '@/utils/prisma'
import { Divider, Grid, Typography } from '@mui/material'
import type {
  GetServerSidePropsContext,
  InferGetServerSidePropsType
} from 'next'

// компонент динамической страницы
export default function Posts({
  posts
}: InferGetServerSidePropsType<typeof getServerSideProps>) {
  return (
    <>
      <CustomHead title='Blog Page' description='This is Blog Page' />
      {/* кнопка для создания поста */}
      <CreatePostButton />
      <Divider />
      <Typography variant='h4' textAlign='center' py={2}>
        Posts
      </Typography>
      {/* список постов или сообщение об их отсутствии */}
      {posts.length ? (
        <Grid container spacing={2} pb={2}>
          {posts.map((post) => (
            <Grid item md={6} lg={4} key={post.id}>
              <Animate.FadeIn>
                <PostPreview post={post} />
              </Animate.FadeIn>
            </Grid>
          ))}
        </Grid>
      ) : (
        <Typography mt={2}>There are no posts yet</Typography>
      )}
    </>
  )
}

// функция серверного рендеринга
export async function getServerSideProps(ctx: GetServerSidePropsContext) {
  try {
    // получаем все посты из БД
    const posts = await prisma.post.findMany({
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
    return {
      props: {
        posts: posts.map((post) => ({
          ...post,
          // предотвращаем ошибку, связанную с несериализуеомстью объекта `Date`
          createdAt: new Date(post.createdAt).toLocaleDateString()
        }))
      }
    }
  } catch (e) {
    console.log(e)
    return {
      props: {
        posts: []
      }
    }
  }
}
