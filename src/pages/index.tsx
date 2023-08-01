import { Layout } from "antd";
const { Content } = Layout;

import Gallery from "@/components/Gallery";

import React from "react";

const contentStyle: React.CSSProperties = {
  minHeight: "calc(100vh - 54px)",
  padding: 16,
};

export default function Home() {
  return (
    <Content style={contentStyle}>
      <Gallery />
    </Content>
  );
}
