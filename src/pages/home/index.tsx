import {
  Avatar,
  Button,
  Col,
  Dropdown,
  MenuProps,
  Row,
  Space,
  Typography,
  message,
  theme,
} from "antd";
import {
  UploadOutlined,
  QrcodeOutlined,
  FileTextOutlined,
  HeartOutlined,
  HeartFilled,
} from "@ant-design/icons";
import { useEffect, useState } from "react";
import QrModal from "@/components/QrCode";
import { useConnectedUserStore } from "@/lib/store";
import { COLORS, ardb, capitalizeAndFormat } from "@/utils";
import { useActiveAddress } from "arweave-wallet-kit";
import { APP_NAME } from "@/utils/constants";
import { ITag } from "@/types";

const { useToken } = theme;

interface CustomTag {
  [key: string]: number;
}

export default function HomePage() {
  const { token } = useToken();
  const [isQrModalOpen, setIsQrModalOpen] = useState(false);
  const connectedAddress = useActiveAddress();
  const { userAccount } = useConnectedUserStore();
  const [myProfileUrl, setMyProfileUrl] = useState(
    `/${userAccount?.handle ?? ""}`
  );
  const [stats, setStats] = useState({ earnings: 0, supporters: 0 });
  const [licenseStats, setLicenseStats] = useState<CustomTag>({});
  const [licenseEarnings, setLicenseEarnings] = useState({
    U: 0,
    AR: 0,
  });

  async function fetchAllSupports() {
    const transactions = await ardb
      .search("transactions")
      .appName(APP_NAME)
      .tag("Payment-Type", "Support")
      .to(connectedAddress as string)
      // .limit(100)
      .findAll();

    if (transactions.length === 0) return;

    let earnings = 0;
    let supporters = 0;

    const supportersSet = new Set<string>();

    transactions.forEach((transaction) => {
      // @ts-ignore
      const tags = transaction.tags as ITag[];
      const storageUnit = tags.find((t) => t.name === "Storage-Unit");
      const storageValue = tags.find((t) => t.name === "Storage-Value");
      // @ts-ignore
      const supporter = transaction.owner.address;
      if (!supportersSet.has(supporter)) {
        supportersSet.add(supporter);
        supporters += 1;
      }

      if (storageUnit?.value === "MB") {
        earnings += Number(storageValue?.value);
      } else if (storageUnit?.value === "GB") {
        earnings += Number(storageValue?.value) * 1024;
      } else if (storageUnit?.value === "TB") {
        earnings += Number(storageValue?.value) * 1024 * 1024;
      }
    });
    setStats((prevStats) => ({ ...prevStats, earnings, supporters }));
  }

  async function fetchAllLicensePayments() {
    const transactions = await ardb
      .search("transactions")
      .appName(APP_NAME)
      .tags([
        { name: "Payment-Type", values: ["License"] },
        { name: "Payment-To", values: [connectedAddress as string] },
      ])
      // .limit(100)
      .findAll();

    if (transactions.length === 0) return;

    const stats: CustomTag = {};
    const earnings = { U: 0, AR: 0 };

    transactions.forEach((transaction) => {
      // @ts-ignore
      const tags = transaction.tags as ITag[];

      const licenseTag = tags.find(
        (tag) =>
          tag.name === "Access" ||
          tag.name === "Derivation" ||
          tag.name === "Commercial-Use"
      );

      if (licenseTag) {
        const feeTag = tags.find((tag) => tag.name === "License-Fee");
        if (feeTag) {
          const name = capitalizeAndFormat(
            `${licenseTag.name}-${licenseTag.value}`
          );
          if (name in stats) {
            // @ts-ignore
            stats[name] += 1;
          } else {
            // @ts-ignore
            stats[name] = 1;
          }
          const amount = parseFloat(feeTag.value.split("-")[2]);
          const currency =
            tags.find((tag) => tag.name === "Currency")?.value ?? "U";

          // @ts-ignore
          earnings[currency] += amount;
        }
      }
    });
    setLicenseStats(stats);
    setLicenseEarnings(earnings);
  }

  const items: MenuProps["items"] = [
    {
      key: "1",
      label: "Copy",
      icon: <FileTextOutlined />,
    },
    {
      key: "2",
      label: " QR Code",
      icon: <QrcodeOutlined />,
    },
  ];

  useEffect(() => {
    setMyProfileUrl(`${window.location.origin}/${userAccount?.handle ?? ""}`);
  }, [userAccount?.handle]);

  const copyToClipBoard = async () => {
    try {
      await navigator.clipboard.writeText(myProfileUrl);
      message.success("Profile link copied to the clipboard!");
    } catch (err) {
      message.error("Failed to copy!");
    }
  };

  const handleMenuClick: MenuProps["onClick"] = ({ key }) => {
    if (key === "1") {
      copyToClipBoard();
    }
    if (key === "2") {
      setIsQrModalOpen(true);
    }
  };

  useEffect(() => {
    if (connectedAddress) {
      fetchAllSupports();
      fetchAllLicensePayments();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [connectedAddress]);

  return (
    <div
      style={{
        background: "white",
        minHeight: "calc(100vh - 94px)",
        color: "white",
        margin: "16px 24px",
        padding: "12px 32px",
      }}
    >
      <QrModal
        qrValue={myProfileUrl}
        open={isQrModalOpen}
        setOpen={setIsQrModalOpen}
      />
      <Row
        style={{
          borderBottom: "1px solid #dfdfdf",
          padding: 12,
        }}
        justify="space-between"
        align="middle"
      >
        <Col xs={24} md={21}>
          <Space size={10}>
            {
              <Avatar
                style={{
                  width: 54,
                  height: 54,
                  fontSize: 28,
                  display: "grid",
                  placeItems: "center",
                  background: token.colorPrimary,
                }}
              >
                {userAccount?.profile.name.slice(0, 1)}
              </Avatar>
            }
            <Space direction="vertical" size={1}>
              <Typography.Text
                style={{
                  display: "inline-block",
                  fontSize: 22,
                  transform: "scale(1, 1.1)",
                  fontWeight: 600,
                }}
              >
                Welcome, {userAccount?.profile.name}
              </Typography.Text>
              <Typography.Text style={{ color: "gray" }}>
                {myProfileUrl.replace(/^https?:\/\//, "")}
              </Typography.Text>
            </Space>
          </Space>
        </Col>
        <Col xs={24} md={3}>
          <Dropdown
            menu={{ items, onClick: handleMenuClick }}
            trigger={["click"]}
          >
            <Button
              size="large"
              icon={<UploadOutlined />}
              style={{ borderRadius: 18, width: "100%" }}
            >
              Share Profile
            </Button>
          </Dropdown>
        </Col>
      </Row>
      <Row
        style={{
          borderBottom: "1px solid #dfdfdf",
          padding: 12,
        }}
        gutter={[16, 8]}
      >
        <Col span={24}>
          <Typography.Text
            style={{
              display: "inline-block",
              fontSize: 20,
              transform: "scale(1, 1.1)",
              fontWeight: 500,
            }}
          >
            Earnings
          </Typography.Text>
        </Col>
        <Col span={24}>
          <Typography.Text
            style={{
              fontSize: 28,
              fontWeight: 600,
              color: "gray",
            }}
          >
            TOTAL SUPPORTS:{" "}
            <span style={{ color: token.colorPrimary }}>
              {stats.earnings} MB
            </span>
          </Typography.Text>
        </Col>
        <Col span={24}>
          <Typography.Text
            style={{
              display: "inline-block",
              fontSize: 20,
              transform: "scale(1, 1.1)",
              fontWeight: 500,
            }}
          >
            License Earnings: ({licenseEarnings.AR} AR, {licenseEarnings.U} U)
          </Typography.Text>
          <Row gutter={[16, 16]}>
            {Object.entries(licenseStats).map(([key, value], index) => (
              <Col key={index} xs={24} flex="auto">
                <Space align="baseline">
                  <div
                    style={{
                      background: COLORS[index],
                      height: "12px",
                      width: "12px",
                    }}
                  ></div>
                  <Typography.Text>{` ${value} - UDL ${key}`}</Typography.Text>
                </Space>
              </Col>
            ))}
          </Row>
        </Col>
      </Row>
      <Row
        gutter={[16, 16]}
        style={{
          marginTop: 24,
          border: "1px solid #dfdfdf",
          borderRadius: 12,
          padding: 12,
        }}
      >
        <Col span={24}>
          <Space
            direction="vertical"
            size={4}
            style={{ width: "100%", textAlign: "center", padding: 32 }}
          >
            {stats.supporters > 0 ? (
              <>
                <HeartFilled style={{ fontSize: 32, color: "red" }} />
                <Typography.Text style={{ fontWeight: 500, fontSize: 18 }}>
                  You have {stats.supporters} supporters
                </Typography.Text>
              </>
            ) : (
              <>
                <HeartOutlined
                  style={{ fontSize: 32, color: token.colorPrimary }}
                />
                <Typography.Text style={{ fontWeight: 500, fontSize: 18 }}>
                  You do not have any supporter yet
                </Typography.Text>
                <Typography.Text style={{ fontSize: 14, color: "gray" }}>
                  Share your page with your audience to get started.
                </Typography.Text>
              </>
            )}
          </Space>
        </Col>
        {/* <Col span={24} style={{ display: "flex", justifyContent: "center" }}>
          <Typography.Text
            style={{
              fontSize: 20,
              transform: "scale(1, 1.1)",
              fontWeight: 500,
            }}
          >
            Supporter Count
          </Typography.Text>
        </Col> */}
        {/* <Col span={24}>
          <Typography.Text
            style={{
              fontSize: 28,
              fontWeight: 600,
              color: "gray",
            }}
          >
            TOTAL:{" "}
            <span style={{ color: token.colorPrimary }}>20 Supporters</span>
          </Typography.Text>
        </Col> */}
      </Row>
    </div>
  );
}
