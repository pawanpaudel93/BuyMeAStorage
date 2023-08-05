import React, { useEffect } from "react";
import { Typography, Row, Col, Image, theme, Space } from "antd";
import Illustration from "@/components/HomePage/Illustration";
import CreateMyProfile from "@/components/HomePage/CreateMyProfile";
import { useRouter } from "next/router";
import { useConnection } from "arweave-wallet-kit";

const { Title, Text } = Typography;
const { useToken } = theme;

export default function Home() {
  const { token } = useToken();

  const router = useRouter();

  const { connected } = useConnection();

  // const redirectToHome = () => {
  //   if (connected) {
  //     router.push("/home");
  //   } else {
  //     router.push("/");
  //   }
  // };

  // useEffect(() => {
  //   redirectToHome();
  // }, [connected]);

  return (
    <div style={{ maxWidth: "5xl", padding: 16 }}>
      <Row
        justify="center"
        align="middle"
        gutter={[0, 20]}
        style={{ paddingTop: "70px" }}
      >
        <Col style={{ textAlign: "center" }}>
          <Title level={2} style={{ fontWeight: 600 }}>
            Buy Me a{" "}
            <Title
              level={2}
              style={{ display: "inline", color: token.colorPrimary }}
            >
              Storage
            </Title>
          </Title>
          <Text style={{ color: "gray" }}>
            Get support from the amazing Arweave community.
          </Text>
        </Col>
      </Row>
      <Row justify="center" style={{ marginBottom: 20 }}>
        <CreateMyProfile />
      </Row>
      <Row justify="center">
        <Space
          direction="vertical"
          size="large"
          style={{
            alignItems: "center",
            background: "#EDF2F7",
            padding: 28,
            margin: 16,
            borderRadius: "10px",
            textAlign: "center",
          }}
        >
          <Title level={4} style={{ fontWeight: 600, fontSize: "4xl" }}>
            Simplify support for your storage needs (AR), empowering backers to
            contribute effortlessly.
          </Title>
          <Text style={{ color: "gray", fontSize: "xl" }}>
            <span
              style={{
                padding: "2px",
                borderRadius: "999px",
                background: "blue.300",
              }}
            >
              Buy Me a Storage makes it easy to gather funds for your storage
              needs with Arweave and personalized messages, all in a few taps!
            </span>
          </Text>
          <Image
            src="/support.png"
            height={400}
            width={400}
            alt=""
            preview={false}
            style={{
              borderRadius: "10px",
            }}
          />
          <div>
            <Text style={{ color: "gray.500" }}>
              The contributed AR amount goes directly to your wallet, helping
              you continue providing valuable content.
            </Text>
          </div>
        </Space>
      </Row>
      <Illustration />
    </div>
  );
}
