import passport from 'passport';
import { Strategy as LocalStrategy } from 'passport-local';
import { Strategy as JwtStrategy, ExtractJwt } from 'passport-jwt';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

dotenv.config();
const secretKey = process.env.JWT_SECRET as string;

import User from './/models/user'; // Import your User model

// Local strategy for username/password login
passport.use(
  new LocalStrategy(async (username, password, done) => {
    try {
      const user = await User.findOne({ name:username });
      if (!user) {
        return done(null, false, { message: 'Incorrect username.' });
      }
      const isPasswordValid = await bcrypt.compare(password, user.password);

      if (!isPasswordValid) {
        return done(null, false, { message: 'Incorrect password.' });
      }

      return done(null, user);
    } catch (error) {
      return done(error);
    }
  })
);

passport.use(
  new JwtStrategy(
    {
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: secretKey,
    },
    async (jwtPayload, done) => {
      try {
        const user = await User.findById(jwtPayload.user._id);
        if (!user) {
          return done(null, false);
        }
        return done(null, user);
      } catch (error) {
        return done(error);
      }
    }
  )
);

export default passport;
