import Stamps, { StampJS } from "@permaweb/stampjs";
// @ts-ignore
import { WarpFactory, LoggerFactory } from "warp-contracts";
import { arweave } from "@/utils";
import { APP_NAME } from "@/utils/constants";

LoggerFactory.INST.logLevel("error");

let stamps: StampJS;

export const initStamps = () => {
  if (stamps) return stamps;
  const warp = WarpFactory.forMainnet() as any;
  // @ts-ignore
  stamps = Stamps.init({ warp, arweave });
  return stamps;
};

export const getStampCount = async (assetTx: string) => {
  initStamps();
  const { total } = await stamps.count(assetTx);
  return total;
};

export const hasStampedAsset = async (assetTx: string) => {
  initStamps();
  return await stamps.hasStamped(assetTx);
};

export const stampAsset = async (assetTx: string) => {
  initStamps();
  const hasStamped = await stamps.hasStamped(assetTx);
  if (!hasStamped) {
    const result = await stamps.stamp(assetTx, 1, [
      { name: "App-Name", value: APP_NAME },
    ]);
    return { result, hasStamped: true };
  }
  return { result: undefined, hasStamped };
};
