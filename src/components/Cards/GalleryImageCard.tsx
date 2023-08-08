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
  message,
  theme,
} from "antd";

import { DownloadOutlined } from "@ant-design/icons";
import { styled } from "styled-components";
import { IPost } from "@/types";
import { UDL } from "@/utils/constants";
import StampButton from "../Stamp/StampButton";
import { useEffect, useState } from "react";
import { useConnectedUserStore } from "@/lib/store";
import { useActiveAddress, usePublicKey } from "arweave-wallet-kit";
import { uint8ArrayToBase64String } from "@/lib/cryptography/common";
import NextLink from "next/link";

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

const ImageRenderComponent = ({ post }: { post: IPost }) => {
  const { token } = useToken();
  const [isLoading, setIsLoading] = useState(false);
  const { userAccount } = useConnectedUserStore();
  const connectedAddress = useActiveAddress();
  const publicKey = usePublicKey();
  const [imageUrl, setImageUrl] = useState(post.link);
  const [isDecrypted, setIsDecrypted] = useState(false);

  async function download() {
    setIsLoading(true);
    try {
      const response = await fetch(imageUrl as string);
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

  useEffect(() => {
    if (post?.isAccess && publicKey && !isDecrypted) {
      fetchDecryptedImage();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [post?.isAccess, isDecrypted, publicKey]);

  async function fetchDecryptedImage() {
    try {
      const message = new TextEncoder().encode("Address Validation");
      const signature = uint8ArrayToBase64String(
        await window.arweaveWallet.signature(message, {
          name: "RSA-PSS",
          saltLength: 0,
        })
      );

      const response = await fetch("/api/decrypt", {
        method: "POST",
        body: JSON.stringify({
          assetTx: post?.id,
          address: connectedAddress,
          message: uint8ArrayToBase64String(message),
          signature,
          publicKey,
        }),
      });
      if (response.ok) {
        const decryptedData = await response.arrayBuffer();
        if (decryptedData) {
          const blob = new Blob([decryptedData], { type: post?.contentType });
          const url = URL.createObjectURL(blob);
          setImageUrl(url);
          setIsDecrypted(true);
        }
      }
    } catch (err) {
      console.log(err);
    }
  }

  return (
    <ScrollableDiv>
      <Row justify="space-between" align="middle" style={{ padding: 8 }}>
        <NextLink href={`/${userAccount?.handle}`}>
          <Space>
            <Avatar size="large" style={{ background: "green" }}>
              {userAccount?.profile?.name.slice(0, 1) ?? ""}
            </Avatar>
            <Space direction="vertical" size={0}>
              <Typography.Text>
                {userAccount?.profile?.name ?? ""}
              </Typography.Text>
              <Typography.Text style={{ fontSize: 14, color: "gray" }}>
                Creator
              </Typography.Text>
            </Space>
          </Space>
        </NextLink>
        <Space>
          <StampButton assetTx={post.id as string} />
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
              height="calc(100vh - 200px)"
              style={{
                boxShadow: "0 2px 4px rgba(0, 0, 0, 0.4)",
                // maxHeight: "calc(100vh - 200px)",
              }}
              alt={post.title}
              src={imageUrl}
              preview={false}
            />
          </Space>
        </Col>
        <Col xs={24} md={10}>
          <Card
            title="License Information"
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
                  License Details
                </a>
              </Row>
              {post.license?.length === 0 ? (
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
                  {post.title}
                </Typography.Text>
              </Row>
              <Row justify="center">
                <Typography.Text>{post.description}</Typography.Text>
              </Row>
              <Row>
                {(post.topics as string[]).map((tag, index) => (
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
  );
};

export default function GalleryImageCard({
  post,
  imageClickHandler,
}: {
  post: IPost;
  imageClickHandler?: () => void;
}) {
  return (
    <div>
      <Card
        hoverable
        style={{ borderRadius: 0 }}
        bodyStyle={{ padding: 0, background: "transparent" }}
      >
        <Image
          onClick={imageClickHandler}
          width="100%"
          style={{
            boxShadow: "0 2px 4px rgba(0, 0, 0, 0.4)",
            maxHeight: 520,
          }}
          alt={post.title}
          src={post.link}
          preview={
            !imageClickHandler
              ? {
                  imageRender: () => <ImageRenderComponent post={post} />,
                  toolbarRender: () => null,
                }
              : false
          }
        />
      </Card>
    </div>
  );
}
