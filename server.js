import express from 'express'
import bodyParser from 'body-parser'
import cors from 'cors'
// import fs from 'fs'
import dotenv from 'dotenv'
// import { processHL7Message } from './src/processHL7.js'
import { Server as SocketIOServer } from 'socket.io'
import http from 'http'
import config from './src/config/config.js'
import HL7Router from './src/routes/hl7Routes.js'

dotenv.config()

const hL7 = express()
const port = config.port || 8000
const server = http.createServer(hL7)
const io = new SocketIOServer(server, {
  cors: {
    origin: 'http://localhost:8000',
    methods: ['GET', 'POST']

  }
})
hL7.use(cors({
  origin: 'http://localhost:8000',
  methods: ['GET', 'POST'],
}))

hL7.set('socketio', io)

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

io.on('connection', (socket) => {
  console.log('Nuevo cliente conectado:', socket.id)

  io.emit('newConnection', io.engine.clientsCount)

  socket.on('disconnect', () => {
    console.log('Cliente desconectado:', socket.id)
    io.emit('newConnection', io.engine.clientsCount)
  })

  socket.on('hl7Message', (message) => {
    console.log('Mensaje HL7 recibido:', message)
    io.emit('newHL7Message', message)
  })
})

server.listen(port, () => {
  console.log(`Servidor ejecutándose en http://${process.env.HOST}:${port}`)
})

export { io }
