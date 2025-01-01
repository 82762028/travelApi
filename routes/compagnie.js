import express from 'express'
import authMiddleware from '../middleware/authMiddleware.js'
import { addCompagnie,getCompagnies,getCompagnie,upload ,deleteCompagnie, editCompagnie, } from '../controllers/compagnieController.js'

const router = express.Router()

router.get('/',authMiddleware,getCompagnies)
router.get('/app',getCompagnies)
router.get('/:id',authMiddleware,getCompagnie)
router.post('/add', authMiddleware, upload.single('image'), addCompagnie);
router.put('/:id', authMiddleware, upload.single('image'), editCompagnie);
router.delete('/:id',authMiddleware,deleteCompagnie)
export default router



