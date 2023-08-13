import Stamps, { StampJS } from "@permaweb/stampjs";
import {
  InjectedArweaveSigner,
  // @ts-ignore
} from "warp-contracts-plugin-deploy";
// @ts-ignore
import { WarpFactory, LoggerFactory } from "warp-contracts";
import { APP_NAME } from "@/utils/constants";
import { arweave } from "@/utils";

LoggerFactory.INST.logLevel("error");

let stamps: StampJS;

export const initStamps = () => {
  if (stamps) return stamps;
  // @ts-ignore
  const { host, port, protocol } = arweave.api.config;
  stamps = Stamps.init({
    warp: WarpFactory.forMainnet(),
    arweave,
    wallet: new InjectedArweaveSigner(window.arweaveWallet),
    graphql: `${protocol}://${host}${port ? `:${port}` : ""}/graphql`,
  });
  return stamps;
};

export const getStampCount = async (assetTx: string) => {
  const stamps = initStamps();
  const { total } = await stamps.count(assetTx);
  return total;
};

export const hasStampedAsset = async (assetTx: string) => {
  const stamps = initStamps();
  return await stamps.hasStamped(assetTx);
};

export const stampAsset = async (assetTx: string) => {
  const stamps = initStamps();
  const hasStamped = await stamps.hasStamped(assetTx);
  if (!hasStamped) {
    const result = await stamps.stamp(assetTx, 1, [
      { name: "App-Name", value: APP_NAME },
    ]);
    return { result, hasStamped: true };
  }
  return { result: undefined, hasStamped };
};
