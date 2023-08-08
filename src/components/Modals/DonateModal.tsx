import { useEffect, useState } from "react";
import { Button, Col, Image, Modal, Row, Space, Typography, theme } from "antd";
import BuyStorageCard from "../Cards/BuyStorageCard";
import { CopyOutlined } from "@ant-design/icons";
import { ArAccount } from "arweave-account";
import { IPost } from "@/types";

const { useToken } = theme;

interface IDonateModalProps {
  open: boolean;
  setOpen: any;
  userAccount: ArAccount | undefined;
  post: IPost | undefined;
}

export default function DonateModal({
  open,
  setOpen,
  userAccount,
  post,
}: IDonateModalProps) {
  const { token } = useToken();
  const [tagText, setTagText] = useState("");
  const type =
    post?.type === "image"
      ? "Image"
      : post?.type === "image-album"
      ? "Album"
      : "Blog post";

  useEffect(() => {
    setTagText(`${type} by ${userAccount?.profile.name}`);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userAccount, type]);

  const cancelHandler = () => {
    setOpen(false);
  };

  const copyToClipBoard = async () => {
    try {
      await navigator.clipboard.writeText(
        `${type} by ${userAccount?.profile.name}: ${window.location.href}`
      );
      setTagText("Copied!");
      setTimeout(() => {
        setTagText(`${type} by ${userAccount?.profile.name}`);
      }, 2000);
    } catch (err) {
      setTagText("Failed to copy!");
    }
  };

  return (
    <Modal open={open} onCancel={cancelHandler} footer={null} width="65vw">
      <Row gutter={[16, 16]}>
        {/* <Col md={7} xs={12}> */}
        {/* when modal opened from gallery */}
        {/* <Image src="/magic.jpg" alt="image" width="100%" height="100%" /> */}
        {/* when modal opened from posts */}
        {/* <Card hoverable>
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
              <Row justify="center">
                <Typography.Text>Post Description Here</Typography.Text>
              </Row>
              <Row justify="center" style={{ textAlign: "justify" }}>
                <Typography.Text style={{ color: "gray" }}>
                  Post Content Generate Lorem Ipsum placeholder text for use in
                  your graphic, print and web layouts, and discover plugins for
                  your favorite writing, design and blogging tools. Explore the
                  origins, history and meaning of the famous passage, and learn
                  how Lorem Ipsum went from scrambled Latin passage to ubiqitous
                  ...
                </Typography.Text>
              </Row>
              <Row>
                {["first", "second"].map((tag, index) => (
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
          </Card> */}
        {/* </Col> */}
        <Col md={11} xs={24}>
          <Space
            direction="vertical"
            style={{ width: "100%", textAlign: "center" }}
          >
            <Typography.Title style={{ color: token.colorPrimary }}>
              Say Thanks!
            </Typography.Title>
            <Typography.Text style={{ fontSize: 18, color: "gray" }}>
              Show some love to{" "}
              <span
                style={{
                  fontSize: 20,
                  fontWeight: 500,
                  color: token.colorPrimary,
                }}
              >
                {userAccount?.profile.name ?? ""}
              </span>{" "}
              by giving them as small storage support.
            </Typography.Text>
            <Space
              size={[8, 8]}
              wrap
              style={{
                display: "flex",
                justifyContent: "center",
                padding: 12,
                borderRadius: 8,
                fontSize: 18,
                border: "1px solid #dfdfdf",
              }}
            >
              <Typography.Text style={{ fontSize: 18 }}>
                {tagText}
              </Typography.Text>
              <Button icon={<CopyOutlined />} onClick={copyToClipBoard} />
            </Space>
          </Space>
        </Col>
        <Col md={13} xs={24}>
          <BuyStorageCard creatorAccount={userAccount} />
        </Col>
      </Row>
    </Modal>
  );
}
