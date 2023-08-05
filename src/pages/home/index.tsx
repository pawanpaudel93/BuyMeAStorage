import {
  Avatar,
  Button,
  Card,
  Col,
  Dropdown,
  Image,
  MenuProps,
  Row,
  Space,
  Typography,
  message,
  theme,
} from "antd";
import {
  UploadOutlined,
  QrcodeOutlined,
  FileTextOutlined,
  HeartOutlined,
} from "@ant-design/icons";
import { useState } from "react";
import QrModal from "@/components/QrCode";

const { useToken } = theme;

export default function HomePage() {
  const { token } = useToken();
  const myProfileUrl = "https://buymeastorage.com/mikdorje";
  const [isQrModalOpen, setIsQrModalOpen] = useState(false);

  const items: MenuProps["items"] = [
    {
      key: "1",
      label: "Copy",
      icon: <FileTextOutlined />,
    },
    {
      key: "2",
      label: " QR Code",
      icon: <QrcodeOutlined />,
    },
  ];

  const copyToClipBoard = async () => {
    try {
      await navigator.clipboard.writeText(
        `${window.location.origin}/mikdorje}`
      );
      message.success("Profile link copied to the clipboard!");
    } catch (err) {
      message.error("Failed to copy!");
    }
  };

  const handleMenuClick: MenuProps["onClick"] = ({ key }) => {
    if (key === "1") {
      copyToClipBoard();
    }
    if (key === "2") {
      setIsQrModalOpen(true);
    }
  };

  const earningTypes = [
    {
      title: "UDL Default Public",
      color: "orange",
      earning: "2MB",
    },
    {
      title: "UDL Restricted Access",
      color: "green",
      earning: "2MB",
    },
    {
      title: "UDL Commercial - One Time Payment",
      color: "pink",
      earning: "3MB",
    },
    {
      title: "UDL Derivative Works - One Time Payment",
      color: "brown",
      earning: "3MB",
    },
  ];

  return (
    <div
      style={{
        background: "white",
        minHeight: "calc(100vh - 94px)",
        color: "white",
        margin: "16px 24px",
        padding: "12px 32px",
      }}
    >
      <QrModal
        qrValue={myProfileUrl}
        open={isQrModalOpen}
        setOpen={setIsQrModalOpen}
      />
      <Row
        style={{
          borderBottom: "1px solid #dfdfdf",
          padding: 12,
        }}
        justify="space-between"
        align="middle"
      >
        <Col xs={24} md={21}>
          <Space size={10}>
            {
              <Avatar
                style={{
                  width: 54,
                  height: 54,
                  fontSize: 28,
                  display: "grid",
                  placeItems: "center",
                  background: token.colorPrimary,
                }}
              >
                M
              </Avatar>
            }
            <Space direction="vertical" size={1}>
              <Typography.Text
                style={{
                  display: "inline-block",
                  fontSize: 22,
                  transform: "scale(1, 1.1)",
                  fontWeight: 600,
                }}
              >
                Welcome, Mikma Tamang
              </Typography.Text>
              <Typography.Text style={{ color: "gray" }}>
                buymeastorage.com/mikdorje
              </Typography.Text>
            </Space>
          </Space>
        </Col>
        <Col xs={24} md={3}>
          <Dropdown
            menu={{ items, onClick: handleMenuClick }}
            trigger={["click"]}
          >
            <Button
              size="large"
              icon={<UploadOutlined />}
              style={{ borderRadius: 18, width: "100%" }}
            >
              Share Profile
            </Button>
          </Dropdown>
        </Col>
      </Row>
      <Row
        style={{
          borderBottom: "1px solid #dfdfdf",
          padding: 12,
        }}
        gutter={[16, 8]}
      >
        <Col span={24}>
          <Typography.Text
            style={{
              display: "inline-block",
              fontSize: 20,
              transform: "scale(1, 1.1)",
              fontWeight: 500,
            }}
          >
            Earnings
          </Typography.Text>
        </Col>
        <Col span={24}>
          <Typography.Text
            style={{
              fontSize: 28,
              fontWeight: 600,
              color: "gray",
            }}
          >
            TOTAL: <span style={{ color: token.colorPrimary }}>10MB</span>
          </Typography.Text>
        </Col>
        <Col span={24}>
          <Row gutter={[16, 16]}>
            {earningTypes.map((type, index) => (
              <Col key={index} xs={24} flex="auto">
                <Space align="baseline">
                  <div
                    style={{
                      background: `${type.color}`,
                      height: "12px",
                      width: "12px",
                    }}
                  ></div>
                  <Typography.Text>{`${type.earning} ${type.title}`}</Typography.Text>
                </Space>
              </Col>
            ))}
          </Row>
        </Col>
      </Row>
      <Row
        gutter={[16, 16]}
        style={{
          marginTop: 24,
          border: "1px solid #dfdfdf",
          borderRadius: 12,
          padding: 12,
        }}
      >
        <Col span={24}>
          <Space
            direction="vertical"
            size={4}
            style={{ width: "100%", textAlign: "center", padding: 32 }}
          >
            <HeartOutlined
              style={{ fontSize: 32, color: token.colorPrimary }}
            />
            <Typography.Text style={{ fontWeight: 500, fontSize: 18 }}>
              You do not have any supporter yet
            </Typography.Text>
            <Typography.Text style={{ fontSize: 14, color: "gray" }}>
              Share your page with your audience to get started.
            </Typography.Text>
          </Space>
        </Col>
        {/* <Col span={24} style={{ display: "flex", justifyContent: "center" }}>
          <Typography.Text
            style={{
              fontSize: 20,
              transform: "scale(1, 1.1)",
              fontWeight: 500,
            }}
          >
            Supporter Count
          </Typography.Text>
        </Col> */}
        {/* <Col span={24}>
          <Typography.Text
            style={{
              fontSize: 28,
              fontWeight: 600,
              color: "gray",
            }}
          >
            TOTAL:{" "}
            <span style={{ color: token.colorPrimary }}>20 Supporters</span>
          </Typography.Text>
        </Col> */}
      </Row>
    </div>
  );
}
