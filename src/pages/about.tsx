import Animate from '@/components/AnimateIn'
import CustomHead from '@/components/Head'
import NewsPreview from '@/components/NewsPreview'
import type { NewsArr } from '@/types'
import { Grid, Typography } from '@mui/material'
import type { GetStaticPropsContext, InferGetStaticPropsType } from 'next'

// компонент статической страницы
// Страница контактов состоит из блока с приветствием и 6 новостных блоков 
export default function About({ data }: InferGetStaticPropsType<typeof getStaticProps>) {
    // данные новостных блоков
    const { news } = data;

    return (
        <>
            <CustomHead title='About Page' description='This is about page' />
            <Typography variant='h4' textAlign='center' py={2}>
                About
            </Typography>

            {/* блок с приветствием */}
            <Typography variant='body1'>
                Nizhny Novgorod is a city in the European part of Russia located in the confluence
                of the Oka and the Volga rivers. The city was established in 1221 and is located
                400 km away fr om Moscow. One of the most ancient cities of trade and handicrafts in Russia.
                The Nizhny Novgorod Kremlin is the main attraction of the city and something it is rightly
                proud of. The Kremlin was built at the beginning of the sixteenth century as a military
                fortress. Nowadays, this unique open-air museum is not only a popular destination for
                regular guided tours, but also for special tours with elements of stage shows and quests.
                Rozhdestvenskaya Street is one of the central streets of the city where you can still
                see houses of the mid-18th/19th centuries. A walk along Rozhdestvenskaya Street is a
                guaranteed way to get in the perfect mood and become immersed into the atmosphere of the past.
            </Typography>

            <Typography variant='h5' textAlign='center' py={2}>
                News
            </Typography>

            {/* новостные блоки */}
            {/* превью новости содержит ссылку на соответствующую страницу */}
            <Grid container spacing={2} pb={2}>
                {news.map((n) => (
                    <Grid item md={6} lg={4} key={n.id}>
                        <Animate.FadeIn>
                            <NewsPreview news={n} />
                        </Animate.FadeIn>
                    </Grid>
                ))}
            </Grid>
        </>
    )
}

// функция генерации статического обмена с данными
export async function getStaticProps(ctx: GetStaticPropsContext) {
    let data = {
        news: [] as NewsArr
    };

    try {
        const response = await fetch(
            `https://api.jsonbin.io/v3/b/${process.env.JSONBIN_BIN_ID}?meta=false`,
            {
                headers: {
                    'X-Master-Key': process.env.JSONBIN_X_MASTER_KEY
                }
            }
        )

        if (!response.ok) {
            throw response;
        }

        data = await response.json();
    } catch(e) {
        console.log('About', 'getStaticProps', e);
    }

    return {
        props: {
            data
        },
        // данная настройка включает инкрементальную регенерацию
        // значением является время в секундах - 12 часов
        revalidate: 60 * 60 * 12
    }
}
