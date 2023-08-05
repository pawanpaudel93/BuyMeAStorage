import { useEffect, useState } from "react";
import { Button, Empty, Row, Space, Spin, Tabs, Typography } from "antd";
import { UploadOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import UploadModal from "@/components/UploadForm/UploadModal";

import Masonry from "react-masonry-css";

import type { TabsProps } from "antd";
import type { UploadFile } from "antd/es/upload/interface";
import { IPost, ITag } from "@/types";
import { ardb, capitalizeAndFormat } from "@/utils";
import { APP_NAME, APP_VERSION } from "@/utils/constants";
import { useActiveAddress } from "arweave-wallet-kit";
import GalleryImageCard from "@/components/Cards/GalleryImageCard";

export default function Gallery() {
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [fileList, setFileList] = useState<UploadFile<any>[]>([]);
  const activeAddress = useActiveAddress();
  const [posts, setPosts] = useState<IPost[]>([]);
  const [loading, setLoading] = useState(false);

  async function fetchPosts() {
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
    setPosts(_posts);
    setLoading(false);
  }

  useEffect(() => {
    if (activeAddress) {
      fetchPosts();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeAddress]);

  const onChange = (key: string) => {
    console.log(key);
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
      label: <p style={{ fontSize: 18 }}>Gallery Images</p>,
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
              {posts.length > 0 ? (
                <Masonry
                  breakpointCols={breakpointColumnsObj}
                  className="my-masonry-grid"
                  columnClassName="my-masonry-grid_column"
                >
                  {posts.map((post, index) => {
                    return <GalleryImageCard key={index} post={post} />;
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
    // {
    //   key: "2",
    //   label: <p style={{ fontSize: 18 }}>Personal Album</p>,
    //   children: "Content of my photos",
    // },
  ];

  type PositionType = "left" | "right";
  const OperationsSlot: Record<PositionType, React.ReactNode> = {
    left: <></>,
    right: (
      <Button
        type="default"
        style={{ marginRight: 16 }}
        icon={<UploadOutlined />}
        onClick={() => setIsUploadModalOpen(true)}
      >
        Upload File
      </Button>
    ),
  };

  return (
    <>
      <UploadModal
        open={isUploadModalOpen}
        setOpen={setIsUploadModalOpen}
        fileList={fileList}
        setFileList={setFileList}
      />
      <Tabs
        style={{ padding: "16px 24px", borderRadius: 8 }}
        defaultActiveKey="1"
        items={items}
        onChange={onChange}
        tabBarExtraContent={OperationsSlot}
        tabBarGutter={16}
      />
    </>
  );
}
