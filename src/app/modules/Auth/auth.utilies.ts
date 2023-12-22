import jwt, { JwtPayload } from 'jsonwebtoken';

export const createToken = (
  jwtPayload: { userId: string; role: string },
  secret: string,
  expiresIn: string,
) => {
  const token = jwt.sign(jwtPayload, secret, {
    expiresIn: expiresIn,
  });
  return token;
};

export const verifyToken = (token: string, secret: string) => {
  return jwt.verify(token, secret) as JwtPayload;
};
