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
import { DownloadOutlined } from "@ant-design/icons";
import { UDL } from "@/utils/constants";

import { useState } from "react";

const { useToken } = theme;

export default function SingleInfoBox() {
  const { token } = useToken();
  const [isLoading, setIsLoading] = useState(false);

  async function download() {
    setIsLoading(true);
    try {
      const response = await fetch("");
      const blob = await response.blob();
      const blobUrl = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = blobUrl;
      link.target = "_blank";
      link.download = post.title;
      link.click();
      URL.revokeObjectURL(blobUrl);
    } catch (error) {
      message.error("Error downloading file");
    }
    setIsLoading(false);
  }
  return (
    <div
      style={{
        margin: "24px 54px",
        background: "white",
        padding: 16,
        borderRadius: 12,
        border: "1px solid #dfdfdf",
      }}
    >
      <Row justify="space-between" align="middle" style={{ padding: 8 }}>
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
          {/* <StampButton assetTx="" /> */}
          <Button
            type="primary"
            icon={<DownloadOutlined />}
            onClick={download}
            loading={isLoading}
          >
            Download
          </Button>
        </Space>
      </Row>
      <Row style={{ padding: 16 }} gutter={[16, 16]}>
        <Col xs={24} md={14}>
          <Space direction="vertical">
            <Image
              // width="100%"
              height="calc(100vh - 230px)"
              style={{
                boxShadow: "0 2px 4px rgba(0, 0, 0, 0.4)",
                // maxHeight: "calc(100vh - 200px)",
              }}
              alt={"alt "}
              src="/magic.jpg"
              preview={false}
            />
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
              <Row justify="space-between" align="middle" gutter={[16, 16]}>
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
                <a href={`https://arweave.net/${UDL}`} target="_blank">
                  License Information
                </a>
              </Row>
              {10 / 2 === 5 ? (
                <Row justify="space-between" gutter={[16, 16]}>
                  <Typography.Text>Access</Typography.Text>
                  <Typography.Text>Public</Typography.Text>
                </Row>
              ) : (
                post.license?.map((license, index) => (
                  <Row justify="space-between" gutter={[16, 16]} key={index}>
                    <Typography.Text>{license.name}</Typography.Text>
                    <Typography.Text>{license.value}</Typography.Text>
                  </Row>
                ))
              )}

              <Row justify="space-between" gutter={[16, 16]}>
                <Typography.Text>Payment-Mode</Typography.Text>
                <Typography.Text>Global Distribution</Typography.Text>
              </Row>
            </Space>
          </Card>
          <Card hoverable>
            <Space direction="vertical" style={{ width: "100%" }}>
              <Row justify="center">
                <Typography.Text
                  style={{
                    color: token.colorPrimary,
                    fontSize: 16,
                    fontWeight: 500,
                    borderBottom: `1px solid ${token.colorPrimary}`,
                  }}
                >
                  Post Title
                </Typography.Text>
              </Row>
              <Row>
                <Typography.Text>
                  Post Description width: clamp(60vw, 60vw, 95vw); background:
                  white; max-height: 95vh; overflow: auto; border-radius: 12px;
                  padding: 12px;
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
    </div>
  );
}
