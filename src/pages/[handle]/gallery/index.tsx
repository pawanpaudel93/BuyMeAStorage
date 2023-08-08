import React, { useEffect, useState } from "react";
import {
  Typography,
  Divider,
  Spin,
  message,
  Row,
  TabsProps,
  Tabs,
  Empty,
} from "antd";
import { ardb, capitalizeAndFormat, fetchProfile, getHandle } from "@/utils";
import { APP_NAME, APP_VERSION } from "@/utils/constants";
import "@/components/ArProfile/Profile.module.css";
import NotFound from "@/components/Errors/NotFound";
import ProfileWithData from "@/components/ArProfile/ProfileWithData";
import { getErrorMessage } from "@/utils";
import { IPost, ITag } from "@/types";
import { useRouter } from "next/router";
import dayjs from "dayjs";
import Masonry from "react-masonry-css";
import GalleryImageCard from "@/components/Cards/GalleryImageCard";
import { useViewedUserProfileStore } from "@/lib/store";

export default function Gallery({ address }: { address?: string }) {
  const router = useRouter();
  const { viewedAccount, setViewedAccount } = useViewedUserProfileStore();
  const [isHandlePresent, setIsHandlePresent] = useState(true);
  const [images, setImages] = useState<IPost[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const favicon: HTMLLinkElement | null =
      document.querySelector('link[rel="icon"]');
    const title: HTMLSpanElement | null = document.querySelector("title");

    (async () => {
      if (!router.isReady) return;
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

  async function fetchImages() {
    setLoading(true);
    try {
      const transactions = await ardb
        .search("transactions")
        .from(address ?? (viewedAccount?.addr as string))
        .tag("Protocol", `${APP_NAME}-Post-v${APP_VERSION}`)
        .tag("Type", "image")
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
        const previewTag = tags.find((tag) => tag.name === "Preview");
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
          link: `https://arweave.net/${
            previewTag ? previewTag.value : transaction.id
          }`,
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
    } catch (error) {
      //
    }
    setLoading(false);
  }

  useEffect(() => {
    if (address || viewedAccount?.addr) {
      fetchImages();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [address || viewedAccount?.addr]);

  const navigateToSingleInfo = (txId: string) => {
    router.push(`${router.asPath}/${txId}`);
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
      children: <></>,
    },
    {
      key: "2",
      label: <p style={{ fontSize: 18 }}>Posts</p>,
      children: <></>,
    },
    {
      key: "3",
      label: <p style={{ fontSize: 18 }}>Gallery</p>,
      children: (
        <>
          <Spin spinning={images.length === 0 && loading}>
            <Row gutter={[16, 16]}>
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
                        imageClickHandler={() => navigateToSingleInfo(post.id!)}
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
            defaultActiveKey="3"
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
