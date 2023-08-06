import React from "react";
import type { MenuProps } from "antd";
import {
  WindowsOutlined,
  TeamOutlined,
  CreditCardOutlined,
  CalendarOutlined,
} from "@ant-design/icons";
import { SUPPORT_HANDLE } from "./constants";

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

export const getHomeItems = (userHandle: string) => {
  const allItems = [
    getItem("Home", "/home", <WindowsOutlined />),
    getItem("ArProfile", "/profile", <TeamOutlined />),
  ];
  if (userHandle) {
    allItems.push(getItem("View page", `/${userHandle}`, <TeamOutlined />));
  }
  allItems.push(getItem("Support", `/${SUPPORT_HANDLE}`, <TeamOutlined />));
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
