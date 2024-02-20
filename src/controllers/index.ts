import { Request, Response } from 'express';
import dotenv from 'dotenv';

dotenv.config();

export interface ControllerFunction {
  (req: Request, res: Response): void;
}

export const main_get: ControllerFunction = (req, res) => {
  res.json('hello there');
};
