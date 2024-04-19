/* eslint-disable node/no-unsupported-features/node-builtins */
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

    const usersDir = path.join(__dirname, '..', 'users');

    const userDir = path.join(usersDir, name);
    try {
      await fs.promises.access(userDir);
    } catch (err) {
      const error = err as NodeJS.ErrnoException;
      if (error.code === 'ENOENT') {
        await fs.promises.mkdir(userDir);
        console.log('users directory successfully created:', userDir);
      } else {
        throw error;
      }
    }

    const imagesDir = path.join(userDir, 'images');
    const audioDir = path.join(userDir, 'audio');

    await fs.promises.mkdir(imagesDir);
    await fs.promises.mkdir(audioDir);

    res.status(201).json({ done: true });
  } catch (error) {
    console.log('Error creating account:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const login_post: ControllerFunction = (req, res, next) => {
  const doneFunction = (err: Error | null, user: UserType | null) => {
    if (err) {
      return res
        .status(500)
        .json({ done: false, message: 'Internal server error' });
    }
    if (!user) {
      return res
        .status(401)
        .json({ done: false, message: 'Invalid username or password' });
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

export const avatar_get: ControllerFunction = async (req, res) => {
  const { user } = req.params;
  const imagePath = path.join(__dirname, '..', 'users', user, 'avatar');

  try {
    await fs.promises.access(imagePath);
    res.sendFile(imagePath);
  } catch (error) {
    const err = error as NodeJS.ErrnoException;
    if (err.code === 'ENOENT') {
      res.sendStatus(404);
    } else {
      console.error('Error accessing file:', err);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
};
export const avatar_post: ControllerFunction = (req, res) => {
  const { user } = req.params;
  const imagePath = path.join(__dirname, '..', 'users', user, 'avatar');

  if (req.file) {
    const imageFile = req.file;

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

export const images_get: ControllerFunction = async (req, res) => {
  const { user, messageId } = req.params;
  const imagePath = path.join(
    __dirname,
    '..',
    'users',
    user,
    'images',
    messageId
  );

  try {
    await fs.promises.access(imagePath);
    res.sendFile(imagePath);
  } catch (error) {
    const err = error as NodeJS.ErrnoException;
    if (err.code === 'ENOENT') {
      res.sendStatus(404);
    } else {
      console.error('Error accessing file:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
};

export const audio_get: ControllerFunction = async (req, res) => {
  const { user, messageId } = req.params;
  const audioPath = path.join(
    __dirname,
    '..',
    'users',
    user,
    'audio',
    messageId
  );

  try {
    await fs.promises.access(audioPath);
    res.sendFile(audioPath);
  } catch (error) {
    const err = error as NodeJS.ErrnoException;
    if (err.code === 'ENOENT') {
      res.sendStatus(404);
    } else {
      console.error('Error accessing file:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
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

export const groupImage_get: ControllerFunction = async (req, res) => {
  const { key } = req.params;
  const imagePath = path.join(__dirname, '..', 'groupImages', key);

  try {
    await fs.promises.access(imagePath);
    res.sendFile(imagePath);
  } catch (error) {
    const err = error as NodeJS.ErrnoException;
    if (err.code === 'ENOENT') {
      res.sendStatus(404);
    } else {
      console.error('Error accessing file:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
};
