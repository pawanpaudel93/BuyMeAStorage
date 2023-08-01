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

interface ImgProps {
  attach: any;
  fromUploadZone?: boolean;
}

const { useToken } = theme;

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
            <div
              style={{
                background: "white",
                color: "black",
                borderRadius: 12,
                padding: 16,
                width: "clamp(55vw, 70%, 90vw)",
                maxHeight: "95vh",
                overflow: "auto",
              }}
            >
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
                      width="100%"
                      style={{
                        boxShadow: "0 2px 4px rgba(0, 0, 0, 0.4)",
                        maxHeight: 500,
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
                <Col xs={24} md={10} style={{}}>
                  <Card
                    title={
                      <Space>
                        <Typography.Text>Asset Rights</Typography.Text>
                      </Space>
                    }
                    type="inner"
                    hoverable
                    // extra={<a href="#">More</a>}
                    headStyle={{
                      textAlign: "start",
                    }}
                    style={{
                      marginBottom: 12,
                    }}
                  >
                    <Space direction="vertical" style={{ width: "100%" }}>
                      <Row
                        justify="space-between"
                        align="middle"
                        gutter={[16, 16]}
                      >
                        <Space
                          style={{
                            border: "1px solid black",
                            padding: 12,
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
                  <Card
                    hoverable
                    bodyStyle={{
                      padding: 8,
                    }}
                  >
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
                        <Typography.Text
                          style={
                            {
                              // color: token.colorPrimary,
                            }
                          }
                        >
                          Lorem ipsum dolor sit amet consectetur adipisicing
                          elit. Maxime mollitia, molestiae quas vel sint commodi
                          repudiandae consequuntur voluptatum laborum numquam
                          blanditiis
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
                              padding: "1px 3px",
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
            </div>
          ),
          toolbarRender: () => null,
        }}
      />
    </div>
  );
}
