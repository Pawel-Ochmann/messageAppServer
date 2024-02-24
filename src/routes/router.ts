import express from 'express';
import { main_get, signup_post,login_post } from '../controllers/index';

const router = express.Router();

router.get('/', main_get);
router.post('/signup', signup_post);
router.get('/login', login_post);

export default router;
