

import express from 'express'
import authMiddleware from '../middleware/authMiddleware.js'
import {updateTravelStatut,getTravelStatsByUser,getTravelsByUserCity,getTravels,addTravel,getTravel,addPlaceToTravel,validateTravel,deleteTravel,updateTravel, updateTerminatedStatus,getTerminatedStatus,getTravelsByUser} from '../controllers/travelController.js'

const router = express.Router()

router.get('/',authMiddleware,getTravels);
router.get('/app/:id',getTravelsByUser);
router.get('/sell',authMiddleware,getTravelsByUserCity)
router.get('/term/:id',authMiddleware,getTerminatedStatus)
router.get('/sellstat',authMiddleware,getTravelStatsByUser);
router.post('/add',authMiddleware,addTravel);
router.post('/add/app',addTravel);
router.get('/:id',authMiddleware,getTravel);
router.post('/addplace/:id',authMiddleware,addPlaceToTravel)
router.get('/validate/:id',authMiddleware,validateTravel )
router.delete('/:id',authMiddleware,deleteTravel)
router.delete('/app/:id',deleteTravel)
router.put('/app/:id',updateTravel )
router.put('/:id',updateTravel )
router.put('/term/:id',authMiddleware,updateTerminatedStatus)
router.put('/statut/:id',authMiddleware,updateTravelStatut)


//getView 


/*
router.put('/:id',authMiddleware,updateTrajet)


/*
*/

/*
//router.delete('/:id',authMiddleware,deleteDepartment)
*/


export default router










