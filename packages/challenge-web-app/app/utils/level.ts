/**
 * 通过分数获取成就等级
 * 成就等级计算公式：level = floor(sqrt(score / 50)) + 1
 * 其中 score 是成就分数，50 是每个等级的基准分数
 * @param score 成就分数
 * @returns 成就等级
 */
export function getLevel(score: number): number {
   if (score < 0) {
      return 1;
   }
   return Math.floor(Math.sqrt(score / 50)) + 1;
}

/**
 * 通过成就等级获取对应的分数
 * 成就等级计算公式：score = 50 * (level - 1) ^ 2
 * @param level 成就等级
 * @returns 成就分数
 */
export function getLevelScore(level: number): number {
   return Math.floor(50 * (level - 1) ** 2);
}
