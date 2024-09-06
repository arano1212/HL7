import hl7Validator from './validators/hl7Validator.js'

export function processHL7Message (hl7Message) {
  try {
    hl7Validator(hl7Message)

    const lines = hl7Message.split('\n')
    let processedData = ''

    lines.forEach(line => {
      const segments = line.split('|')

      if (segments[0] === 'OBX') {
        const pass = segments[3] || ''
        const name = segments[4] || ''
        const results = segments[5] || ''
        processedData += `Pass: ${pass}, Name: ${name}, Results: ${results}\n`
      } else if (segments[0] === 'OBR') {
        const orderNumber = segments[3] || ''
        const testName = segments[4] || ''
        const testDate = segments[7] || ''
        processedData += `Order Number: ${orderNumber}, Test Name: ${testName}, Test Date: ${testDate}\n`
      } else if (segments[0] === 'PID') {
        const patientId = segments[3] || ''
        const patientName = segments[5] || ''
        const patientDob = segments[7] || ''
        processedData += `Patient ID: ${patientId}, Patient Name: ${patientName}, DOB: ${patientDob}\n`
      } else if (segments[0] === 'MSH') {
        const messageType = segments[8] || ''
        const messageControlId = segments[9] || ''
        const sendingApplication = segments[10] || ''
        processedData += `Message Type: ${messageType}, Control ID: ${messageControlId}, Sending Application: ${sendingApplication}\n`
      }
    })

    return processedData.trim()
  } catch (error) {
    console.error('Error al procesar el mensaje HL7:', error.message)
    throw error
  }
}
