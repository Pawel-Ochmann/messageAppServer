import express, { RequestHandler } from 'express';
import {
  main_get,
  signup_post,
  login_post,
  avatar_get,
  avatar_post,
  images_get,
  audio_get,
  contacts_get,
} from '../controllers/index';
import passport from 'passport';
import multer from 'multer';
const upload = multer();

const protect = passport.authenticate('jwt', {
  session: false,
}) as RequestHandler;

const router = express.Router();
router.get('/:user/audio/messageId', audio_get);
router.get('/:user/images/messageId', images_get);
router.get('/:user/avatar', avatar_get);
router.get('/contacts/:user', protect, contacts_get);
router.get('/', main_get);
router.post('/:user/avatar', protect, upload.single('avatar'), avatar_post);
router.post('/signup', signup_post);
router.post('/login', login_post);

export default router;
