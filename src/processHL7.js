import hl7Validator from './validators/hl7Validator.js'

export function processHL7Message (hl7Message) {
  try {
    hl7Validator(hl7Message)

    const lines = hl7Message.split('\n')
    const result = {
      MSH: {},
      PID: {},
      OBR: {},
      OBX: []
    }

    lines.forEach(line => {
      const segments = line.split('|')

      switch (segments[0]) {
        case 'MSH':
          result.MSH = {
            messageType: segments[8],
            controlId: segments[9],
            sendingApplication: segments[10]
          }
          break
        case 'PID':
          result.PID = {
            patientId: segments[3],
            patientName: segments[5],
            dob: segments[7]
          }
          break
        case 'OBR':
          result.OBR = {
            orderNumber: segments[3],
            testName: segments[4],
            testDate: segments[7]
          }
          break
        case 'OBX':
          result.OBX.push({
            pass: segments[3],
            name: segments[4],
            results: segments[5]
          })
          break
      }
    })

    return result
  } catch (error) {
    console.error('Error al procesar el mensaje HL7:', error.message)
    throw error
  }
}
