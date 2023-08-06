import { Modal } from "antd";
import BuyStorageCard from "../Cards/BuyStorageCard";

interface IDonateModalProps {
  open: boolean;
  setOpen: any;
}

export default function DonateModal({ open, setOpen }: IDonateModalProps) {
  const cancelHandler = () => {
    setOpen(false);
  };

  return (
    <Modal
      open={open}
      onCancel={cancelHandler}
      zIndex={10}
      style={{ padding: 16 }}
      width={557}
    >
      <BuyStorageCard />
    </Modal>
  );
}
