import { Request, Response } from 'express';
import dotenv from 'dotenv';
import User from '../models/user';
import bcrypt from 'bcryptjs';

dotenv.config();

export type ControllerFunction = {
  (req: Request, res: Response): void;
}

export type ReqBody = {
    username:string;
    password:string
  }

export const main_get: ControllerFunction = (req, res) => {
  res.json('hello there');
};

export const signup_post: ControllerFunction = async (req, res) => {


  const { username, password } = req.body as ReqBody;

  try {
    // Check if the username already exists
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.json({ message: 'Username already exists' });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create a new user
    const newUser = new User({
      username,
      password: hashedPassword,
    });

    // Save the user to the database
    await newUser.save();

    res.status(201).json({ message: 'Account created successfully' });
  } catch (error) {
    console.log('Error creating account:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const login_get: ControllerFunction = (req, res) => {
  res.json('hello there');
};

