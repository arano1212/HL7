import fs from 'fs'
import path, { dirname } from 'path'
import http from 'http'
import express from 'express'
import { Server } from 'socket.io'
import dotenv from 'dotenv'
import { fileURLToPath } from 'url'

dotenv.config()

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const serverConfig = {
  port: process.env.CLIENT_PORT || 8001,
  savePath: process.env.FILE_PATH || './data/hl7_data.txt'
}

const app = express()
const server = http.createServer(app)
const io = new Server(server, {
  cors: {
    origin: 'http://localhost:5173', // o especifica el origen exacto de tu frontend
    methods: ['GET', 'POST']
  }
})

// Middleware para servir archivos estáticos (opcional)
app.use(express.static(path.join(__dirname, 'public')))

// Controlador GET para obtener los mensajes HL7
const getHL7Messages = (req, res) => {
  try {
    const filePath = path.join(__dirname, serverConfig.savePath)
    const data = fs.readFileSync(filePath, 'utf-8')
    res.json({ messages: data.split('\n').filter(Boolean) }) // Devuelve los mensajes en formato JSON
  } catch (error) {
    console.error('Error al leer el archivo HL7:', error)
    res.status(500).send('Error al leer el archivo HL7')
  }
}

// Ruta para obtener los mensajes HL7
app.get('/api/hl7-messages', getHL7Messages)

// Función para convertir mensajes HL7 a JSON
const hl7ToJson = (hl7Message) => {
  const lines = hl7Message.split('\n')
  const result = {
    MSH: {},
    PID: {},
    OBR: {},
    OBX: []
  }

  lines.forEach((line) => {
    const segments = line.split('|')

    switch (segments[0]) {
      case 'MSH':
        result.MSH = {
          messageType: segments[8] || '',
          controlId: segments[9] || '',
          sendingApplication: segments[10] || ''
        }
        break
      case 'PID':
        result.PID = {
          patientId: segments[3] || '',
          patientName: segments[5] || '',
          dob: segments[7] || ''
        }
        break
      case 'OBR':
        result.OBR = {
          orderNumber: segments[3] || '',
          testName: segments[4] || '',
          testDate: segments[7] || ''
        }
        break
      case 'OBX':
        result.OBX.push({
          pass: segments[3] || '',
          name: segments[4] || '',
          results: segments[5] || ''
        })
        break
      default:
        // Puedes agregar lógica para manejar segmentos desconocidos aquí
        break
    }
  })

  return result
}

const writeHL7File = (hl7Message) => {
  try {
    const parsedData = hl7ToJson(hl7Message)
    const filePath = path.join(__dirname, serverConfig.savePath)

    // Convierte el objeto JSON a una cadena sin formato adicional
    const jsonData = JSON.stringify(parsedData) + '\n'

    // Agrega los datos al final del archivo
    fs.appendFileSync(filePath, jsonData, 'utf-8')
    console.log(`Mensaje HL7 agregado al archivo JSON en: ${filePath}`)
  } catch (error) {
    console.error('Error al agregar el mensaje HL7 al archivo JSON:', error)
  }
}

const readHL7File = () => {
  try {
    const filePath = path.join(__dirname, serverConfig.savePath)
    const data = fs.readFileSync(filePath, 'utf-8')
    return data
  } catch (error) {
    console.error('Error al leer el archivo HL7:', error)
    return '' // Devuelve una cadena vacía en caso de error
  }
}

const processAndSendHL7Message = (hl7Message) => {
  try {
    const parsedHL7 = hl7ToJson(hl7Message)
    io.emit('newHL7Message', parsedHL7)
    console.log('Mensaje HL7 enviado a los clientes:', parsedHL7)
  } catch (error) {
    console.error('Error al procesar y enviar el mensaje HL7:', error.message)
  }
}

const startSendingHL7Messages = () => {
  const hl7Message = readHL7File()

  // Enviar y guardar el mensaje HL7 cada 3 segundos
  setInterval(() => {
    console.log('Enviando mensaje HL7 a los clientes...')
    processAndSendHL7Message(hl7Message)
  }, 3000)
}

const saveMultipleHL7Messages = (count) => {
  const exampleHL7Message = 'MSH|^~\\&|||||20240524133800||ORU^R01|20|P|2.3.1||||0||ASCII|||PID|20|||||||O|||||||||||||||||||||||OBR|20||72|^|N|20240524112806|20240524112803|20240524112803||1^14||||20240524112803|Suero|||||||||||||||||||||||||||||||||OBX|1|NM||UREA|38.011350|mg/dL|-|N|||F||38.011350|20240524113649|||0|OBX|2|NM||Glucose (GOD-POD Method)|157.885850|mg/dL|-|N|||F||157.885850|20240524114531|||0|OBX|3|NM||Triglycerides|92.704386|mg/dL|-|N|||F||92.704386|20240524114513|||0|OBX|4|NM||Total Cholesterol|154.231338|mg/dL|-|N|||F||154.231338|20240524114101|||0|OBX|5|NM||Creatinine (Sarcosine Oxidase Method)|0.454214|mg/dL|-|N|||F||0.454214|20240524114643|||0|OBX|6|NM||Uric Acid|4.014565|mg/dL|-|N|||F||4.014565|20240524114701|||0|'

  for (let i = 0; i < count; i++) {
    writeHL7File(exampleHL7Message)
  }
}

// Guardar múltiples mensajes HL7 al iniciar el servidor (opcional)
saveMultipleHL7Messages(5)

io.on('connection', (socket) => {
  console.log('Nuevo cliente conectado')

  io.emit('newConnection', io.engine.clientsCount)

  socket.on('disconnect', () => {
    console.log('Cliente desconectado')
    io.emit('newConnection', io.engine.clientsCount)
  })
})

server.listen(serverConfig.port, () => {
  console.log(`Servidor escuchando en el puerto ${serverConfig.port}`)
  startSendingHL7Messages()
})
