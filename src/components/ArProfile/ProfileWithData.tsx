import React, { useState } from "react";
import {
  Avatar,
  Button,
  Image,
  Tooltip,
  Typography,
  message,
  theme,
} from "antd";
import {
  TwitterOutlined,
  GithubOutlined,
  InstagramOutlined,
  FacebookOutlined,
  ToolOutlined,
  ShoppingCartOutlined,
  CheckOutlined,
} from "@ant-design/icons";
import { FaDiscord } from "react-icons/fa";
import { ArAccount } from "arweave-account";
import EditProfileModal from "./EditProfileModal";
import { useRouter } from "next/router";
import { AiOutlineCopy } from "react-icons/ai";
import { styled } from "styled-components";
import { customTheme } from "@/config";

const { Text } = Typography;

const { useToken, getDesignToken } = theme;

const globalToken = getDesignToken(customTheme);

const StyledButton = styled(Button)`
  &:hover {
    color: ${globalToken.colorPrimary} !important;
  }
`;

export default function ProfileWithData({
  userAccount,
  showEditProfile,
  addr,
  refetch,
}: {
  addr: string;
  userAccount: ArAccount;
  showEditProfile: boolean;
  refetch?: () => void;
}) {
  const router = useRouter();
  const { token } = useToken();
  const [isOpen, setIsOpen] = useState(false);
  const [isCopying, setIsCopying] = useState(false);

  const onClose = () => {
    setIsOpen(false);
  };

  const onOpen = () => {
    setIsOpen(true);
  };

  const copyToClipBoard = async () => {
    try {
      setIsCopying(true);
      await navigator.clipboard.writeText(
        `${window.location.origin}/${userAccount.handle.replace("#", "-")}`
      );
      message.success("Copied!");
      setTimeout(() => {
        setIsCopying(false);
      }, 2000);
    } catch (err) {
      message.error("Failed to copy!");
      setTimeout(() => {
        setIsCopying(false);
      }, 2000);
    }
  };

  return (
    <div style={{ width: "100%" }}>
      <EditProfileModal
        addr={addr}
        profile={userAccount.profile}
        isOpen={isOpen}
        onClose={onClose}
        refetch={refetch}
      />
      <div>
        <img
          style={{
            height: "330px",
            width: "100%",
            objectFit: "cover",
          }}
          src={userAccount.profile.bannerURL}
          alt="Banner"
        />
      </div>
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          marginTop: "-60px",
        }}
      >
        <Avatar
          size={120}
          src={userAccount.profile.avatarURL}
          style={{
            border: `2px solid ${token.colorPrimary}`,
            background: "white",
          }}
        />
      </div>

      <div style={{ padding: "12px 16px 16px 16px" }}>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "3px",
          }}
        >
          <Text style={{ fontSize: "1.5rem", fontWeight: 500 }}>
            {userAccount.profile.name}
          </Text>
          <div style={{ display: "flex", gap: 4 }}>
            <Text style={{ color: "gray.500" }}>
              <a
                href={`https://viewblock.io/arweave/address/${addr}`}
                target="_blank"
                rel="noreferrer"
              >
                {userAccount.handle}{" "}
              </a>{" "}
            </Text>

            <Button
              size="small"
              style={{ padding: 2 }}
              icon={
                isCopying ? <CheckOutlined /> : <AiOutlineCopy size="auto" />
              }
              onClick={copyToClipBoard}
            ></Button>
          </div>

          <Text style={{ textAlign: "center" }}>{userAccount.profile.bio}</Text>
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "center",
            gap: 12,
            marginBottom: showEditProfile ? 16 : 0,
          }}
        >
          {userAccount.profile.links.twitter && (
            <a
              href={`https://twitter.com/${userAccount.profile.links.twitter}`}
              target="_blank"
              rel="noreferrer"
            >
              <StyledButton
                icon={<TwitterOutlined style={{ fontSize: 25 }} />}
                style={{
                  background: "transparent",
                  border: "none",
                  color: "#00acee",
                }}
              />
            </a>
          )}
          {userAccount.profile.links.github && (
            <a
              href={`https://github.com/${userAccount.profile.links.github}`}
              target="_blank"
              rel="noreferrer"
            >
              <StyledButton
                icon={<GithubOutlined style={{ fontSize: 25 }} />}
                style={{
                  background: "transparent",
                  border: "none",
                  color: "#161b21",
                }}
              />
            </a>
          )}
          {userAccount.profile.links.instagram && (
            <a
              href={`https://instagram.com/${userAccount.profile.links.instagram}`}
              target="_blank"
              rel="noreferrer"
            >
              <StyledButton
                icon={<InstagramOutlined style={{ fontSize: 25 }} />}
                style={{
                  background: "transparent",
                  border: "none",
                  color: "#f6a4c8",
                }}
              />
            </a>
          )}
          {userAccount.profile.links.facebook && (
            <a
              href={`https://facebook.com/${userAccount.profile.links.facebook}`}
              target="_blank"
              rel="noreferrer"
            >
              <StyledButton
                icon={<FacebookOutlined style={{ fontSize: 25 }} />}
                style={{
                  background: "transparent",
                  border: "none",
                  color: "#3b5998",
                }}
              />
            </a>
          )}
          {userAccount.profile.links.discord && (
            <Tooltip
              title={userAccount.profile.links.discord}
              placement="bottom"
            >
              <span>
                <StyledButton
                  icon={<FaDiscord style={{ fontSize: 25 }} />}
                  style={{
                    background: "transparent",
                    border: "none",
                    color: "#738adb",
                  }}
                />
              </span>
            </Tooltip>
          )}
        </div>

        {showEditProfile && (
          <div
            style={{
              display: "flex",
              flexDirection: "row",
              justifyContent: "center",
              gap: 8,
            }}
          >
            <Button
              onClick={() => onOpen()}
              icon={<ToolOutlined style={{ fontSize: 18 }} />}
              style={{ borderRadius: "999px" }}
            >
              Edit Profile
            </Button>
            {userAccount.profile.handleName && (
              <Button
                type="primary"
                style={{ borderRadius: "999px" }}
                icon={<ShoppingCartOutlined style={{ fontSize: 18 }} />}
                onClick={() => router.push(`/${userAccount.handle}`)}
              >
                Buy Me a Storage Page
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
