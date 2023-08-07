import { U_CONTRACT_ID } from "@/utils/constants";
import { ITag } from "@/types";

let warp: any;

async function getWarp() {
  if (warp) return warp;
  const { WarpFactory, LoggerFactory } = (<any>window).warp;
  LoggerFactory.INST.logLevel("error");
  warp = WarpFactory.forMainnet();
  return warp;
}

export async function transferU(recipient: string, qty: number, tags: ITag[]) {
  const warp = await getWarp();
  const contract = warp.contract(U_CONTRACT_ID).connect("use_wallet");
  return await contract.writeInteraction(
    {
      function: "transfer",
      target: recipient,
      qty,
    },
    { tags }
  );
}
