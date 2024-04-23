import * as crypto from 'crypto';

export const generateHash = (password: string) => {
  const SECRET_KEY = process.env.SECRET_KEY!;
  const random = () => crypto.randomBytes(128).toString('base64');
  const salt = random();

  const createHash = (password, salt) => {
    return crypto
      .createHmac('sha256', salt + password)
      .update(SECRET_KEY)
      .digest('hex');
  };

  return {
    salt: salt,
    hash: createHash(password, salt),
  };
};

export const validateHash = (password: string, salt: string, hash: string) => {
const SECRET_KEY = process.env.SECRET_KEY!;

  const createHash = (password: string, salt: string) => {
    return crypto
      .createHmac('sha256', salt + password)
      .update(SECRET_KEY)
      .digest('hex');
  };

  const newHash = createHash(password, salt);

  const isValid = newHash == hash;
  return isValid;
};
