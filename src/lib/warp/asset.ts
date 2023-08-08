// @ts-ignore
import { WarpFactory, LoggerFactory } from "warp-contracts";
import {
  DeployPlugin,
  InjectedArweaveSigner,
  // @ts-ignore
} from "warp-contracts-plugin-deploy";
import { ATOMIC_ASSET_SRC } from "@/utils/constants";
import { ITag } from "@/types";
import { getArrayBufferSizeInKB } from "@/utils";

LoggerFactory.INST.logLevel("error");

const warp = WarpFactory.forMainnet().use(new DeployPlugin());

export const registerContract = async (txID: string) => {
  const { contractTxId } = await warp.register(txID, "node2");
  return contractTxId;
};

export const uploadAtomicAsset = async (
  tags: ITag[],
  initState: any,
  data: any
) => {
  const fileSizeInKB = getArrayBufferSizeInKB(data.body);
  const disableBundling = fileSizeInKB > 500;
  let wallet: any;
  if (disableBundling) {
    wallet = "use_wallet";
  } else {
    wallet = new InjectedArweaveSigner(window.arweaveWallet);
    await wallet.setPublicKey();
  }
  const { contractTxId } = await warp.deployFromSourceTx(
    {
      wallet,
      initState,
      data,
      tags,
      srcTxId: ATOMIC_ASSET_SRC,
    },
    disableBundling
  );

  return { id: contractTxId };
};
