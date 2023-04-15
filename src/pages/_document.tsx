import Document, { DocumentContext, Head, Html, Main, NextScript } from 'next/document'
import createEmotionCache from '@/utils/createEmotionCache';
import createEmotionServer from '@emotion/server/create-instance';

export default function MyDocument(props: any) {
  return (
    <Html lang="en">
      <Head />
      <link rel='icon' href='data:.' />
      {/* дефолтным шрифтом MUI является Roboto, мы будем использовать Montserrat */}
      <link rel='preconnect' href='https://fonts.googleapis.com' />
      <link rel='preconnect' href='https://fonts.gstatic.com' />
      <link rel='stylesheet' href='https://fonts.googleapis.com/css2?family=Montserrat:wght@300;400;500&display=swap' />
      { /* ! */}
      <meta name='emotion-insertion-point' content='' />
      {props.emotionStyleTags}
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  )
}

// `getInitialProps` принадлежит `_document` (а не `_app`),
// это совместимо с генерацией статического контента (SSG)
MyDocument.getInitialProps = async (docContext: DocumentContext) => {
  // порядок разрешения
  //
  // На сервере:
  // 1. app.getInitialProps
  // 2. page.getInitialProps
  // 3. document.getInitialProps
  // 4. app.render
  // 5. page.render
  // 6. document.render
  //
  // На сервере (ошибка):
  // 1. document.getInitialProps
  // 2. app.render
  // 3. page.render
  // 4. document.render
  //
  // На клиенте:
  // 1. app.getInitialProps
  // 2. page.getInitialProps
  // 3. app.render
  // 4. page.render

  const originalRenderPage = docContext.renderPage;

  // Кеш Emotion можно распределять между всеми запросами SSR для повышения производительности
  // Однако это может привести к глобальным побочным дефектам
  const cache = createEmotionCache();
  const { extractCriticalToChunks } = createEmotionServer(cache);

  docContext.renderPage = () => 
    originalRenderPage({
      enhanceApp: (App: any) => 
        function EnhanceApp(props) {
          return <App emotionCache={cache} {...props} />
        }
    })

  const docProps = await Document.getInitialProps(docContext);
  // Важно!
  // Это не позволяет Emotion рендерить невалидный HTML.
  // См. https://github.com/mui/material-ui/issues/26561#issuecomment-855286153
  const emotionStyles = extractCriticalToChunks(docProps.html);
  const emotionStyleTags = emotionStyles.styles.map((style) => (
    <style
      data-emotion={`${style.key} ${style.ids.join(' ')}`}
      key={style.key}
      dangerouslySetInnerHTML={{ __html: style.css }}
     />
  ))

  return {
    ...docProps,
    emotionStyleTags,
  }
}
