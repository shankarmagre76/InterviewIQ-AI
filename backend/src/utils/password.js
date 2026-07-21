import bcrypt from 'bcryptjs';

/**
 * Hash plain text password using bcrypt
 * @param {string} password
 * @param {number} [saltRounds=10]
 * @returns {Promise<string>}
 */
export const hashPassword = async (password, saltRounds = 10) => {
  const salt = await bcrypt.genSalt(saltRounds);
  return await bcrypt.hash(password, salt);
};

/**
 * Compare raw password with hashed password
 * @param {string} rawPassword
 * @param {string} hashedPassword
 * @returns {Promise<boolean>}
 */
export const comparePassword = async (rawPassword, hashedPassword) => {
  return await bcrypt.compare(rawPassword, hashedPassword);
};
