import '@/styles/globals.css'
import type { AppProps } from 'next/app'
import '@/utils/wdyr';

export default function App({ Component, pageProps }: AppProps) {
  return <Component {...pageProps} />
}

// Why Did You Render
// SomeComponent.whyDidYouRender = true
