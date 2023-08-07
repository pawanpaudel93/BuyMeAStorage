import { Row, Space, theme, Image } from "antd";
import { Header } from "antd/es/layout/layout";
import { usePathname } from "next/navigation";
import { ConnectButton } from "arweave-wallet-kit";
import { customTheme } from "@/config";
import NextLink, { LinkProps } from "next/link";
import React from "react";
import { withPublicRoutes } from "@/hoc";
import { SUPPORT_HANDLE } from "@/utils/constants";

const { getDesignToken } = theme;

const globalToken = getDesignToken(customTheme);

const headerStyle: React.CSSProperties = {
  height: 54,
  lineHeight: "54px",
  backgroundColor: globalToken.colorBgBase,
  color: "black",
  boxShadow: "0 2px 3px -2px rgba(0,0,0,0.3)",
};

interface NavItem {
  key: number;
  label: string;
  href?: string;
  isAuthentionRequired?: boolean;
}

interface NavLinkProps extends LinkProps {
  children?: string | React.ReactNode;
  href: string;
}

const NavItems: Array<NavItem> = [
  {
    key: 0,
    label: "Home",
    href: "/",
    isAuthentionRequired: false,
  },
  {
    key: 0,
    label: "Support",
    href: `/${SUPPORT_HANDLE}`,
    isAuthentionRequired: false,
  },
];

const NavLink = ({ href, children }: NavLinkProps) => {
  const pathname = usePathname();
  const isActive = pathname === href;

  if (isActive) {
    return (
      <NextLink
        style={{
          fontWeight: "bold",
          color: globalToken.colorPrimaryActive,
          paddingLeft: 8,
          paddingRight: 8,
          paddingTop: 6,
          paddingBottom: 6,
          border: "1px solid",
          borderRadius: "3px",
        }}
        href={href}
      >
        {children}
      </NextLink>
    );
  }

  return (
    <NextLink
      style={{
        color: globalToken.colorPrimary,
        paddingLeft: 8,
        paddingRight: 8,
        paddingTop: 6,
        paddingBottom: 6,
        borderRadius: "3px",
      }}
      href={href}
    >
      {children}
    </NextLink>
  );
};

const NavBar = () => {
  return (
    <Header style={headerStyle}>
      <Row justify="space-between" align="middle">
        <Space direction="horizontal" size={20}>
          <NextLink href="/">
            <Image
              width="38px"
              src="/logo.svg"
              alt="logo"
              style={{ borderRadius: "50%" }}
              preview={false}
            />
          </NextLink>
          <Space size={12}>
            {NavItems.map((item) => (
              <NavLink key={item.key} href={item.href as string}>
                {item.label}
              </NavLink>
            ))}
          </Space>
        </Space>

        <ConnectButton
          accent={globalToken.colorPrimary}
          style={{
            height: "34px",
          }}
        />
      </Row>
    </Header>
  );
};

export default withPublicRoutes(NavBar);
