import { Button, message } from "antd";
import { useEffect, useState } from "react";
import { ardb, arweave, getErrorMessage } from "@/utils";
import { APP_NAME, APP_VERSION, UDL } from "@/utils/constants";
import { ITag } from "@/types";
import { useActiveAddress } from "arweave-wallet-kit";

export default function UdlPayButton({
  target,
  quantity,
  assetTx,
  licenseTags,
  hasPaid,
  setHasPaid,
}: {
  target: string;
  quantity: string;
  assetTx: string;
  licenseTags: ITag[];
  hasPaid: boolean;
  setHasPaid: React.Dispatch<React.SetStateAction<boolean>>;
}) {
  const [loading, setLoading] = useState(false);
  const connectedAddress = useActiveAddress();

  const checkHasPaid = async () => {
    const transaction = await ardb
      .search("transactions")
      .appName(APP_NAME)
      .tags([
        { name: "Asset-Tx", values: [assetTx] },
        { name: "Purchased-By", values: [connectedAddress as string] },
      ])
      .findOne();

    if (transaction) {
      setHasPaid(true);
    }
  };

  const purchaseLicense = async () => {
    setLoading(true);
    try {
      const tx = await arweave.createTransaction({
        target,
        quantity: arweave.ar.arToWinston(quantity),
      });
      const tags = [
        { name: "App-Name", value: APP_NAME },
        { name: "App-Version", value: APP_VERSION },
        { name: "Asset-Tx", value: assetTx },
        { name: "Purchased-By", value: connectedAddress as string },
        { name: "License", value: UDL },
        { name: "Payment-Type", value: "License" },
      ].concat(licenseTags);
      tags.forEach((tag) => {
        tx.addTag(tag.name, tag.value);
      });
      await arweave.transactions.sign(tx);
      const response = await arweave.transactions.post(tx);
      if (response.status !== 200) {
        throw new Error("Error purchasing license");
      }
      message.success("License successfully purchased");
    } catch (err) {
      message.error(getErrorMessage(err));
    }
    setLoading(false);
  };

  useEffect(() => {
    if (connectedAddress) {
      checkHasPaid();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [connectedAddress]);

  return (
    <Button
      type="primary"
      onClick={purchaseLicense}
      loading={loading}
      disabled={hasPaid}
      style={{
        display: "flex",
        flexDirection: "row",
        gap: "4px",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      {hasPaid ? "License Purchased" : "Purchase License"}
    </Button>
  );
}
