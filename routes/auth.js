
import express from 'express'
import { login ,verify} from '../controllers/authController.js'
import authMiddleware from '../middleware/authMiddleware.js'
import { updateUser,getUserDetails  } from '../controllers/authController.js';
const route = express.Router()

route.post('/login',login)
route.get('/verify',authMiddleware,verify)

route.put('/update', authMiddleware, updateUser);
route.get('/me',authMiddleware, getUserDetails);

export default route;





