import { Row, Space, theme, Image } from "antd";
import { Header } from "antd/es/layout/layout";
import { usePathname } from "next/navigation";
import { ConnectButton, useConnection } from "arweave-wallet-kit";
import { customTheme } from "@/config";
import NextLink, { LinkProps } from "next/link";
import React from "react";

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
    key: 1,
    label: "ArProfile",
    href: "/profile",
    isAuthentionRequired: true,
  },
  {
    key: 1,
    label: "Support",
    href: "/support",
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
  const { connected } = useConnection();
  const navItems = NavItems.filter(({ isAuthentionRequired }) =>
    connected ? true : !isAuthentionRequired
  );

  return (
    <Header style={headerStyle}>
      <Row justify="space-between" align="middle">
        <Space direction="horizontal" size={20}>
          <NextLink href="/">
            <Image
              width="38px"
              src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAACXBIWXMAAA7EAAAOxAGVKw4bAAAC+UlEQVRYw7WXS0iUURTHfzNRWZGjQbWy0pKyhZmJi15gQbQqaiM9aBFkFj1oF22koEVUi4oWYQ/SIgqiIip6Qi+QoAdWJmgaBMVo2dOyZJw2/4mPz3Nn5hv1wmVm7v/ce8499/zPORNiYGMsUAJMAbKBVuAmQzxGA1XAA6AXiPvm8aFSHAKqgaih1Dv75JFBHROAuykUe+f0wVReALQFUH4rqFtT3bwByE8i0wY8AzqAZsXA78F6c5fbY0A9MGsoo73aoTwKLJJMGNgLtAPvgafAWWAzkDdQqkUdyr0Bti1JLMSA68C8TAzY6DiwQvgKfV5KIyj79Fw5QQx4aBxU53mal/q+JwA73gIz0lGe7chwxUAE+KJblQJjgCv6nY4RHUBRKgMWGBtbhW3wrL0GJmo9ouxXAdQALUmMaAfGJTNgnbHpvLB640Y1wBKg3HNwGFgPdDmMuJDMgC3GhiPC7qVwcQx4BCyX/FSHN/qAxUH4f0zYjQBBdw7I0tN0Gvh9lwErDeHbwg4GMCAumoaASocXTFbMNIS/6zYLAxoQVyygeuHHdloGhIFPhvAa4Y/TTD4fRNlWecGKrWuuZzhlCDfpoNUpFNf66sB8IFf898u/SwjNUZuVqG5zHQrygNlJDNin/ZMUzMuAYVobbiSsHoBNHiCmSoZRiruAkcBSh/JG4SWKmcT6VY83/hq07Vf1ulXxCuT2uN4ywe06hyvzZcBzAy9VivevfwP4agBv1A2FxOMsKV8lq71vflEpOaxewPJOmYNBjQD7HZtafB1PPnAGuANcViUsFpajNeucBl3kgIGdTjQfzY7Nf5SGCx1siQBbRTlrf7fySgT4bOBrEwcVJSkcCVc3Kb0eBU4q5/ekqAuVOn+7gf9QXPwf5Y4ElMns9WRAgN2GzGHLpYXAiwEqj6o8+9P7L49Mp6eX6DdGALtEkaC3rgXGO84tA04Ah4Bp6bRmOcAO4ImPev7YaFZrntH/wVCacrmi5GRgFPAT+Ai8ksszHv8A8LIPt8fFsuoAAAAASUVORK5CYII="
              alt="logo"
              style={{ borderRadius: "50%" }}
              preview={false}
            />
          </NextLink>
          <Space size={12}>
            {navItems.map((item) => (
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

export default NavBar;
