// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import { decryptFile } from "@/lib/cryptography/node";
import type { NextApiRequest, NextApiResponse } from "next";
import { APP_NAME } from "@/utils/constants";
import { ardb, arweave } from "@/utils";
import { base64StringToUint8Array } from "@/lib/cryptography/common";
import { JWKInterface } from "arweave/node/lib/wallet";

type ResponseData = {
  decryptedData?: ArrayBuffer;
  error?: string;
};

type RequestData = {
  assetTx: string;
  address: string;
  message: string;
  signature: string;
  publicKey: string;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ResponseData>
) {
  if (req.method === "POST") {
    const { assetTx, address, message, signature, publicKey } = JSON.parse(
      req.body
    ) as RequestData;

    const isSignatureValid = await arweave.crypto.verify(
      publicKey,
      base64StringToUint8Array(message),
      base64StringToUint8Array(signature)
    );

    const isAddressMatched =
      (await arweave.wallets.jwkToAddress({ n: publicKey } as JWKInterface)) ===
      address;

    if (!isSignatureValid || !isAddressMatched) {
      return res.status(400).json({ error: "Invalid Signature or Address" });
    }

    const assetTransaction = await ardb
      .search("transactions")
      .id(assetTx)
      .findOne();

    if (!assetTransaction) {
      return res.status(400).json({ error: "Invalid Asset Transaction" });
    }

    const transaction = await ardb
      .search("transactions")
      .appName(APP_NAME)
      .tags([
        { name: "Asset-Tx", values: [assetTx] },
        { name: "Purchased-By", values: [address] },
      ])
      .findOne();

    // @ts-ignore
    if (transaction || assetTransaction.owner.address === address) {
      const bufferData = await (
        await fetch(`https://arweave.net/${assetTx}`)
      ).arrayBuffer();

      const decryptedData = await decryptFile(
        bufferData,
        process.env.WALLET as string
      );

      // Set appropriate response headers
      res.setHeader("Content-Type", "application/octet-stream");
      res.setHeader("Content-Length", decryptedData.byteLength);

      // Send the ArrayBuffer as the response
      res.end(decryptedData, "binary");
      return;
    }
    return res.status(404).json({ error: "License fee not paid." });
  } else {
    return res.status(405).json({ error: "Method not allowed." });
  }
}
