import { useEffect, useState } from "react";
import {
  Button,
  Card,
  Image,
  Row,
  Col,
  Space,
  Spin,
  Tabs,
  Typography,
  TabsProps,
} from "antd";
import { BookOutlined, ProjectOutlined } from "@ant-design/icons";
import { useRouter } from "next/navigation";
import { ardb } from "@/utils";
import { APP_NAME, APP_VERSION } from "@/utils/constants";
import { useActiveAddress } from "arweave-wallet-kit";
import { IPost, ITag } from "@/types";
import dayjs from "dayjs";
import usePersistStore from "@/lib/store/persist";

const { Text } = Typography;

export default function Posts() {
  const router = useRouter();
  const activeAddress = useActiveAddress();
  const [posts, setPosts] = useState<IPost[]>([]);
  const draftPost = usePersistStore((state) => state.post);
  const [loading, setLoading] = useState(false);

  async function fetchPosts() {
    setLoading(true);
    const transactions = await ardb
      .search("transactions")
      .from(activeAddress as string)
      .tag("Protocol", `${APP_NAME}-Post-v${APP_VERSION}`)
      .find();

    const _posts: IPost[] = transactions.map((transaction) => {
      // @ts-ignore
      const tags = transaction._tags as ITag[];
      const titleTag = tags.find((tag) => tag.name === "Title");
      const descriptionTag = tags.find((tag) => tag.name === "Description");
      const publishedTag = tags.find(
        (tag) => tag.name === "Published" || tag.name === "Published-At"
      );
      const topics = tags
        .filter((tag) => tag.name.startsWith("topic:"))
        .map((tag) => tag.value);

      return {
        id: transaction.id,
        title: titleTag?.value ?? "",
        description: descriptionTag?.value ?? "",
        topics: topics.join(", "),
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

  const items: TabsProps["items"] = [
    {
      key: "1",
      label: <p style={{ fontSize: 18 }}>Published Posts</p>,
      children: (
        <>
          <Row gutter={[16, 16]}>
            {posts.map((item, index) => (
              <Col span={24} key={index}>
                <Space
                  direction="vertical"
                  style={{
                    width: "100%",
                    padding: 16,
                    border: "1px solid #dfdfdf",
                    background: "white",
                    borderRadius: 12,
                  }}
                >
                  <Row justify="space-between">
                    <Typography.Text style={{ fontSize: 18, fontWeight: 600 }}>
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
              </Col>
            ))}
          </Row>
          <Space
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              marginTop: 16,
            }}
          >
            {loading && <Spin size="large" />}
            {!loading && posts.length === 0 && <Text>No published posts</Text>}
          </Space>
        </>
      ),
    },
  ];

  if (
    draftPost.title !== "" &&
    draftPost.description !== "" &&
    draftPost.content !== ""
  ) {
    items.push({
      key: "2",
      label: <p style={{ fontSize: 18 }}>Draft Posts</p>,
      children: (
        <Row
          gutter={[16, 16]}
          style={{
            cursor: "pointer",
          }}
          onClick={() => router.push("/posts/new-post")}
        >
          <Col span={24}>
            <Space
              direction="vertical"
              style={{
                width: "100%",
                padding: 16,
                border: "1px solid gray",
                background: "white",
                borderRadius: 12,
              }}
            >
              <Row justify="space-between">
                <Typography.Text style={{ fontSize: 18, fontWeight: 600 }}>
                  {draftPost.title}
                </Typography.Text>
                <Typography.Text style={{ color: "gray" }}></Typography.Text>
              </Row>
              <Row>
                <Typography.Text style={{ textAlign: "justify" }}>
                  {draftPost.description}
                </Typography.Text>
              </Row>
            </Space>
          </Col>
        </Row>
      ),
    });
  }

  useEffect(() => {
    if (activeAddress) {
      fetchPosts();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeAddress]);

  return (
    <>
      <Space
        style={{ padding: "16px 32px", width: "100%" }}
        direction="vertical"
      >
        <Row>
          <Typography.Text style={{ fontSize: 18, fontWeight: 500 }}>
            Publish new post/album
          </Typography.Text>
        </Row>
        <Row gutter={[16, 16]}>
          <Col span={12}>
            <Button
              icon={<BookOutlined />}
              style={{
                width: "100%",
                height: "60px",
                fontSize: "1.5em",
                color: "gray",
              }}
              onClick={() => router.push("/posts/new-post")}
            >
              Write a post
            </Button>
          </Col>
          <Col span={12}>
            <Button
              icon={<ProjectOutlined />}
              style={{
                width: "100%",
                height: "60px",
                fontSize: "1.5em",
                color: "gray",
              }}
              onClick={() => router.push("/posts/new-photo")}
            >
              Add an image
            </Button>
          </Col>
        </Row>
        <Row>
          <Tabs
            style={{
              borderRadius: 8,
              width: "100%",
            }}
            defaultActiveKey="1"
            items={items}
            // onChange={onChange}
            tabBarGutter={16}
          />
        </Row>
      </Space>
    </>
  );
}
