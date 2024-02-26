import express, { RequestHandler } from 'express';
import { main_get, signup_post, login_post } from '../controllers/index';
import passport from 'passport';

const protect = passport.authenticate('jwt', {
  session: false,
}) as RequestHandler;

const router = express.Router();

router.get('/', protect, main_get);
router.post('/signup', signup_post);
router.post('/login', login_post);

export default router;
