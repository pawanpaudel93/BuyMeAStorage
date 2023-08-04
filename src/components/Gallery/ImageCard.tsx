import {
  Avatar,
  Button,
  Card,
  Col,
  Image,
  Row,
  Space,
  Tag,
  Typography,
  theme,
} from "antd";
import { Inter } from "next/font/google";
import Link from "next/link";

import {
  DownloadOutlined,
  RotateLeftOutlined,
  RotateRightOutlined,
  SwapOutlined,
  ZoomInOutlined,
  ZoomOutOutlined,
  HeartOutlined,
} from "@ant-design/icons";
import { styled } from "styled-components";

interface ImgProps {
  attach: any;
  fromUploadZone?: boolean;
}

const { useToken } = theme;

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

export default function ImageCard({ attach, fromUploadZone }: ImgProps) {
  const { token } = useToken();

  const onDownload = () => {
    // fetch(src)
    //   .then((response) => response.blob())
    //   .then((blob) => {
    //     const url = URL.createObjectURL(new Blob([blob]));
    //     const link = document.createElement("a");
    //     link.href = url;
    //     link.download = "image.png";
    //     document.body.appendChild(link);
    //     link.click();
    //     URL.revokeObjectURL(url);
    //     link.remove();
    //   });
  };

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
        style={{
          boxShadow: "0 2px 4px rgba(0, 0, 0, 0.4)",
          maxHeight: 320,
        }}
        alt={attach.attachmentName}
        src={attach.attachmentUrl}
        preview={{
          imageRender: () => (
            <ScrollableDiv>
              <Row
                justify="space-between"
                align="middle"
                style={{ padding: 8 }}
              >
                <Space>
                  <Avatar size="large" style={{ background: "green" }}>
                    M
                  </Avatar>
                  <Space direction="vertical" size={0}>
                    <Typography.Text>Mikma Tamang</Typography.Text>
                    <Typography.Text style={{ fontSize: 14, color: "gray" }}>
                      Creator
                    </Typography.Text>
                  </Space>
                </Space>
                <Space>
                  <Button icon={<HeartOutlined />}>Like</Button>
                  <Button type="primary" icon={<DownloadOutlined />}>
                    Download
                  </Button>
                </Space>
              </Row>
              <Row style={{ padding: 16 }} gutter={[16, 16]}>
                <Col xs={24} md={14}>
                  <Space direction="vertical">
                    <Image
                      // width="100%"
                      height="calc(100vh - 200px)"
                      style={{
                        boxShadow: "0 2px 4px rgba(0, 0, 0, 0.4)",
                        // maxHeight: "calc(100vh - 200px)",
                      }}
                      alt={attach.attachmentName}
                      src={attach.attachmentUrl}
                      preview={false}
                    />
                    <Typography.Text style={{ color: "graytext" }}>
                      {attach.attachmentName}
                    </Typography.Text>
                  </Space>
                </Col>
                <Col xs={24} md={10}>
                  <Card
                    title="Asset Rights"
                    type="inner"
                    hoverable
                    headStyle={{
                      textAlign: "start",
                    }}
                    style={{
                      marginBottom: 8,
                    }}
                  >
                    <Space
                      size={2}
                      direction="vertical"
                      style={{
                        width: "100%",
                      }}
                    >
                      <Row
                        justify="space-between"
                        align="middle"
                        gutter={[16, 16]}
                      >
                        <Space
                          style={{
                            border: "1px solid black",
                            padding: 8,
                            borderRadius: 8,
                          }}
                        >
                          <Image
                            alt="licenselogo"
                            src="/udllicense.svg"
                            preview={false}
                          />
                        </Space>
                        <a>License Information</a>
                      </Row>
                      <Row justify="space-between" gutter={[16, 16]}>
                        <Typography.Text>Access</Typography.Text>
                        <Typography.Text>Public</Typography.Text>
                      </Row>
                      <Row justify="space-between" gutter={[16, 16]}>
                        <Typography.Text>Commercial</Typography.Text>
                        <Typography.Text>Allowed</Typography.Text>
                      </Row>
                      <Row justify="space-between" gutter={[16, 16]}>
                        <Typography.Text>Commercail-Fee</Typography.Text>
                        <Typography.Text>One Time 0.5</Typography.Text>
                      </Row>
                      <Row justify="space-between" gutter={[16, 16]}>
                        <Typography.Text>Derivation</Typography.Text>
                        <Typography.Text>
                          Allowed With License Fee
                        </Typography.Text>
                      </Row>
                      <Row justify="space-between" gutter={[16, 16]}>
                        <Typography.Text>Derivation-Fee</Typography.Text>
                        <Typography.Text>One Time 0.1</Typography.Text>
                      </Row>
                      <Row justify="space-between" gutter={[16, 16]}>
                        <Typography.Text>Payment-Mode</Typography.Text>
                        <Typography.Text>Global Distribution</Typography.Text>
                      </Row>
                    </Space>
                  </Card>
                  <Card hoverable>
                    <Space direction="vertical">
                      <Row justify="center">
                        <Typography.Text
                          style={{
                            color: token.colorPrimary,
                            fontSize: 16,
                            fontWeight: 500,
                            borderBottom: `1px solid ${token.colorPrimary}`,
                          }}
                        >
                          Image Title Here
                        </Typography.Text>
                      </Row>
                      <Row justify="center">
                        <Typography.Text>
                          Lorem ipsum dolor sit amet consectetur adipisicing
                          elit. Lorem ipsum dolor sit amet consectetur
                          adipisicing elit. Lorem ipsum dolor sit amet
                          consectetur adipisicing elit.
                        </Typography.Text>
                      </Row>
                      <Row>
                        {["first tag", "second tag"].map((tag, index) => (
                          <Tag
                            key={index}
                            style={{
                              background: "transparent",
                              borderRadius: 8,
                              boxShadow: " 0 3px 10px rgb(0 0 0 / 0.2)",
                              padding: "1px 6px",
                              color: "GrayText",
                            }}
                          >
                            {tag}
                          </Tag>
                        ))}
                      </Row>
                    </Space>
                  </Card>
                </Col>
              </Row>
            </ScrollableDiv>
          ),
          toolbarRender: () => null,
        }}
      />
    </div>
  );
}
