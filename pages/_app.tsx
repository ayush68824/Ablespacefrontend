import type { AppProps } from 'next/app'
import { SWRConfig } from 'swr'
import { AuthProvider } from '@/contexts/AuthContext'
import '@/styles/globals.css'
import api from '@/lib/api'

export default function App({ Component, pageProps }: AppProps) {
  return (
    <SWRConfig
      value={{
        fetcher: (url: string) => api.get(url).then((res) => res.data),
        revalidateOnFocus: false
      }}
    >
      <AuthProvider>
        <Component {...pageProps} />
      </AuthProvider>
    </SWRConfig>
  )
}



