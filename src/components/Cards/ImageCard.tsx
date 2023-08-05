import { Image } from "antd";
import { styled } from "styled-components";

interface ImgProps {
  attach: any;
  fromUploadZone?: boolean;
}

export const ScrollableDiv = styled.div`
  width: clamp(60vw, 60vw, 95vw);
  background: white;
  max-height: 95vh;
  overflow: auto;
  border-radius: 12px;
  padding: 12px;

  scrollbar-width: none;
  &::-webkit-scrollbar {
    width: 8px;
    height: 3px;
  }
  &::-webkit-scrollbar-track {
    -webkit-box-shadow: inset 0 0 6px rgba(0, 0, 0, 0.3);
    background-color: #f5f5f5;
    border-radius: 0 12px 12px 0;
  }
  &::-webkit-scrollbar-thumb {
    -webkit-box-shadow: inset 0 0 6px rgba(0, 0, 0, 0.3);
    border-radius: 12px;
    background-color: #bebec0;
  }
`;

export default function ImageCard({ attach }: ImgProps) {
  return (
    <div>
      <Image
        width="100%"
        style={{
          boxShadow: "0 2px 4px rgba(0, 0, 0, 0.4)",
          maxHeight: 320,
        }}
        alt={attach.attachmentName}
        src={attach.attachmentUrl}
      />
    </div>
  );
}
