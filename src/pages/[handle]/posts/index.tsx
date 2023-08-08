import React, { useEffect, useState } from "react";
import Account from "arweave-account";
import {
  Typography,
  Space,
  Divider,
  Card,
  Spin,
  message,
  Row,
  Col,
  TabsProps,
  Tabs,
  Empty,
} from "antd";
import {
  ardb,
  capitalizeAndFormat,
  fetchProfile,
  formatHandle,
  getHandle,
} from "@/utils";
import { APP_NAME, APP_VERSION } from "@/utils/constants";
import "@/components/ArProfile/Profile.module.css";
import NotFound from "@/components/Errors/NotFound";
import ProfileWithData from "@/components/ArProfile/ProfileWithData";
import { getErrorMessage } from "@/utils";
import { IPost, ITag } from "@/types";
import { useRouter } from "next/router";
import dayjs from "dayjs";
import { useViewedUserProfileStore } from "@/lib/store";

export default function SupportPage({ address }: { address?: string }) {
  const router = useRouter();
  const { viewedAccount, setViewedAccount } = useViewedUserProfileStore();
  const [isHandlePresent, setIsHandlePresent] = useState(true);
  const [posts, setPosts] = useState<IPost[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const favicon: HTMLLinkElement | null =
      document.querySelector('link[rel="icon"]');
    const title: HTMLSpanElement | null = document.querySelector("title");

    (async () => {
      if (!router.isReady) return;
      if (viewedAccount) return;
      try {
        let userHandle = "";
        if (!address) {
          userHandle = getHandle(
            decodeURIComponent(router.asPath).slice(2).split("/")[0]
          );

          if (!/^[\w\d]+#\w{6}$/.test(userHandle)) {
            setIsHandlePresent(false);
          }
        }

        const user = await fetchProfile({ address, userHandle });
        setViewedAccount(user);

        // Update favicon & title
        if (title) {
          title.innerText = user.profile.name || user.handle;
        }
        if (favicon) {
          favicon.href = user.profile.avatarURL;
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

  async function fetchPosts() {
    setLoading(true);
    try {
      const transactions = await ardb
        .search("transactions")
        .from(address ?? (viewedAccount?.addr as string))
        .tag("Protocol", `${APP_NAME}-Post-v${APP_VERSION}`)
        .tag("Type", ["blog-post", "image-album"])
        .limit(100)
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
          const feeTag = tags.find((tag) => tag.name === "License-Fee");
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
    } catch (error) {
      //
    }
    setLoading(false);
  }

  useEffect(() => {
    if (address || viewedAccount?.addr) {
      fetchPosts();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [address || viewedAccount?.addr]);

  const navigateToSingleInfo = (txId: string) => {
    router.push(`${router.asPath}/${txId}`);
  };

  const items: TabsProps["items"] = [
    {
      key: "1",
      label: <p style={{ fontSize: 18 }}>Support</p>,
      children: <></>,
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
                  onClick={() => navigateToSingleInfo(item.id as string)}
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
              style={{
                width: "100%",
                display: "grid",
                placeItems: "center",
              }}
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
      children: <></>,
    },
  ];

  const onTabChange = (key: string) => {
    if (key === "1") {
      router.push(`/${viewedAccount?.handle.replace("#", "-")}`);
    } else if (key === "2") {
      router.push(`/${viewedAccount?.handle.replace("#", "-")}/posts`);
    } else {
      router.push(`/${viewedAccount?.handle.replace("#", "-")}/gallery`);
    }
  };

  return (
    <div style={{ height: "100%" }}>
      {!isHandlePresent ? (
        <NotFound />
      ) : viewedAccount ? (
        <div>
          <ProfileWithData
            addr={viewedAccount.addr}
            showEditProfile={false}
            userAccount={viewedAccount}
          />
          <Divider />
          <Tabs
            defaultActiveKey="2"
            items={items}
            onChange={onTabChange}
            style={{ padding: "14px 24px" }}
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
