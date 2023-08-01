import React from "react";
import Link from "next/link";
import { Typography, Button } from "antd";

const { Text, Title } = Typography;

export default function NotFound() {
  return (
    <div style={{ textAlign: "center", padding: "32px", paddingLeft: "6px" }}>
      <Title
        level={2}
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
        The profile you're looking for does not seem to exist
      </Text>

      <Button
        type="primary"
        style={{
          backgroundImage:
            "linear-gradient(to right, #1890ff, #1890ff, #1890ff)",
          color: "white",
        }}
      >
        <Link href="/">Go to Home</Link>
      </Button>
    </div>
  );
}
