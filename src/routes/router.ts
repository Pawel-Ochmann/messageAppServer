import express from 'express';
import { main_get, signup_post, login_get } from '../controllers/index';

const router = express.Router();

router.get('/', main_get);
router.post('/signup', signup_post);
router.get('/login', login_get);

export default router;
