

import express from 'express'
import authMiddleware from '../middleware/authMiddleware.js'
import {addTrajet,getTrajets,getTrajet,addHourToTrajet,updateTrajet,deleteTrajet} from '../controllers/trajetController.js'

const router = express.Router()

router.get('/',authMiddleware,getTrajets)

router.get('/app',getTrajets)
router.post('/add',authMiddleware,addTrajet)

router.get('/:id',authMiddleware,getTrajet)
router.put('/:id',authMiddleware,updateTrajet)
router.post('/addhours/:id',authMiddleware,addHourToTrajet)
router.delete('/:id',authMiddleware,deleteTrajet)


/*
router.put('/:id',authMiddleware,updateUser)
*/

/*
//router.delete('/:id',authMiddleware,deleteDepartment)
*/


export default router










