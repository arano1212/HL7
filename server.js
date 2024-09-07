import express from 'express'
import bodyParser from 'body-parser'
// import fs from 'fs'
import dotenv from 'dotenv'
// import { processHL7Message } from './src/processHL7.js'
import config from './src/config/config.js'
import HL7Router from './src/routes/hl7Routes.js'

dotenv.config()

const hL7 = express()
const port = config.port || 8000

hL7.use(bodyParser.text({
  type: 'text/plain'
}))

/* hL7.post('/hl7', async (req, res) =>
   {
  try {
    const hl7Message = req.body
    const processedData = processHL7Message(hl7Message)

    const dir = './data'
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir)
    }

    if (!fs.existsSync(filePath)) {
      fs.writeFileSync(filePath, '')
    }

    fs.appendFileSync(filePath, processedData + '\n')
    res.status(200).send('Mensaje HL7 procesado y guardado.')
  } catch (error) {
    console.error('Error al procesar el mensaje HL7:', error)
    res.status(500).send('Error al procesar el mensaje HL7.')
  }
}) */

hL7.use('/', HL7Router)

hL7.listen(port, () => {
  console.log(`Servidor ejecutándose en http://${process.env.HOST}:${port}`)
})
