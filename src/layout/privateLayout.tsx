// import { clearStorage, getHomeItems } from "@/core/utils";
import { customTheme } from "@/config";
import {
  getHomeItems,
  getPublishItems,
  getSettingItems,
} from "@/utils/sidebar.util";
import {
  BellOutlined,
  DownOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
} from "@ant-design/icons";
import {
  Avatar,
  Button,
  Dropdown,
  Layout,
  Menu,
  MenuProps,
  Space,
  Spin,
  theme,
  Typography,
} from "antd";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Suspense, useState } from "react";
import styled from "styled-components";

const { Header, Footer, Sider, Content } = Layout;

const { useToken, getDesignToken } = theme;

const globalToken = getDesignToken(customTheme);

const MenuWrapper = styled.div`
  .ant-menu-item-selected {
    background-color: #fae7e6 !important;
    color: #a62a22;
  }
`;

const siderStyle: React.CSSProperties = {
  height: "100vh",
  width: "clamp(220px,16.36%, 280px)",
  backgroundColor: globalToken.colorPrimary,
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
};

function PrivateLayout({ children }: { children: React.ReactNode }) {
  const { token } = useToken();
  const router = useRouter();

  const [collapsed, setCollapsed] = useState(false);

  return (
    <Layout>
      <Sider
        collapsed={collapsed}
        collapsedWidth="0"
        //   zeroWidthTriggerStyle="none"
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
                <Typography.Text
                  style={{
                    color: "white",
                    fontSize: "16px",
                    fontWeight: 500,
                  }}
                >
                  MDT
                </Typography.Text>
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
              background: token.colorPrimary,
              color: "white",
            }}
            items={getHomeItems()}
            selectedKeys={[location.pathname]}
          />
          <Space style={{ width: "100%", padding: "6px 10px" }}>
            <Typography.Text
              style={{ color: "#dfdfdf", fontWeight: 500, fontSize: 12 }}
            >
              PUBLISH
            </Typography.Text>
          </Space>
          <Menu
            mode="inline"
            onClick={({ key }) => router.push(key)}
            style={{
              background: token.colorPrimary,
              color: "white",
            }}
            items={getPublishItems()}
            selectedKeys={[location.pathname]}
          />
          <Space style={{ width: "100%", padding: "6px 10px" }}>
            <Typography.Text
              style={{ color: "#dfdfdf", fontWeight: 500, fontSize: 12 }}
            >
              SETTINGS
            </Typography.Text>
          </Space>
          <Menu
            mode="inline"
            onClick={({ key }) => router.push(key)}
            style={{
              background: token.colorPrimary,
              color: "white",
            }}
            items={getSettingItems()}
            selectedKeys={[location.pathname]}
          />
        </MenuWrapper>
      </Sider>
      <Layout>
        <Header style={headerStyle}>
          <Space>
            {collapsed ? (
              <Button
                type="text"
                icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
                onClick={() => setCollapsed(!collapsed)}
                style={{
                  fontSize: "16px",
                  display: "grid",
                  placeItems: "center",
                }}
              />
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
              Title
            </Typography.Text>
          </Space>
          <Space
            style={{
              lineHeight: "48px",
              padding: "0px 32px 0px 40px",
            }}
          >
            <Avatar
              style={{
                background: token.colorPrimary,
                height: 32,
                width: 32,
              }}
            >
              M
            </Avatar>
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
