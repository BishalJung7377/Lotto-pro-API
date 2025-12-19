import { createHash } from 'crypto';

export const hashLotteryAccountNumber = (accountNumber: string): string => {
  return createHash('sha256').update(accountNumber.trim()).digest('hex');
};
