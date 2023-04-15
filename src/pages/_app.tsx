import '@/styles/globals.css'
import type { AppProps } from 'next/app'
import '@/utils/wdyr';
import createEmotionCache from '@/utils/createEmotionCache';
import { CacheProvider, EmotionCache } from '@emotion/react';
import CssBaseLine from '@mui/material/CssBaseline';
import { createTheme, ThemeProvider } from '@mui/material/styles';

// настраиваем тему MUI
const theme = createTheme({
  typography: {
    fontFamily: 'Montserrat, sans-serif'
  },
  components: {
    MuiListItem: {
      styleOverrides: {
        root: {
          width: 'unset'
        }
      }
    },
    MuiListItemButton: {
      styleOverrides: {
        root: {
          flexGrow: 'unset'
        }
      }
    }
  }
});

// создаём клиентский кеш
const clientSideEmotionCache = createEmotionCache();

export default function App({ Component, pageProps, emotionCache = clientSideEmotionCache }: AppProps & { emotionCache?: EmotionCache }) {
  return (
    <>
      {/* провайдер кеша */}
      <CacheProvider value={emotionCache}>
        {/* провайдер темы */}
        <ThemeProvider theme={theme}>

          {/* сброс стилей */}
          <CssBaseLine />

          <Component {...pageProps} />

        </ThemeProvider>
      </CacheProvider>
    </>
  );
}

// Why Did You Render
// SomeComponent.whyDidYouRender = true
