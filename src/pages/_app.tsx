import { ChakraProvider } from '@chakra-ui/react'
import { AppProps } from 'next/app'
import '../app/globals.css'


export default function App({ Component, pageProps }: AppProps) {
  return (
    <ChakraProvider>
      <Component {...pageProps} />
    </ChakraProvider>
  )
}