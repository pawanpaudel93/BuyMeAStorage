// @ts-ignore
import { WarpFactory, LoggerFactory } from "warp-contracts";
// @ts-ignore
import { DeployPlugin } from "warp-contracts-plugin-deploy";

LoggerFactory.INST.logLevel("error");

const warp = WarpFactory.forMainnet().use(new DeployPlugin());

export const registerContract = async (txID: string) => {
  const { contractTxId } = await warp.register(txID, "node2");
  return contractTxId;
};
