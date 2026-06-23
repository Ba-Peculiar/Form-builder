import dotenv from 'dotenv'

dotenv.config({ quiet: true })

export const env = {
  port: Number(process.env.PORT ?? 4000),
  databaseUrl: process.env.DATABASE_URL ?? '',
}
