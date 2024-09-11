import fs from 'fs'
import { processHL7Message } from '../processHL7.js'
import config from '../config/config.js'
import { io } from '../../server.js'

const HL7Post = async (req, res) => {
  try {
    const hl7Message = req.body
    const processedData = processHL7Message(hl7Message)

    const dir = './data'
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir)
    }

    if (!fs.existsSync(config.filePath)) {
      fs.writeFileSync(config.filePath, '')
    }

    fs.appendFileSync(config.filePath, JSON.stringify(processedData) + '\n')

    io.emit('newMessage', { message: processedData })
    console.log('Nuevo mensaje HL7 recibido y emitido:', processedData)

    res.status(200).send('Mensaje HL7 procesado y guardado.')
  } catch (error) {
    console.error('Error al procesar el mensaje HL7:', error)
    res.status(500).send('Error al procesar el mensaje HL7.')
  }
}

const HL7Get = async (_req, res) => {
  try {
    if (!fs.existsSync(config.filePath)) {
      return res.status(404).send('No se ha encontrado el archivo de mensajes HL7.')
    }

    const data = fs.readFileSync(config.filePath, 'utf-8')
    console.log('Contenido del archivo HL7:', data)
    res.status(200).send(data)
  } catch (error) {
    console.error('Error al obtener los mensajes HL7:', error)
    res.status(500).send('Error al obtener los mensajes HL7.')
  }
}

const HL7Search = async (req, res) => {
  try {
    const { folio, nombreEstudio, mostrar, inicio, fin } = req.query

    if (!fs.existsSync(config.filePath)) {
      return res.status(404).send('No se ha encontrado el archivo de mensajes HL7.')
    }

    const data = fs.readFileSync(config.filePath, 'utf-8')
    const messages = data.split('\n').filter(Boolean)

    const filteredMessages = messages.filter(message => {
      try {
        const parsedMessage = JSON.parse(message)
        const matchesFolio = !folio || (parsedMessage.folio && parsedMessage.folio.includes(folio))
        const matchesNombreEstudio = !nombreEstudio || (parsedMessage.nombreEstudio && parsedMessage.nombreEstudio.includes(nombreEstudio))
        const matchesMostrar = !mostrar || (parsedMessage.mostrar && parsedMessage.mostrar === mostrar)
        const matchesInicio = !inicio || (parsedMessage.fecha && new Date(parsedMessage.fecha) >= new Date(inicio))
        const matchesFin = !fin || (parsedMessage.fecha && new Date(parsedMessage.fecha) <= new Date(fin))

        return matchesFolio && matchesNombreEstudio && matchesMostrar && matchesInicio && matchesFin
      } catch (error) {
        console.error('Error al parsear el mensaje:', error)
        return false
      }
    })

    res.status(200).send(filteredMessages)
  } catch (error) {
    console.error('Error al procesar los datos de búsqueda:', error)
    res.status(500).send('Error al procesar los datos de búsqueda.')
  }
}

export {
  HL7Post,
  HL7Get,
  HL7Search
}
