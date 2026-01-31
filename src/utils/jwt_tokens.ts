import jwt from 'jsonwebtoken';
import config from '@config/index';
import { IDecodedToken } from '@constants/clients.enum';

const { api } = config;

export const generateToken = (data: any, exp = '12h') => {
  try {
    const token = jwt.sign(data, api.keys[0], { expiresIn: exp });
    return token;
  } catch (error) {
    return { error: (error as Error).message };
  }
};

export const decodeToken = (token: string):IDecodedToken => {
  try {
    const decoded = jwt.verify(token, api.keys[0]);
    return decoded as IDecodedToken;
  } catch (err) {
    throw new Error((err as Error).message || 'Error decoding Token');
  }
};
