import {
  Avatar,
  Button,
  Card,
  Carousel,
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
import { MdPreview } from "md-editor-rt";
import { ArAccount } from "arweave-account";
import DonateModal from "@/components/Modals/DonateModal";
import UdlPayButton from "@/components/Udl/UdlPayButton";
import NextLink from "next/link";
import "md-editor-rt/lib/preview.css";

import JSZip from "jszip";
import { saveAs } from "file-saver";

const { useToken } = theme;

export default function Post() {
  const { token } = useToken();
  const [isLoading, setIsLoading] = useState(false);
  const [post, setPost] = useState<IPost>();
  const [loading, setLoading] = useState(false);
  const [content, setContent] = useState("");
  const [urls, setUrls] = useState<string[]>([]);
  const [userAccount, setUserAccount] = useState<ArAccount>();
  const router = useRouter();
  const [isDonateModalOpen, setIsDonateModalOpen] = useState(false);
  const [licenseTags, setLicenseTags] = useState<ITag[]>([]);
  const [license, setLicense] = useState({
    seller: "",
    amount: 0,
    currency: "U",
  });
  const [hasPaid, setHasPaid] = useState(false);

  const { txId, handle } = router.query;

  async function fetchPost() {
    setLoading(true);
    try {
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
        const feeTag = tags.find((tag) => tag.name === "License-Fee");
        if (feeTag) {
          setLicenseTags([
            { name: licenseTag.name, value: licenseTag.value },
            { name: feeTag?.name, value: feeTag?.value },
          ]);
        } else {
          setLicenseTags([{ name: licenseTag.name, value: licenseTag.value }]);
        }

        const currencyTag = tags.find((tag) => tag.name === "Currency");

        setLicense({
          // @ts-ignore
          seller: transaction.owner.address,
          amount: feeTag ? parseFloat(feeTag.value.split("-")[2]) : 0,
          currency: currencyTag ? currencyTag.value : "U",
        });
        license = [
          {
            name: capitalizeAndFormat(licenseTag.name),
            value: capitalizeAndFormat(licenseTag.value),
          },
        ];

        if (feeTag) {
          const currencyTag = tags.find((tag) => tag.name === "Currency");
          license = license.concat([
            {
              name: capitalizeAndFormat(feeTag.name),
              value: capitalizeAndFormat(feeTag.value),
            },
            {
              name: "Currency",
              value: currencyTag ? currencyTag.value : "U",
            },
          ]);
        }
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
    } catch (error) {}
    setLoading(false);
  }

  async function fetchData() {
    try {
      const _content = await (await fetch(post?.link as string)).text();
      if (post?.type === "blog-post") {
        setContent(_content);
      } else {
        const transactionIds = JSON.parse(_content) as string[];
        setUrls(transactionIds.map((id) => `https://arweave.net/${id}`));
      }
    } catch (error) {
      console.log(error);
    }
  }

  async function download() {
    if (license.amount === 0) {
      setIsDonateModalOpen(true);
    }
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
    if (txId) {
      fetchPost();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [txId]);

  useEffect(() => {
    if (post?.link) {
      fetchData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [post?.link]);

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
      <DonateModal
        open={isDonateModalOpen}
        setOpen={setIsDonateModalOpen}
        userAccount={userAccount}
        post={post}
      />
      {post ? (
        <>
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
              {license.amount > 0 && (
                <UdlPayButton
                  currency={license.currency}
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
