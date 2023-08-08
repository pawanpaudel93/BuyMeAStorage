import { arweave } from "@/utils";
import Transaction from "arweave/node/lib/transaction";

const ACCEPTED_DISPATCH_SIZE = 120 * Math.pow(10, 3);

export const dispatchTransaction = async (tx: Transaction, walletApi: any) => {
  const numBytes = parseInt(tx.data_size);
  if (numBytes <= ACCEPTED_DISPATCH_SIZE) {
    await walletApi?.sign(tx);
    const result = await walletApi?.dispatch(tx);
    return result;
  } else {
    await walletApi?.sign(tx);
    const status = await arweave.transactions.post(tx);
    if (status.status === 200) {
      return { id: tx.id };
    } else {
      throw new Error(status.statusText);
    }
  }
};
