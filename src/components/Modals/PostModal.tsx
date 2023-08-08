import React, { useEffect, useState } from "react";
import {
  Avatar,
  Button,
  Card,
  Col,
  Modal,
  Row,
  Space,
  Tag,
  Typography,
  Image,
  theme,
  message,
  Carousel,
  Spin,
} from "antd";
import { IPost } from "@/types";
import { ScrollableDiv } from "../Cards/ImageCard";
import { DownloadOutlined } from "@ant-design/icons";
import { MdPreview } from "md-editor-rt";
import "md-editor-rt/lib/preview.css";
import StampButton from "../Stamp/StampButton";
import { UDL } from "@/utils/constants";
import { useConnectedUserStore } from "@/lib/store";
import JSZip from "jszip";
import { saveAs } from "file-saver";
import NextLink from "next/link";

const { useToken } = theme;

interface PostModalProps {
  open: boolean;
  setOpen: (value: boolean) => void;
  post: IPost;
}

const PostModal = ({ open, setOpen, post }: PostModalProps) => {
  const { token } = useToken();
  const [content, setContent] = useState("");
  const [urls, setUrls] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { userAccount } = useConnectedUserStore();

  const [isLoadingContents, setIsLoadingContents] = useState(false);

  async function fetchData() {
    try {
      setIsLoadingContents(true);
      const _content = await (await fetch(post.link as string)).text();
      if (post.type === "blog-post") {
        setContent(_content);
      } else {
        const transactionIds = JSON.parse(_content) as string[];
        setUrls(transactionIds.map((id) => `https://arweave.net/${id}`));
      }
    } catch (err) {
      console.log("error fetching contents");
    } finally {
      setIsLoadingContents(false);
    }
  }

  async function download() {
    setIsLoading(true);
    try {
      if (post?.type === "blog-post") {
        const response = await fetch(post?.link as string);
        const blob = await response.blob();
        const blobUrl = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = blobUrl;
        link.target = "_blank";
        link.download = (
          post?.type === "blog-post" ? `${post?.title}.md` : post?.title
        ) as string;
        link.click();
        URL.revokeObjectURL(blobUrl);
      } else if (post?.type === "image-album") {
        if (urls.length === 1) {
          const response = await fetch(urls[0]);
          const blob = await response.blob();
          const blobUrl = URL.createObjectURL(blob);
          const link = document.createElement("a");
          link.href = blobUrl;
          link.target = "_blank";
          link.download = post?.title as string;
          link.click();
          URL.revokeObjectURL(blobUrl);
        } else {
          const zip = new JSZip();
          const promises = urls.map(async (url, index) => {
            const response = await fetch(url);
            const blob = await response.blob();
            zip.file(`image_${index + 1}.jpg`, blob);
          });
          await Promise.all(promises);
          zip.generateAsync({ type: "blob" }).then((content) => {
            saveAs(content, `${post?.title}.zip`);
          });
        }
      }
    } catch (error) {
      message.error("Error downloading file");
    }
    setIsLoading(false);
  }

  const NextArrow = (props: any) => {
    const { className, style, onClick } = props;

    return (
      <div
        className={className}
        style={{
          ...style,
          color: token.colorPrimary,
          fontSize: "24px",
          fontWeight: "bolder",
          zIndex: 100,
        }}
        onClick={onClick}
      ></div>
    );
  };

  const PrevArrow = (props: any) => {
    const { className, style, onClick } = props;
    return (
      <div
        className={className}
        style={{
          ...style,
          color: token.colorPrimary,
          fontSize: "24px",
          fontWeight: "bolder",
          zIndex: 100,
        }}
        onClick={onClick}
      ></div>
    );
  };

  useEffect(() => {
    fetchData();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [post.type]);

  return (
    <>
      <Modal
        centered
        title={post.title}
        open={open}
        onOk={() => setOpen(false)}
        onCancel={() => setOpen(false)}
        footer={null}
        width="auto"
      >
        <Spin spinning={isLoadingContents}>
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
                {post.type === "image-album" ? (
                  <Carousel
                    autoplay={false}
                    prevArrow={<PrevArrow />}
                    nextArrow={<NextArrow />}
                    arrows
                  >
                    {urls.map((url, index) => (
                      <div key={index}>
                        <Image
                          width="100%"
                          // height="calc(100vh - 200px)"
                          style={{
                            boxShadow: "0 2px 4px rgba(0, 0, 0, 0.4)",
                            maxHeight: "calc(100vh - 245px)",
                          }}
                          alt={post.title}
                          src={url}
                          preview={false}
                        />
                      </div>
                    ))}
                  </Carousel>
                ) : (
                  <MdPreview
                    language="en-US"
                    modelValue={content}
                    previewTheme="github"
                    codeTheme="github"
                  />
                )}
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
                    <Row
                      justify="space-between"
                      align="middle"
                      gutter={[16, 16]}
                    >
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
                        <Row
                          justify="space-between"
                          gutter={[16, 16]}
                          key={index}
                        >
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
        </Spin>
      </Modal>
    </>
  );
};

export default PostModal;
