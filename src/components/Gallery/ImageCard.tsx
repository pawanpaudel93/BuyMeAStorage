import { Col, Image } from "antd";
import { Inter } from "next/font/google";
import Link from "next/link";

interface ImgProps {
  attach: any;
  fromUploadZone?: boolean;
}

export default function ImageCard({ attach, fromUploadZone }: ImgProps) {
  return fromUploadZone ? (
    <Image
      width="100%"
      style={{
        boxShadow: "0 2px 4px rgba(0, 0, 0, 0.4)",
        maxHeight: 142,
      }}
      alt={attach.attachmentName}
      src={attach.attachmentUrl}
      onClick={(e) => e.stopPropagation()}
    />
  ) : (
    <div>
      <Image
        width="100%"
        height={fromUploadZone ? 80 : "auto"}
        style={{
          boxShadow: "0 2px 4px rgba(0, 0, 0, 0.4)",
          maxHeight: 320,
        }}
        alt={attach.attachmentName}
        src={attach.attachmentUrl}
        onClick={(e) => e.stopPropagation()}
      />
    </div>
  );
}
