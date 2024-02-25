import { Request, Response, NextFunction, RequestHandler } from 'express';
import dotenv from 'dotenv';
import User from '../models/user';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import passport from 'passport';
import { UserDocument } from '../models/user';

dotenv.config();
const jwtSecret = process.env.JWT_SECRET!;

export type ControllerFunction = {
  (req: Request, res: Response, next?: NextFunction): void;
};

export type ReqBody = {
  name: string;
  password: string;
};

export const main_get: ControllerFunction = (req, res) => {
  res.json('u are in main page');
};

export const signup_post: ControllerFunction = async (req, res) => {
  const { name, password } = req.body as ReqBody;

  try {
    // Check if the username already exists
    const existingUser = await User.findOne({ name });
    if (existingUser) {
      return res.json({ done: false, message: 'Username already exists' });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create a new user
    const newUser = new User({
      name,
      password: hashedPassword,
    });

    // Save the user to the database
    await newUser.save();

    res.status(201).json({ done: true });
  } catch (error) {
    console.log('Error creating account:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const login_post: ControllerFunction = (req, res, next) => {
  const doneFunction = (err: Error | null, user: UserDocument | null) => {
    console.log('done function here', err, user);
    if (err) {
      return res.status(500).json({ error: 'Internal server error' });
    }
    if (!user) {
      return res.status(401).json('There is no user');
    }
    const token = jwt.sign({ user }, jwtSecret, {
      expiresIn: '1h',
    });
    res.status(200).json({ token });
  };
  // eslint-disable-next-line @typescript-eslint/no-unsafe-call
  passport.authenticate('local', { session: false }, doneFunction)(
    req,
    res,
    next,
  );
};
