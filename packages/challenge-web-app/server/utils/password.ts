import bcrypt from 'bcrypt';

const SALT_ROUNDS = 10;

/**
 * 加密密码
 * @param password 待加密的密码
 * @returns 哈希加密后的密码
 * @description 使用 bcrypt 库对密码进行哈希加密，使用默认的盐轮数（10）。
 */
export const hashPassword = async (password: string) => {
   const hash = await bcrypt.hash(password, SALT_ROUNDS);
   return hash;
};

/**
 * 比较密码
 * @param password 待比较的密码
 * @param hash 已加密的密码哈希
 * @returns 如果密码匹配则返回 true，否则返回 false
 * @description 使用 bcrypt 库比较明文密码和哈希密码。
 */
export const comparePassword = async (password: string, hash: string) => {
   const isMatch = await bcrypt.compare(password, hash);
   return isMatch;
};
