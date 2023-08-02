import React from "react";
import Link from "next/link";
import { Typography, Button, Space } from "antd";

const { Text, Title } = Typography;

export default function NotFound() {
  return (
    <Space
      direction="vertical"
      size={20}
      style={{
        display: "flex",
        alignItems: "center",
        marginTop: "100px",
        minHeight: "calc(100vh - 54px)",
      }}
    >
      <Title
        level={1}
        style={{
          display: "inline-block",
          fontSize: "2xl",
          background: "linear-gradient(to right, #f00, #f00)",
          WebkitBackgroundClip: "text",
          color: "transparent",
        }}
      >
        404
      </Title>
      <Text style={{ fontSize: "18px", marginTop: "3px", marginBottom: "2px" }}>
        Profile Not Found
      </Text>
      <Text style={{ color: "gray", marginBottom: "6px" }}>
        The profile you&apos;re looking for does not seem to exist
      </Text>

      <Button
        type="primary"
        style={{
          color: "white",
        }}
      >
        <Link href="/">Go to Home</Link>
      </Button>
    </Space>
  );
}
