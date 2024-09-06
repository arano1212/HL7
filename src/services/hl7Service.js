import axios from 'axios'

const BASE_URL = 'http://localhost:8000/hl7'

export const sendHL7Message = async (hl7Message) => {
  try {
    const response = await axios.post(BASE_URL, hl7Message, {
      headers: { 'Content-Type': 'text/plain' }
    })
    console.log('Mensaje HL7 enviado exitosamente', response.data)
    return response.data
  } catch (error) {
    console.error('Error al enviar el mensaje HL7')
    throw error
  }
}
