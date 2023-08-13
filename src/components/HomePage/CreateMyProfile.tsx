import React, { useState } from "react";
import { Input, Button, Typography, Form, Space, Tooltip, message } from "antd";
import { useRouter } from "next/router";
import { useConnection } from "arweave-wallet-kit";
import { getErrorMessage } from "@/utils";

const { Text } = Typography;

export default function CreateMyProfile() {
  const router = useRouter();
  const { connected, connect } = useConnection();
  const [isLoading, setIsLoading] = useState(false);

  async function getStarted() {
    setIsLoading(true);
    try {
      if (!connected) {
        await connect();
      }
      router.push("/profile");
    } catch (error) {
      message.error({ content: getErrorMessage(error), duration: 5 });
    }
    setIsLoading(false);
  }

  return (
    <Space
      direction="vertical"
      align="center"
      style={{ justifyContent: "center" }}
    >
      <Form initialValues={{ handle: "@blokchainaholic#vMbcr0" }}>
        <Space
          direction="horizontal"
          align="center"
          style={{ marginBottom: "12px" }}
        >
          <Form.Item name="handle" noStyle>
            <Space.Compact style={{ marginTop: 12 }}>
              <Tooltip title="https://buymeastorage.xyz/" placement="topLeft">
                <span
                  style={{ border: "1px solid #EDF2F7", padding: "4px 8px" }}
                >
                  https://buymeastorage.xyz/
                </span>
              </Tooltip>
              <Form.Item
                name="handle"
                rules={[
                  { required: true, message: "Please input your handle!" },
                ]}
              >
                <Input
                  style={{ border: "1px solid #EDF2F7", width: "234px" }}
                />
              </Form.Item>
            </Space.Compact>
          </Form.Item>
        </Space>
        <Form.Item style={{ textAlign: "center" }}>
          <Button
            type="primary"
            shape="round"
            onClick={getStarted}
            loading={isLoading}
            style={{ width: "100%", maxWidth: "40%" }}
          >
            Get Started
          </Button>
        </Form.Item>
      </Form>
      <Text type="secondary" style={{ textAlign: "center" }}>
        Get started creating a{" "}
        <Tooltip title="ArProfile is an Arweave native DID.">
          <u
            style={{
              textDecoration: "underline wavy blue",
            }}
          >
            ArProfile
          </u>
        </Tooltip>
        ✌️
      </Text>
    </Space>
  );
}
