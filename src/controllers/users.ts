import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import { UserModel } from '../models/users';

dotenv.config();

export const registerUser = async (req: any, res: any) => {
  try {
    if (!req.body.password || !req.body.username || !req.body.name) {
      throw new Error();
    }
    const userExists = await UserModel.findOne({ username: req.body.username });
    if (userExists) {
      throw new Error();
    }

    bcrypt.hash(req.body.password, 10, async (err, hashedPass) => {
      if (err) {
        res.json({
          error: err,
        });
      }
      const user = new UserModel({
        username: req.body.username,
        password: hashedPass,
        resetPasswordLink: '',
        name: req.body.name,
      });
      await UserModel.create(user);
      console.log(`Added to database: ${JSON.stringify(user)}`);
      res.send(user);
    });
  } catch (err) {
    res.sendStatus(403);
  }
};

export const userLogIn = async (req: any, res: any) => {
  const { username, password } = req.body;

  try {
    const fetchedUser: any = await UserModel.findOne({ username });

    if (!fetchedUser) throw new Error();

    const userHashedPassword = fetchedUser.password;
    const isValid = await bcrypt.compare(password, userHashedPassword);

    if (!isValid) throw new Error();

    return res.status(200).json({
      user: {
        id: fetchedUser._id,
        username: fetchedUser.username,
        name: fetchedUser.name,
      },
      token: jwt.sign({ _id: fetchedUser._id }, process.env.SECRET_KEY, {
        expiresIn: 86400,
      }),
    });
  } catch (err) {
    console.error(err);
    return res.status(403).send({
      error: 'Forbidden',
    });
  }
};

export const forgotPassword = async (req: any, res: any): Promise<void> => {
  const { username } = req.body;

  try {
    const user: any = await UserModel.find({ username });
    const token = jwt.sign({ _id: user._id }, process.env.SECRET_KEY, { expiresIn: '30m' });

    const filter = { username };
    const update = { resetPasswordLink: token };
    await UserModel.findOneAndUpdate(filter, update);
  } catch (err) {
    res.sendStatus(401);
  }
};

// Reset password controller
export const resetPassword = async (req: any, res: any) => {
  const { username, password, token } = req.body;

  try {
    const user: any = await UserModel.findOne({ username });
    console.log(user);

    if (!user) throw new Error();

    if (token !== user.resetPasswordLink) throw new Error();

    const hashedPassword = await bcrypt.hash(password, 10);
    const filter = { username };
    await UserModel.findOneAndUpdate(filter, {
      password: hashedPassword,
      resetPasswordLink: '',
    });
    return res.sendStatus(200);
  } catch (err) {
    res.sendStatus(401);
  }
};

export const getUserInfo = async (req: any, res: any) => {
  try {
    const data = req.user;
    res.status(200);
    res.send({
      username: data.username,
      name: data.name,
      _id: data._id,
    });
  } catch (err) {
    res.sendStatus(403);
  }
};
