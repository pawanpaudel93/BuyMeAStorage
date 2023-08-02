import { useEffect, useState } from "react";
import {
  Button,
  Card,
  Image,
  Row,
  Col,
  Space,
  Spin,
  Tabs,
  Typography,
  TabsProps,
} from "antd";
import { BookOutlined, ProjectOutlined } from "@ant-design/icons";
import { useRouter } from "next/navigation";

export default function Posts() {
  const router = useRouter();

  const items: TabsProps["items"] = [
    {
      key: "1",
      label: <p style={{ fontSize: 18 }}>Published Posts</p>,
      children: "published content",
    },
    {
      key: "2",
      label: <p style={{ fontSize: 18 }}>Draft Posts</p>,
      children: "Draft content",
    },
  ];

  return (
    <>
      <Space
        style={{ padding: "16px 32px", width: "100%" }}
        direction="vertical"
      >
        <Row>
          <Typography.Text style={{ fontSize: 18, fontWeight: 500 }}>
            Publish new post/album
          </Typography.Text>
        </Row>
        <Row gutter={[16, 16]}>
          <Col span={12}>
            <Button
              icon={<BookOutlined />}
              style={{
                width: "100%",
                height: "60px",
                fontSize: "1.5em",
                color: "gray",
              }}
              onClick={() => router.push("/posts/new-post")}
            >
              Write a post
            </Button>
          </Col>
          <Col span={12}>
            <Button
              icon={<ProjectOutlined />}
              style={{
                width: "100%",
                height: "60px",
                fontSize: "1.5em",
                color: "gray",
              }}
            >
              Add an album
            </Button>
          </Col>
        </Row>
        <Row>
          <Tabs
            style={{ padding: "16px 24px", borderRadius: 8 }}
            defaultActiveKey="1"
            items={items}
            // onChange={onChange}
            tabBarGutter={16}
          />
        </Row>
      </Space>
    </>
  );
}
