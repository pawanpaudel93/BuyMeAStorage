import { SetStateAction, useState } from "react";
import { Button, Modal, QRCode, Row, Space, Typography } from "antd";
import { DownloadOutlined } from "@ant-design/icons";

interface IQrModalProps {
  qrValue: string;
  open: boolean;
  setOpen: React.Dispatch<SetStateAction<boolean>>;
}

export default function QrModal({ qrValue, open, setOpen }: IQrModalProps) {
  const [isDownloading, setIsDownloading] = useState(false);

  const downloadQRCode = async () => {
    setIsDownloading(true);
    try {
      await new Promise<void>((resolve) => {
        const canvas = document
          .getElementById("myqrcode")
          ?.querySelector<HTMLCanvasElement>("canvas");

        if (canvas) {
          const url = canvas.toDataURL();
          const a = document.createElement("a");
          a.download = "QRCode.png";
          a.href = url;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
        }
        resolve();
      });
    } catch (error) {
      console.error("Error while downloading QR code:", error);
    }
    setIsDownloading(false);
  };

  return (
    <Modal
      open={open}
      onCancel={() => setOpen(false)}
      footer={null}
      title={<Row justify="center">Download QR Code</Row>}
      style={{
        textAlign: "center",
      }}
    >
      <Row>
        <Typography.Text style={{ color: "gray" }}>
          Generate a custom QR code for your page and give your supporters a
          quick and touch-free checkout option.
        </Typography.Text>
      </Row>
      <Row id="myqrcode" justify="center" style={{ padding: 12 }}>
        <Space direction="vertical" size={2}>
          <QRCode
            value={qrValue}
            style={{ marginBottom: 16 }}
            icon="/icon.svg"
          />
          <Button
            type="primary"
            icon={<DownloadOutlined />}
            onClick={downloadQRCode}
            loading={isDownloading}
          >
            Download
          </Button>
        </Space>
      </Row>
    </Modal>
  );
}
