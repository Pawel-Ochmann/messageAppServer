import { Request, Response } from 'express';
import dotenv from 'dotenv';
import User from '../models/user';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken'

dotenv.config();

export type ControllerFunction = {
  (req: Request, res: Response): void;
}

export type ReqBody = {
    name:string;
    password:string
  }

export const main_get: ControllerFunction = (req, res) => {
  res.json('hello there');
};

export const signup_post: ControllerFunction = async (req, res) => {


  const { name, password } = req.body as ReqBody;

  try {
    // Check if the username already exists
    const existingUser = await User.findOne({ name });
    if (existingUser) {
      return res.json({ done:false, message: 'Username already exists' });
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

    res.status(201).json({ done:true });
  } catch (error) {
    console.log('Error creating account:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const login_post: ControllerFunction = async (req, res) => {
  const { name, password } = req.body as ReqBody;

  try {
    // Check if the user exists
    const user = await User.findOne({ name });
    if (!user) {
      return res
        .status(401)
        .json({ done: false, message: 'Invalid username or password' });
    }

    // Check if the password is correct
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res
        .status(401)
        .json({ done: false, message: 'Invalid username or password' });
    }

    // Generate JWT token
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET!, {
      expiresIn: '10m',
    });

    res.status(200).json({ done: true, token });
  } catch (error) {
    console.error('Login failed:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

