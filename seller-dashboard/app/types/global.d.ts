declare global {
  namespace NodeJS {
    interface ProcessEnv {
      COOKIE_SECRET: string
      GOOGLE_CLIENT_ID: string
      GOOGLE_CLIENT_SECRET: string
      APP_URL: string
    }
  }
}

export { }
