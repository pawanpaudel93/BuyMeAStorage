import React from "react";
import type { MenuProps } from "antd";
import {
  UserOutlined,
  WindowsOutlined,
  TeamOutlined,
  CreditCardOutlined,
  CalendarOutlined,
} from "@ant-design/icons";

type MenuItem = Required<MenuProps>["items"][number];

function getItem(
  label: React.ReactNode,
  key: React.Key,
  icon?: React.ReactNode,
  children?: MenuItem[] | null
): MenuItem {
  return {
    label,
    key,
    icon,
    children,
  } as MenuItem;
}

export const getHomeItems = () => {
  const allItems = [
    getItem("Home", "/home", <WindowsOutlined />),
    getItem("ArProfile", "/profile", <TeamOutlined />),
    getItem("View page", "/view-page", <TeamOutlined />),
    getItem("Support", "/support", <TeamOutlined />),
  ];
  return allItems;
};
export const getPublishItems = () => {
  const allItems = [
    getItem("Posts", "/posts", <CalendarOutlined />),
    getItem("Gallery", "/gallery", <CreditCardOutlined />),
  ];
  return allItems;
};
export const getSettingItems = () => {
  const allItems = [
    getItem("Buttons", "/generate-buttons", <WindowsOutlined />),
  ];
  return allItems;
};
