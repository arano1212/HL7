const hl7Validator = (hl7Message) => {
  try {
    const segments = hl7Message.split('\n')

    console.log('Segmentos:', segments)

    if (segments[0].split('|')[0] !== 'MSH') {
      throw new Error('El primer segmento debe ser MSH')
    }

    if (segments[1].split('|')[0] !== 'PID') {
      throw new Error('El segundo segmento debe ser PID')
    }

    if (segments[2].split('|')[0] !== 'OBR') {
      throw new Error('El tercer segmento debe ser OBR')
    }
    const obxSegments = segments.filter(segment => segment.split('|')[0] === 'OBX')
    if (obxSegments.length === 0) {
      throw new Error('Debe haber al menos un segmento OBX')
    }
    const mshSegment = segments[0].split('|')
    if (!mshSegment[6]) {
      throw new Error('El segmento MSH debe contener un timestamp válido en el campo 7')
    }

    return true
  } catch (error) {
    throw new Error(`Error en la validación del mensaje HL7: ${error.message}`)
  }
}

export default hl7Validator
