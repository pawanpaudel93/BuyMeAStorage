import { Col, Image } from "antd";
import { Inter } from "next/font/google";
import Link from "next/link";

interface ImgProps {
  attach: any;
  fromUploadZone?: boolean;
}

export default function ImageCard({ attach, fromUploadZone }: ImgProps) {
  return (
    <Col
      xs={12}
      sm={6}
      md={6}
      lg={fromUploadZone ? 6 : 4}
      xl={fromUploadZone ? 6 : 3}
    >
      <Image
        width="100%"
        height={fromUploadZone ? 80 : 160}
        style={{
          boxShadow: "0 2px 4px rgba(0, 0, 0, 0.4)",
        }}
        alt={attach.attachmentName}
        src={attach.attachmentUrl}
        onClick={(e) => e.stopPropagation()}
      />
    </Col>
  );
}
