import Animate, { SLIDE_DIRECTION } from '@/components/AnimateIn'
import CustomHead from '@/components/Head'
import Slider from '@/components/Slider'
import type { Blocks } from '@/types'
import { useUser } from '@/utils/swr'
import { Box, Grid } from '@mui/material'
import Typography from '@mui/material/Typography'
import type { GetStaticPropsContext, InferGetStaticPropsType } from 'next'
import Image from 'next/image'
// модули Node.js
import { readFile } from 'node:fs/promises'
import { join } from 'node:path'

// компонент статической страницы
export default function Home({ data }: InferGetStaticPropsType<typeof getStaticProps>) {
  // данные информационных блоков
  const { blocks } = data;
  const { user } = useUser();

  return (
    <>
      <CustomHead title='Home Page' description='This is Home Page' />

      <Typography variant='h4' textAlign='center' py={2}>
        Welcome, { user ? user.username || user.email : 'stranger' }
      </Typography>

      {/* слайдер */}
      <Slider slides={blocks} />

      {/* информационные блоки */}
      <Box my={2}>
        {blocks.map((block, i) => {
          return (
            <Animate.SlideIn
              // самописная библиотека анимации 
              key={block.id}
              direction={i % 2 ? SLIDE_DIRECTION.RIGHT : SLIDE_DIRECTION.LEFT}
            >
              <Grid container spacing={2} my={4}>
                {i % 2 ? (
                  <>
                    <Grid item md={6}>
                      <Typography variant='h5'>{block.title}</Typography>
                      <Typography variant='body1' mt={2}>{block.description}</Typography>
                    </Grid>
                    <Grid item md={6}>
                      <Image
                        width={1024}
                        height={320}
                        src={block.imgSrc}
                        alt={block.imgAlt}
                        style={{
                          borderRadius: '6px'
                        }}
                      />
                    </Grid>
                  </>
                ) : (
                  <>
                    <Grid item md={6}>
                      <Image
                        width={1024}
                        height={320}
                        src={block.imgSrc}
                        alt={block.imgAlt}
                        style={{
                          borderRadius: '6px'
                        }}
                      />
                    </Grid>
                    <Grid item md={6}>
                      <Typography variant='h5'>{block.title}</Typography>
                      <Typography variant='body1' mt={2}>{block.description}</Typography>
                    </Grid>
                  </>
                )}
              </Grid>
            </Animate.SlideIn>
          )
        })}
      </Box>
    </>
  )
}

// функция генерации статического контента с данными
export async function getStaticProps(ctx: GetStaticPropsContext) {
  let data = {
    blocks: [] as Blocks
  }

  // путь к данным
  const dataPath = join(process.cwd(), 'public/data/home.json');

  try {
    // читаем файл
    const dataJson = await readFile(dataPath, 'utf-8');

    if (dataJson) {
      // преобразуем данные из строки JSON в объект JS
      data = JSON.parse(dataJson);
    }
  } catch(e) {
    console.log('Home', 'getStaticProps', e);
  }

  // передаём данные компоненту страницы в виде пропса
  return {
    props: {
      data
    }
  }
}
