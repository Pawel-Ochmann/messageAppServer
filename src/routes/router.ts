import express, { RequestHandler } from 'express';
import { main_get, signup_post, login_post } from '../controllers/index';
import passport from 'passport';
// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
// const protect = passport.authenticate('jwt', {
//   session: false,
// });

const router = express.Router();

router.get('/', main_get);
router.post('/signup', signup_post);
router.post('/login', login_post);

export default router;
