import { customTheme } from "@/config";
import {
  getHomeItems,
  getPublishItems,
  getSettingItems,
} from "@/utils/sidebar.util";
import { MenuFoldOutlined, MenuUnfoldOutlined } from "@ant-design/icons";
import {
  Button,
  Image,
  Layout,
  Menu,
  Space,
  Spin,
  theme,
  Typography,
} from "antd";
import { useRouter } from "next/router";
import { Suspense, useEffect, useState } from "react";
import styled from "styled-components";
import { ConnectButton } from "arweave-wallet-kit";
import { useConnectedUserStore } from "@/lib/store";

const { Header, Sider, Content } = Layout;

const { getDesignToken } = theme;

const globalToken = getDesignToken(customTheme);

const MenuWrapper = styled.div`
  .ant-menu-item-selected {
    background-color: #fae7e6 !important;
    color: #a62a22;
  }
  .ant-menu-item {
    &:hover {
      background-color: #fae7e6 !important;
      color: #a62a22;
    }
  }
`;

const siderStyle: React.CSSProperties = {
  height: "100vh",

  backgroundColor: "#161b21",
};
const headerStyle: React.CSSProperties = {
  height: 54,
  background: "white",
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  padding: "0 8px",
  borderBottom: "1px solid #dfdfdf",
};

const contentStyle: React.CSSProperties = {
  height: "calc(100vh - 54px)",
  overflow: "auto",
};

function PrivateLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [collapsed, setCollapsed] = useState(false);
  const { userAccount } = useConnectedUserStore();

  return (
    <Layout>
      <Sider
        collapsed={collapsed}
        collapsedWidth="0"
        width="clamp(220px,15%, 280px)"
        style={siderStyle}
      >
        <div
          className="demo-logo-vertical"
          style={{
            height: "48px",
            display: "flex",
            justifyContent: collapsed ? "center" : "space-between",
            alignItems: "center",
            color: "white",
            padding: "16px",
            marginBottom: "32px",
          }}
        >
          <div
            className="logo"
            style={{
              color: "#fff",
              display: "flex",
            }}
          >
            <Space size={10} style={{ display: "flex", alignItems: "center" }}>
              {!collapsed && (
                <Image
                  width="32px"
                  src="/icon.svg"
                  alt="logo"
                  style={{ borderRadius: "50%" }}
                  preview={false}
                />
              )}
            </Space>
          </div>
          {!collapsed && (
            <Button
              type="text"
              icon={<MenuFoldOutlined />}
              onClick={() => setCollapsed(!collapsed)}
              style={{
                fontSize: "16px",
                color: "white",
                display: "grid",
                placeItems: "center",
              }}
            />
          )}
        </div>
        <MenuWrapper>
          <Menu
            mode="inline"
            onClick={({ key }) => router.push(key)}
            style={{
              background: "#161b21",
              color: "white",
            }}
            items={getHomeItems(userAccount?.handle ?? "")}
            selectedKeys={[router.pathname]}
          />
          <Space style={{ width: "100%", padding: "6px 10px" }}>
            <Typography.Text style={{ color: "#dfdfdf", fontSize: 10 }}>
              PUBLISH
            </Typography.Text>
          </Space>
          <Menu
            mode="inline"
            onClick={({ key }) => router.push(key)}
            style={{
              background: "#161b21",
              color: "white",
            }}
            items={getPublishItems()}
            selectedKeys={
              router.pathname.includes("posts") ? ["/posts"] : [router.pathname]
            }
          />
          <Space style={{ width: "100%", padding: "6px 10px" }}>
            <Typography.Text style={{ color: "#dfdfdf", fontSize: 10 }}>
              SETTINGS
            </Typography.Text>
          </Space>
          <Menu
            mode="inline"
            onClick={({ key }) => router.push(key)}
            style={{
              background: "#161b21",
              color: "white",
            }}
            items={getSettingItems()}
            selectedKeys={[router.pathname]}
          />
        </MenuWrapper>
      </Sider>
      <Layout>
        <Header style={headerStyle}>
          <Space>
            {collapsed ? (
              <Space>
                <Button
                  type="text"
                  icon={
                    collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />
                  }
                  onClick={() => setCollapsed(!collapsed)}
                  style={{
                    fontSize: "16px",
                    display: "grid",
                    placeItems: "center",
                  }}
                />
                <Image
                  width="32px"
                  src="/icon.svg"
                  alt="logo"
                  style={{ borderRadius: "50%" }}
                  preview={false}
                />
              </Space>
            ) : (
              <div />
            )}
            <Typography.Text
              style={{
                color: "black",
                fontSize: "16px",
                fontWeight: 500,
                marginLeft: "15px",
              }}
            >
              {/* Title */}
            </Typography.Text>
          </Space>
          <Space
            style={{
              lineHeight: "48px",
              padding: "0px 32px 0px 40px",
            }}
          >
            <ConnectButton
              accent={globalToken.colorPrimary}
              style={{
                height: "34px",
              }}
            />
          </Space>
        </Header>
        <Content style={contentStyle}>
          <Suspense
            fallback={
              <div
                style={{
                  display: "grid",
                  placeItems: "center",
                  minHeight: "calc(100vh - 54px)",
                }}
              >
                <Spin />
              </div>
            }
          >
            {children}
          </Suspense>
        </Content>
      </Layout>
    </Layout>
  );
}

export default PrivateLayout;
