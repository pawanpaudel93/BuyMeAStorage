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

  const publishedItems = [
    {
      id: 1,
      title: "First published title",
      description: `Project Description here The ArConnect Injected API provides
    some additional information about the extension. You can
    retrive the wallet version
    (window.arweaveWallet.walletVersion) and you can even verify
    that the currently used wallet API indeed belongs to ArConnect
    using the wallet name (window.arweaveWallet.walletName).The
    ArConnect Injected API provides some additional information
    about the extension. You can retrive the wallet version
    (window.arweaveWallet.walletVersion) and you can even verify
    that the currently used wallet API indeed belongs to ArConnect
    using the wallet name (window.arweaveWallet.walletName).The
    ArConnect Injected API provides some additional information
    about the extension.`,
    },
    {
      id: 2,
      title: "Second published title",
      description: `Project Description here The ArConnect Injected API provides
    some additional information about the extension. You can
    retrive the wallet version
    (window.arweaveWallet.walletVersion) and you can even verify
    that the currently used wallet API indeed belongs to ArConnect
    using the wallet name (window.arweaveWallet.walletName).The
    ArConnect Injected API provides some additional information
    about the extension. You can retrive the wallet version
    (window.arweaveWallet.walletVersion) and you can even verify
    that the currently used wallet API indeed belongs to ArConnect
    using the wallet name (window.arweaveWallet.walletName).The
    ArConnect Injected API provides some additional information
    about the extension.`,
    },
  ];

  const items: TabsProps["items"] = [
    {
      key: "1",
      label: <p style={{ fontSize: 18 }}>Published Posts</p>,
      children: (
        <Row gutter={[16, 16]}>
          {publishedItems.map((item) => (
            <Col span={24} key={item.id}>
              <Space
                direction="vertical"
                style={{
                  width: "100%",
                  padding: 16,
                  border: "1px solid #dfdfdf",
                  background: "white",
                  borderRadius: 12,
                }}
              >
                <Row justify="space-between">
                  <Typography.Text style={{ fontSize: 18, fontWeight: 600 }}>
                    {item.title}
                  </Typography.Text>
                  <Typography.Text style={{ color: "gray" }}>
                    Aug 03, 2023 at 03:46PM
                  </Typography.Text>
                </Row>
                <Row>
                  <Typography.Text style={{ textAlign: "justify" }}>
                    {item.description}
                  </Typography.Text>
                </Row>
              </Space>
            </Col>
          ))}
        </Row>
      ),
    },
    {
      key: "2",
      label: <p style={{ fontSize: 18 }}>Draft Posts</p>,
      children: (
        <Row gutter={[16, 16]}>
          <Col span={24}>
            <Space
              direction="vertical"
              style={{
                width: "100%",
                padding: 16,
                border: "1px solid gray",
                background: "white",
                borderRadius: 12,
              }}
            >
              <Row justify="space-between">
                <Typography.Text style={{ fontSize: 18, fontWeight: 600 }}>
                  Draft Post Title{" "}
                </Typography.Text>
                <Typography.Text style={{ color: "gray" }}>
                  Aug 03, 2023 at 03:46PM
                </Typography.Text>
              </Row>
              <Row>
                <Typography.Text style={{ textAlign: "justify" }}>
                  Project Description here The ArConnect Injected API provides
                  some additional information about the extension. You can
                  retrive the wallet version
                  (window.arweaveWallet.walletVersion) and you can even verify
                  that the currently used wallet API indeed belongs to ArConnect
                  using the wallet name (window.arweaveWallet.walletName).The
                  ArConnect Injected API provides some additional information
                  about the extension. You can retrive the wallet version
                  (window.arweaveWallet.walletVersion) and you can even verify
                  that the currently used wallet API indeed belongs to ArConnect
                  using the wallet name (window.arweaveWallet.walletName).The
                  ArConnect Injected API provides some additional information
                  about the extension.
                </Typography.Text>
              </Row>
            </Space>
          </Col>
        </Row>
      ),
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
              onClick={() => router.push("/posts/new-photo")}
            >
              Add an image
            </Button>
          </Col>
        </Row>
        <Row>
          <Tabs
            style={{
              borderRadius: 8,
              width: "100%",
            }}
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
