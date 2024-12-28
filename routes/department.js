import express from 'express'
import authMiddleware from '../middleware/authMiddleware.js'
import { addDepartement,getDepartements,updateDepartment,getDepartment,deleteDepartment } from '../controllers/departementControllers.js'

const router = express.Router()

router.get('/',authMiddleware,getDepartements)

router.post('/add',authMiddleware,addDepartement)
router.get('/:id',authMiddleware,getDepartment)
router.put('/:id',authMiddleware,updateDepartment)
router.delete('/:id',authMiddleware,deleteDepartment)



export default router



