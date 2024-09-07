import { Router } from 'express'
import { HL7Get, HL7Post } from '../controllers/hl7Controller.js'

const HL7Router = Router()

HL7Router.post('/hl7', HL7Post)
HL7Router.get('/hl7', HL7Get)

export default HL7Router
