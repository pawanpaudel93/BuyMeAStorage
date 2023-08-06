import React from "react";
import { ISupport } from "@/types";
import { Avatar, Card, Tag, Typography } from "antd";

const { Text, Link } = Typography;

export default function Support({ support }: { support: ISupport }) {
  const bg = "#f0f0f0"; // Update the background color as per your design

  const arweaveAddressPattern = /^[a-zA-Z0-9_-]{43}$/;
  const isArProfile = /^@[\w\d]+[#-]\w{6}$/.test(support.name);

  function isArweaveAddress(name: string) {
    return arweaveAddressPattern.test(name);
  }

  function shortenArweaveAddress(name: string) {
    return isArweaveAddress(name)
      ? name.slice(0, 5) + "..." + name.slice(38)
      : name;
  }

  return (
    <Card
      style={{
        width: "100%",
        boxShadow: "0px 4px 8px rgba(0, 0, 0, 0.1)",
      }}
    >
      <div style={{ display: "flex", alignItems: "center" }}>
        <Avatar>{support.name[0]}</Avatar>
        <div style={{ flex: 1, marginLeft: 8 }}>
          <Link
            style={{
              fontWeight: "bold",
              color: "#485aff",
            }}
            href={
              isArProfile
                ? `/${support.name}`
                : `https://viewblock.io/arweave/address/${support.supporter}`
            }
          >
            {shortenArweaveAddress(support.name)}
          </Link>{" "}
          bought{" "}
          <Tag style={{ fontWeight: "bold" }}>
            {support.storageValue} {support.storageUnit}
          </Tag>{" "}
          storage.
        </div>
      </div>
      {support.description && (
        <div
          style={{
            background: bg,
            padding: 12,
            borderRadius: 12,
            marginTop: 12,
          }}
        >
          <Text>{support.description}</Text>
        </div>
      )}
    </Card>
  );
}
