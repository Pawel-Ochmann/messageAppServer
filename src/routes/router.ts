import express, { RequestHandler } from 'express';
import {
  main_get,
  signup_post,
  login_post,
  avatar_get,
  avatar_post,
} from '../controllers/index';
import passport from 'passport';
import multer from 'multer';
const upload = multer({ dest: 'uploads/' });

const protect = passport.authenticate('jwt', {
  session: false,
}) as RequestHandler;


const router = express.Router();

router.get('/:user/avatar', upload.single('avatar'), avatar_get);
router.get('/', protect, main_get);
router.post('/:user/avatar',  avatar_post);
router.post('/signup', signup_post);
router.post('/login', login_post);

export default router;
