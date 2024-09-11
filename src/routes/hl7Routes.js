import { Router } from 'express'
import { HL7Get, HL7Post, HL7Search } from '../controllers/hl7Controller.js'

const HL7Router = Router()

HL7Router.post('/hl7', HL7Post)
HL7Router.get('/hl7', HL7Get)
HL7Router.get('/serach', HL7Search)

export default HL7Router
