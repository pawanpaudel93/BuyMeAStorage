import React, { useEffect, useState } from "react";
import Account, { ArAccount } from "arweave-account";
import {
  Input,
  Button,
  Typography,
  Radio,
  Select,
  Space,
  Divider,
  Image,
  Tag,
  Card,
  Spin,
  message,
  Row,
  theme,
  Col,
  TabsProps,
  Tabs,
  Empty,
} from "antd";
import { RxCross1 } from "react-icons/rx";
import { useActiveAddress, useApi, useConnection } from "arweave-wallet-kit";
import { arweave, ardb, capitalizeAndFormat } from "@/utils";
import { APP_NAME, APP_VERSION } from "@/utils/constants";
import "@/components/ArProfile/Profile.module.css";
import Supports from "@/components/Support/Supports";
import NotFound from "@/components/Errors/NotFound";
import ProfileWithData from "@/components/ArProfile/ProfileWithData";
import { getErrorMessage } from "@/utils";
import { IPost, ISupport, ITag } from "@/types";
import { useRouter } from "next/router";
import dayjs from "dayjs";
import Masonry from "react-masonry-css";
import GalleryImageCard from "../Cards/GalleryImageCard";

const { Text, Title } = Typography;
const { useToken } = theme;

export default function SupportPage({ address }: { address?: string }) {
  const walletApi = useApi();
  const { token } = useToken();
  const router = useRouter();
  const activeAddress = useActiveAddress();

  const connectedAddress = useActiveAddress();
  const [supports, setSupports] = useState<ISupport[]>([]);
  const [userAccount, setUserAccount] = useState<ArAccount>();
  const [isHandlePresent, setIsHandlePresent] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const { connected, connect } = useConnection();
  const [arweavePrice, setArweavePrice] = useState(0);
  const [supportValue, setSupportValue] = useState({
    winston: "0",
    ar: 0,
    usd: 0,
  });
  const [storageUnit, setStorageUnit] = useState("MB");
  const [storageValue, setStorageValue] = useState(1);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  const [posts, setPosts] = useState<IPost[]>([]);
  const [images, setImages] = useState<IPost[]>([]);
  const [loading, setLoading] = useState(false);

  const storageOptions = [
    { label: "1", value: 1 },
    { label: "2", value: 2 },
    { label: "3", value: 3 },
  ];

  console.log({ posts });

  useEffect(() => {
    const favicon: HTMLLinkElement | null =
      document.querySelector('link[rel="icon"]');
    const title: HTMLSpanElement | null = document.querySelector("title");

    (async () => {
      if (!router.isReady) return;
      try {
        let user;
        if (!address) {
          const userHandle = decodeURIComponent(router.asPath).slice(2);
          if (!/^[\w\d]+#\w{6}$/.test(userHandle)) {
            setIsHandlePresent(false);
          }
          const account = new Account();
          user = await account.find(userHandle);
        } else {
          const account = new Account();
          user = await account.get(address);
        }

        if (!user) {
          throw new Error("Account not available.");
        }

        if (
          user.profile.banner ===
          "ar://a0ieiziq2JkYhWamlrUCHxrGYnHWUAMcONxRmfkWt-k"
        ) {
          user = {
            ...user,
            profile: { ...user.profile, bannerURL: "/background.png" },
          };
        }

        if (
          user.profile.avatar ===
          "ar://OrG-ZG2WN3wdcwvpjz1ihPe4MI24QBJUpsJGIdL85wA"
        ) {
          user = {
            ...user,
            profile: {
              ...user.profile,
              avatarURL:
                "https://arweave.net/4eJ0svoPeMtU0VyYODTPDYFrDKGALIt8Js25tUERLPw",
            },
          };
        }

        // Update favicon & title
        if (title) {
          title.innerText = user.profile.name || user.handle;
        }
        if (favicon) {
          favicon.href = user.profile.avatarURL;
        }
        setUserAccount(user);
        try {
          setArweavePrice(await getArweavePrice());
        } catch (e) {
          //
        }
      } catch (error) {
        if (getErrorMessage(error) === "Error: Account not available.") {
          setIsHandlePresent(false);
        } else {
          message.error({
            content: getErrorMessage(error),
            duration: 5,
          });
        }
      }
    })();

    return () => {
      // Reset favicon and title to previous values when component unmounts
      if (favicon) {
        favicon.href = "/favicon.ico";
      }
      if (title) {
        title.innerText = "Buy Me a Storage";
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router.isReady]);

  useEffect(() => {
    if (connectedAddress) {
      (async () => {
        try {
          const account = new Account();
          const user = await account.get(connectedAddress);
          if (user.handle && /^@[\w\d]+#\w{6}$/.test(user.handle)) {
            setName(user.handle);
          }
        } catch (error) {
          //
        }
      })();
    }
  }, [connectedAddress]);

  async function support(e: { preventDefault: () => void }) {
    e.preventDefault();
    setIsLoading(true);
    try {
      if (!connected) {
        await connect();
      }
      if (userAccount?.addr === connectedAddress) {
        throw new Error("You cannot support yourself.");
      }
      if (!userAccount?.addr) {
        throw new Error("No receiver address available.");
      }
      const transaction = await arweave.createTransaction({
        target: userAccount?.addr,
        quantity: supportValue.winston,
      });
      transaction.addTag("App-Name", APP_NAME);
      transaction.addTag("App-Version", APP_VERSION);
      transaction.addTag("Name", name);
      transaction.addTag("Description", description);
      transaction.addTag("Storage-Unit", storageUnit);
      transaction.addTag("Storage-Value", storageValue.toString());
      await walletApi?.sign(transaction);
      const response = await arweave.transactions.post(transaction);
      if (response.status !== 200) {
        throw new Error(
          response?.data?.error ?? "Support failed. Retry again!"
        );
      }
      setSupports((prev) => [
        {
          name,
          description,
          storageUnit,
          storageValue,
          supporter: connectedAddress,
        } as ISupport,
        ...prev,
      ]);
      message.success({
        content: "Thank you for your support.",
        duration: 5,
      });
    } catch (error) {
      message.error({
        content: getErrorMessage(error),
        duration: 5,
      });
    }
    setIsLoading(false);
  }

  useEffect(() => {
    if (arweavePrice) {
      (async () => {
        if (!Number.isNaN(storageValue)) {
          const bytes =
            storageValue *
            Math.pow(
              1024,
              storageUnit === "MB" ? 2 : storageUnit === "GB" ? 3 : 4
            );
          const winstonValue = (await arweave.api.get(`price/${bytes}`)).data;
          const arValue = parseFloat(arweave.ar.winstonToAr(winstonValue));
          setSupportValue((prev) => ({
            ...prev,
            winston: winstonValue,
            ar: arValue,
            usd: arValue * arweavePrice,
          }));
        } else {
          setSupportValue((prev) => ({
            ...prev,
            winston: "0",
            ar: 0,
            usd: 0,
          }));
        }
      })();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [storageValue, storageUnit, arweavePrice]);

  async function getArweavePrice() {
    const response = await (
      await fetch(
        "https://api.coingecko.com/api/v3/simple/price?ids=arweave&vs_currencies=usd"
      )
    ).json();
    return response.arweave.usd;
  }

  async function fetchPosts() {
    setLoading(true);
    const transactions = await ardb
      .search("transactions")
      .from(activeAddress as string)
      .tag("Protocol", `${APP_NAME}-Post-v${APP_VERSION}`)
      .find();
    const _posts: IPost[] = transactions.map((transaction) => {
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

      return {
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
      };
    });
    setPosts(_posts);
    setLoading(false);
  }

  async function fetchImages() {
    setLoading(true);
    const transactions = await ardb
      .search("transactions")
      .from(activeAddress as string)
      .tag("Protocol", `${APP_NAME}-Post-v${APP_VERSION}`)
      .tag("Type", "image")
      .find();

    const _posts: IPost[] = transactions.map((transaction) => {
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

      return {
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
      };
    });
    setImages(_posts);
    setLoading(false);
  }

  useEffect(() => {
    if (activeAddress) {
      fetchPosts();
      fetchImages();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeAddress]);

  const navigateToSingleInfo = () => {
    router.push("/singleItem");
  };

  const breakpointColumnsObj = {
    default: 5,
    1100: 2,
    700: 3,
    500: 2,
  };

  const items: TabsProps["items"] = [
    {
      key: "1",
      label: <p style={{ fontSize: 18 }}>Support</p>,
      children: (
        <Row gutter={[12, 12]}>
          <Col span={12} sm={24} md={12}>
            <div
              style={{
                display: "flex",
                justifyContent: "center",
              }}
            >
              <Card
                title={
                  <Title level={3} style={{ textAlign: "center" }}>
                    Buy{" "}
                    <Text style={{ color: token.colorPrimary, fontSize: 24 }}>
                      {userAccount?.profile.name}
                    </Text>{" "}
                    a Storage
                  </Title>
                }
                style={{ flex: 1, maxWidth: "600px" }}
              >
                <Space
                  direction="vertical"
                  size={16}
                  style={{ width: "100%", marginBottom: 16 }}
                >
                  <Select
                    placeholder="Select storage"
                    defaultValue={storageUnit}
                    onChange={(value) => setStorageUnit(value)}
                    style={{ width: "100%" }}
                  >
                    <Select.Option value="MB">MB</Select.Option>
                    <Select.Option value="GB">GB</Select.Option>
                    <Select.Option value="TB">TB</Select.Option>
                  </Select>

                  <Space direction="horizontal" style={{ width: "100%" }}>
                    <Image src="/icon.svg" height={40} alt="" />
                    <RxCross1 style={{ fontSize: "1.5em" }} />
                    <Radio.Group
                      value={storageValue}
                      onChange={(e) => setStorageValue(e.target.value)}
                      options={storageOptions}
                      optionType="button"
                      buttonStyle="solid"
                    />

                    <Input
                      type="number"
                      min={1}
                      value={storageValue}
                      onChange={(e) =>
                        setStorageValue(parseInt(e.target.value))
                      }
                      style={{ width: "100%" }}
                    />
                  </Space>
                </Space>
                <Space direction="vertical" style={{ width: "100%" }} size={16}>
                  <Input
                    type="text"
                    placeholder="Name (optional)"
                    onChange={(e) => setName(e.target.value)}
                    value={name}
                    style={{ width: "100%" }}
                  />

                  <Input.TextArea
                    placeholder="Say something nice... (optional)"
                    onChange={(e) => setDescription(e.target.value)}
                    value={description}
                    style={{ width: "100%" }}
                  />

                  {supportValue.ar && (
                    <Space
                      style={{ display: "flex", justifyContent: "center" }}
                    >
                      <Tag color="green">{supportValue.ar} AR</Tag>
                      <Tag color="green">~${supportValue.usd}</Tag>
                    </Space>
                  )}

                  <Button
                    type="primary"
                    onClick={support}
                    loading={isLoading}
                    disabled={userAccount?.addr === connectedAddress}
                    shape="round"
                    size="large"
                    block
                  >
                    Support
                  </Button>
                </Space>
              </Card>
            </div>
          </Col>
          <Col span={12} sm={24} md={12}>
            <Supports
              recipient={userAccount?.addr as string}
              supports={supports}
              setSupports={setSupports}
            />
          </Col>
        </Row>
      ),
    },
    {
      key: "2",
      label: <p style={{ fontSize: 18 }}>Posts</p>,
      children: (
        <Row gutter={[16, 16]} style={{ padding: 8 }}>
          {posts.length > 0 ? (
            posts.map((item, index) => (
              <Col span={24} key={index}>
                <Card
                  hoverable
                  style={{
                    width: "100%",
                    border: "1px solid #dfdfdf",
                    background: "white",
                    borderRadius: 12,
                    cursor: "pointer",
                  }}
                  onClick={navigateToSingleInfo}
                >
                  <Space direction="vertical" style={{ width: "100%" }}>
                    <Row justify="space-between">
                      <Typography.Text
                        style={{ fontSize: 18, fontWeight: 600 }}
                      >
                        {item.title}
                      </Typography.Text>
                      <Typography.Text style={{ color: "gray" }}>
                        {item.published}
                      </Typography.Text>
                    </Row>
                    <Row>
                      <Typography.Text style={{ textAlign: "justify" }}>
                        {item.description}
                      </Typography.Text>
                    </Row>
                  </Space>
                </Card>
              </Col>
            ))
          ) : (
            <Empty
              description={
                <Typography.Text style={{ fontSize: 14, color: "gray" }}>
                  No post published yet!
                </Typography.Text>
              }
            />
          )}
        </Row>
      ),
    },
    {
      key: "3",
      label: <p style={{ fontSize: 18 }}>Gallery</p>,
      children: (
        <>
          <Spin spinning={posts.length === 0 && loading}>
            <Row
              gutter={[16, 16]}
              style={{
                height: "calc(100vh - 170px)",
                // minHeight: "160px",
                overflowY: "auto",
              }}
            >
              {images.length > 0 ? (
                <Masonry
                  breakpointCols={breakpointColumnsObj}
                  className="my-masonry-grid"
                  columnClassName="my-masonry-grid_column"
                >
                  {images.map((post, index) => {
                    return (
                      <GalleryImageCard
                        key={index}
                        post={post}
                        imageClickHandler={navigateToSingleInfo}
                      />
                    );
                  })}
                </Masonry>
              ) : (
                <Empty
                  style={{
                    width: "100%",
                    display: "grid",
                    placeItems: "center",
                  }}
                  description={
                    <Typography.Text style={{ fontSize: 14, color: "gray" }}>
                      No Gallery Image!
                    </Typography.Text>
                  }
                />
              )}
            </Row>
          </Spin>
        </>
      ),
    },
  ];

  const onTabChange = (key: string) => {
    console.log(key);
  };

  return (
    <div style={{ height: "100%" }}>
      {!isHandlePresent ? (
        <NotFound />
      ) : userAccount ? (
        <div>
          <ProfileWithData
            addr={userAccount.addr}
            showEditProfile={false}
            userAccount={userAccount}
          />
          <Divider />
          <Tabs
            defaultActiveKey="1"
            items={items}
            onChange={onTabChange}
            style={{ padding: "4px 24px" }}
            tabBarGutter={12}
          />
        </div>
      ) : (
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            marginTop: "100px",
            minHeight: "calc(100vh - 54px)",
          }}
        >
          <Spin size="large" />
        </div>
      )}
    </div>
  );
}
