import {
  Avatar,
  Button,
  Card,
  Col,
  Image,
  Row,
  Space,
  Spin,
  Tag,
  Typography,
  message,
  theme,
} from "antd";
import { DownloadOutlined } from "@ant-design/icons";
import { UDL } from "@/utils/constants";
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { IPost, ITag } from "@/types";
import { ardb, capitalizeAndFormat, fetchProfile, getHandle } from "@/utils";
import dayjs from "dayjs";
import StampButton from "@/components/Stamp/StampButton";
import { ArAccount } from "arweave-account";
import UdlPayButton from "@/components/Udl/UdlPayButton";
import DonateModal from "@/components/Modals/DonateModal";

const { useToken } = theme;

export default function Gallery() {
  const { token } = useToken();
  const [isLoading, setIsLoading] = useState(false);
  const [post, setPost] = useState<IPost>();
  const [loading, setLoading] = useState(false);
  const [userAccount, setUserAccount] = useState<ArAccount>();
  const router = useRouter();
  const [licenseTags, setLicenseTags] = useState<ITag[]>([]);
  const [license, setLicense] = useState({
    seller: "",
    amount: 0,
  });
  const [hasPaid, setHasPaid] = useState(false);

  const [isDonateModalOpen, setIsDonateModalOpen] = useState(false);

  const { txId, handle } = router.query;

  async function fetchPost() {
    setLoading(true);
    const transaction = await ardb
      .search("transactions")
      .id(txId as string)
      .findOne();

    // @ts-ignore
    const tags = transaction.tags as ITag[];
    const titleTag = tags.find((tag) => tag.name === "Title");
    const descriptionTag = tags.find((tag) => tag.name === "Description");
    const publishedTag = tags.find(
      (tag) => tag.name === "Published" || tag.name === "Published-At"
    );
    const typeTag = tags.find((tag) => tag.name === "Type");
    const topics = tags
      .filter((tag) => tag.name.startsWith("topic:"))
      .map((tag) => tag.value);
    const licenseTag = tags.find(
      (tag) =>
        tag.name === "Access" ||
        tag.name === "Derivation" ||
        tag.name === "Commercial-Use"
    );

    let license: ITag[] = [];

    if (licenseTag) {
      const feeTag = tags.find(
        (tag) =>
          tag.name === "Access-Fee" ||
          tag.name === "Derivation-Fee" ||
          tag.name === "Commercial-Fee"
      )!;
      setLicenseTags([
        { name: licenseTag.name, value: licenseTag.value },
        { name: feeTag?.name, value: feeTag?.value },
      ]);

      setLicense({
        // @ts-ignore
        seller: transaction.owner.address,
        amount: parseFloat(feeTag.value.split("-")[2]),
      });
      license = [
        {
          name: capitalizeAndFormat(licenseTag.name),
          value: capitalizeAndFormat(licenseTag.value),
        },
        {
          name: capitalizeAndFormat(feeTag.name),
          value: capitalizeAndFormat(feeTag.value),
        },
      ];
    }

    setPost({
      id: transaction.id,
      link: `https://arweave.net/${transaction.id}`,
      title: titleTag?.value ?? "",
      description: descriptionTag?.value ?? "",
      topics,
      type: typeTag?.value ?? "",
      license,
      content: "",
      published: dayjs(
        new Date(
          parseInt(publishedTag?.value ?? new Date().getTime().toString())
        )
      ).format("MMM DD, YYYY [at] HH:mmA"),
    });
    setLoading(false);
  }

  async function download() {
    setIsDonateModalOpen(true);

    setIsLoading(true);
    try {
      const response = await fetch(post?.link as string);
      const blob = await response.blob();
      const blobUrl = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = blobUrl;
      link.target = "_blank";
      link.download = post?.title as string;
      link.click();
      URL.revokeObjectURL(blobUrl);
    } catch (error) {
      message.error("Error downloading file");
    }
    setIsLoading(false);
  }

  useEffect(() => {
    if (txId) {
      fetchPost();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [txId]);

  useEffect(() => {
    if (handle) {
      fetchProfile({ userHandle: getHandle(handle.slice(1) as string) }).then(
        (user) => {
          setUserAccount(user);
        }
      );
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [handle]);

  return (
    <div
      style={{
        margin: "24px 54px",
        background: "white",
        padding: 16,
        borderRadius: 12,
        border: "1px solid #dfdfdf",
      }}
    >
      <DonateModal open={isDonateModalOpen} setOpen={setIsDonateModalOpen} />
      {post ? (
        <>
          <Row justify="space-between" align="middle" style={{ padding: 8 }}>
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
            <Space>
              {license.amount > 0 && (
                <UdlPayButton
                  setHasPaid={setHasPaid}
                  hasPaid={hasPaid}
                  target={license.seller}
                  assetTx={post?.id as string}
                  quantity={license.amount.toString()}
                  licenseTags={licenseTags}
                />
              )}
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
                  src={post.link}
                  preview={false}
                />
              </Space>
            </Col>
            <Col xs={24} md={10}>
              <Card
                title="Asset Rights"
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
                      License Information
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
        </>
      ) : (
        <Spin />
      )}
    </div>
  );
}
