import { WarpFactory, LoggerFactory } from "warp-contracts";
import { DeployPlugin } from "warp-contracts-plugin-deploy";

LoggerFactory.INST.logLevel("error");

const warp = WarpFactory.forMainnet().use(new DeployPlugin());

export const registerPost = async (txID: string) => {
  const { contractTxId } = await warp.register(txID, "node2");
  return contractTxId;
};
