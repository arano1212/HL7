import dotenv from 'dotenv'
dotenv.config()

const config = {
  filePath: process.env.FILE_PATH,
  host: process.env.HOST,
  port: process.env.PORT
}

export default config
