import { getStampCount, hasStampedAsset, stampAsset } from "@/lib/stamp";
import { Button, message } from "antd";
import { useEffect, useState } from "react";
import { AiOutlineHeart, AiFillHeart } from "react-icons/ai";

export default function Stamp({ assetTx }: { assetTx: string }) {
  const [stamps, setStamps] = useState(0);
  const [hasStamped, setHasStamped] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isStamping, setIsStamping] = useState(false);

  const updateStamps = async () => {
    setLoading(true);
    try {
      const [count, stamped] = await Promise.all([
        getStampCount(assetTx),
        hasStampedAsset(assetTx),
      ]);
      setStamps(count);
      setHasStamped(stamped);
    } catch (error) {
      //
    }
    setLoading(false);
  };

  const stamp = async () => {
    setIsStamping(true);
    const { result, hasStamped } = await stampAsset(assetTx);
    if (result && hasStamped) {
      setStamps((prevCount) => prevCount + 1);
      message.success("Stamped successfully");
    } else if (!result && hasStamped) {
      message.error("Already stamped");
    }
    setIsStamping(false);
  };

  useEffect(() => {
    updateStamps();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [assetTx]);

  return (
    <Button
      type="primary"
      onClick={() => stamp()}
      loading={isStamping || loading}
      style={{
        display: "flex",
        flexDirection: "row",
        gap: "4px",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      {hasStamped ? <AiFillHeart /> : <AiOutlineHeart />}{" "}
      {isStamping ? "Stamping" : "Stamp"} {stamps}
    </Button>
  );
}
