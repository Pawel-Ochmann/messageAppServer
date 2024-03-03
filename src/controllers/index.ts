import { Request, Response, NextFunction } from 'express';
import dotenv from 'dotenv';
import User, { UserDocument } from '../models/user';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import passport from 'passport';
import fs from 'fs';
import path from 'path';

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
  const token = req.headers.authorization?.split(' ')[1] as string;

  type Decoded = {
    user: UserDocument;
  };

  jwt.verify(token, jwtSecret, (err, decoded) => {
    if (err) {
      return res.status(401).json({ message: 'Invalid authorization token' });
    }
    const decodedToken = decoded as Decoded;

    res.json(decodedToken.user.name);
  });
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

    const userDir = path.join(__dirname, '..', 'public', 'users', name);
    fs.mkdirSync(userDir);
    const imagesDir = path.join(userDir, 'images');
    const audioDir = path.join(userDir, 'audio');
    fs.mkdirSync(imagesDir);
    fs.mkdirSync(audioDir);

    res.status(201).json({ done: true });
  } catch (error) {
    console.log('Error creating account:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const login_post: ControllerFunction = (req, res, next) => {
  const doneFunction = (err: Error | null, user: UserDocument | null) => {
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
    next
  );
};

export const avatar_get: ControllerFunction = (req, res) => {
  const { user } = req.params;
  const imagePath = path.join(
    __dirname,
    '..',
    'public',
    'users',
    user,
    'avatar'
  );

  if (fs.existsSync(imagePath)) {
    res.sendFile(imagePath);
  } else {
    res.sendStatus(404);
  }
};

export const avatar_post: ControllerFunction = (req, res) => {
  const { user } = req.params;
  const imagePath = path.join(
    __dirname,
    '..',
    'public',
    'users',
    user,
    'avatar'
  );

  console.log(req.file);
  if (req.file) {
    const imageFile = req.file;

    // Save the file
    fs.writeFile(imagePath, imageFile.buffer, (err) => {
      if (err) {
        console.error('Error saving image:', err);
        res.status(500).send('Internal server error');
      } else {
        res.status(200).send(imagePath);
      }
    });
  } else {
    // If no file attached, delete the existing image (if any)
    fs.unlink(imagePath, (err) => {
      if (err && err.code === 'ENOENT') {
        // If file doesn't exist, send back null
        res.status(200).send(null);
      } else if (err) {
        console.error('Error deleting image:', err);
        res.status(500).send('Internal server error');
      } else {
        res.status(200).send(null);
      }
    });
  }
};
