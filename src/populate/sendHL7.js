import { sendHL7Message } from '../services/hl7Service.js'
import hl7Validator from './validators/hl7Validator.js'

const hl7Message = `
MSH|^~\\&|||||20240524133800||ORU^R01|20|P|2.3.1||||0||ASCII|||
PID|20|||||||O|||||||||||||||||||||||
OBR|20||72|^|N|20240524112806|20240524112803|20240524112803||1^14||||20240524112803|Suero|||||||||||||||||||||||||||||||||
OBX|1|NM||UREA|38.011350|mg/dL|-|N|||F||38.011350|20240524113649|||0|
OBX|2|NM||Glucose (GOD-POD Method)|157.885850|mg/dL|N|||F||157.885850|20240524114531|||0|
OBX|3|NM||Triglycerides|92.704386|mg/dL|N|||F||92.704386|20240524114513|||0|
OBX|4|NM||Total Cholesterol|154.231338|mg/dL|N|||F||154.231338|20240524114101|||0|
OBX|5|NM||Creatinine (Sarcosine Oxidase Method)|0.454214|mg/dL|N|||F||0.454214|20240524114643|||0|
OBX|6|NM||Uric Acid|4.014565|mg/dL|N|||F||4.014565|20240524114701|||0|
`
try {
  hl7Validator(hl7Message)

  sendHL7Message(hl7Message)
    .then((data) => {
      console.log('Respuesta del servidor', data)
    })
    .catch((error) => {
      console.error('Error al enviar el mensaje HL7', error)
    })
} catch (error) {
  console.error('Error en la validación del mensaje HL7:', error.message)
}
