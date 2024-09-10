import { bundler } from '@/services';
import { UserOperationReceipt } from '@/types/accountAbstraction';

const fetchReceiptWithTimeout = (hash: string, timeout: number): Promise<UserOperationReceipt | null> =>
  new Promise((resolve, reject) => {
    const start = Date.now();

    const checkReceipt = async () => {
      if (Date.now() - start > timeout) {
        return reject(new Error('Timeout: User operation receipt not found within the expected time.'));
      }

      const receipt = await bundler.fetchUserOperationReceipt(hash);
      if (receipt) {
        resolve(receipt);
      } else {
        setTimeout(checkReceipt, 3000);
      }
    };

    checkReceipt();
  });

export const processUserOperations = async (bundlerDataValue: any[]): Promise<UserOperationReceipt[]> => {
  const results = await Promise.all(
    bundlerDataValue.map(async (data) => {
      if (data && data.result) {
        const userOpHash = data.result;
        try {
          const userOpReceipt = await fetchReceiptWithTimeout(userOpHash, 60000);
          console.log('🚀 ~ userOpReceipt:', userOpReceipt);
          return userOpReceipt;
        } catch (error) {
          console.error('Error fetching receipt:', error);
          return null;
        }
      }
      return null;
    }),
  );

  return results.filter((receipt): receipt is UserOperationReceipt => receipt !== null);
};
