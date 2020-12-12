import jwt from 'jsonwebtoken';
import { Request, Response } from 'express';
import { Document } from 'mongoose';
import { UserModel } from '../models/users';

interface AuthRequest extends Request {
  user?: Document;
}

const authMiddleware = async (req: AuthRequest, res: Response, next: any) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.sendStatus(403);
    const [, token] = authHeader.split(' ');

    const jwtCheck: any = jwt.verify(token, process.env.SECRET_KEY);
    const user = await UserModel.findOne({ _id: jwtCheck._id });
    if (!user) return res.sendStatus(401);
    req.user = user;
    next();
  // if user is not verified
  } catch (error) {
    res.sendStatus(403);
  }
};

export default authMiddleware;
