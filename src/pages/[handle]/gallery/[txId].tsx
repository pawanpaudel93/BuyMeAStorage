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
import {
  ardb,
  arweave,
  capitalizeAndFormat,
  fetchProfile,
  getHandle,
} from "@/utils";
import dayjs from "dayjs";
import StampButton from "@/components/Stamp/StampButton";
import { ArAccount } from "arweave-account";
import UdlPayButton from "@/components/Udl/UdlPayButton";
import DonateModal from "@/components/Modals/DonateModal";
import { useActiveAddress, useApi, usePublicKey } from "arweave-wallet-kit";
import { uint8ArrayToBase64String } from "@/lib/cryptography/common";
import NextLink from "next/link";
const { useToken } = theme;

export default function Gallery() {
  const { token } = useToken();
  const [isLoading, setIsLoading] = useState(false);
  const [post, setPost] = useState<IPost>();
  const [loading, setLoading] = useState(false);
  const [userAccount, setUserAccount] = useState<ArAccount>();
  const router = useRouter();
  const [licenseTags, setLicenseTags] = useState<ITag[]>([]);
  const connectedAddress = useActiveAddress();
  const [imageUrl, setImageUrl] = useState("");
  const walletApi = useApi();
  const publicKey = usePublicKey();
  const [license, setLicense] = useState({
    isAccess: false,
    seller: "",
    amount: 0,
    currency: "U",
  });
  const [hasPaid, setHasPaid] = useState(false);

  const [isDonateModalOpen, setIsDonateModalOpen] = useState(false);

  const { txId, handle } = router.query;

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
        }
      }
    } catch (err) {
      console.log(err);
    }
  }

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
      const contentType = tags.find((tag) => tag.name === "Content-Type");
      const publishedTag = tags.find(
        (tag) => tag.name === "Published" || tag.name === "Published-At"
      );
      const typeTag = tags.find((tag) => tag.name === "Type");
      const previewTag = tags.find((tag) => tag.name === "Preview");
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
          isAccess: licenseTag.name === "Access",
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
        preview: previewTag ? `https://arweave.net/${previewTag?.value}` : "",
        topics,
        type: typeTag?.value ?? "",
        license,
        content: "",
        contentType: contentType?.value ?? "image/jpeg",
        published: dayjs(
          new Date(
            parseInt(publishedTag?.value ?? new Date().getTime().toString())
          )
        ).format("MMM DD, YYYY [at] HH:mmA"),
      });
    } catch (error) {
      //
    }
    setLoading(false);
  }

  async function download() {
    if (license.amount === 0) {
      setIsDonateModalOpen(true);
    }

    setIsLoading(true);
    try {
      const response = await fetch(imageUrl as string);
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

  useEffect(() => {
    if (license.isAccess && !imageUrl && publicKey) {
      fetchDecryptedImage();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [license.isAccess, publicKey]);

  useEffect(() => {
    if (post) {
      setImageUrl(post.preview || (post?.link as string));
    }
  }, [post]);

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
        post={post}
        open={isDonateModalOpen}
        setOpen={setIsDonateModalOpen}
        userAccount={userAccount}
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
