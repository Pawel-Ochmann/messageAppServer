/* eslint-disable @typescript-eslint/no-unsafe-call */
import { Request, Response, NextFunction } from 'express';
import dotenv from 'dotenv';
import UserModel, { UserType } from '../models/user';
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
    user: UserType;
  };

  jwt.verify(token, jwtSecret, async (err, decoded) => {
    if (err) {
      return res.status(401).json({ message: 'Invalid authorization token' });
    }
    const decodedToken = decoded as Decoded;
    const decodedUser = await UserModel.findById(
      decodedToken.user._id
    ).populate('conversations');
    if (!decodedUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    decodedUser.password = 'Access not permitted';

    res.json(decodedUser);
  });
};

export const signup_post: ControllerFunction = async (req, res) => {
  const { name, password } = req.body as ReqBody;

  try {
    // Check if the username already exists
    const existingUser = await UserModel.findOne({ name });
    if (existingUser) {
      return res.json({ done: false, message: 'Username already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new UserModel({
      name,
      password: hashedPassword,
    });

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
  const doneFunction = (err: Error | null, user: UserType | null) => {
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
    fs.unlink(imagePath, (err) => {
      if (err && err.code === 'ENOENT') {
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

export const images_get: ControllerFunction = (req, res) => {
  const { user, messageId } = req.params;
  const imagePath = path.join(
    __dirname,
    '..',
    'public',
    'users',
    user,
    'images',
    messageId
  );

  if (fs.existsSync(imagePath)) {
    res.sendFile(imagePath);
  } else {
    res.sendStatus(404);
  }
};

export const audio_get: ControllerFunction = (req, res) => {
  const { user, messageId } = req.params;
  const audioPath = path.join(
    __dirname,
    '..',
    'public',
    'users',
    user,
    'audio',
    messageId
  );

  if (fs.existsSync(audioPath)) {
    res.sendFile(audioPath);
  } else {
    res.sendStatus(404);
  }
};

export const contacts_get = async (req: Request, res: Response) => {
  try {
    const userName = req.params.user;
    const users: UserType[] = await UserModel.find();
    const contacts = users.filter((user) => user.name !== userName);

    res.json(contacts);
  } catch (error) {
    console.error('Error fetching contacts:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

export const groupImage_get: ControllerFunction = (req, res) => {
  const { key } = req.params;
  const imagePath = path.join(
    __dirname,
    '..',
    'public',
    'groupImages',
    key,
  );

  if (fs.existsSync(imagePath)) {
    res.sendFile(imagePath);
  } else {
    res.sendStatus(404);
  }
};