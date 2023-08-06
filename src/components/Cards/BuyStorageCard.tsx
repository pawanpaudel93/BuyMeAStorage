import React, { useState } from "react";
import {
  Button,
  Card,
  Image,
  Input,
  Modal,
  Radio,
  Select,
  Space,
  Tag,
  Typography,
  message,
  theme,
} from "antd";
import { RxCross1 } from "react-icons/rx";
import { ISupport } from "@/types";
import { useActiveAddress, useApi, useConnection } from "arweave-wallet-kit";
import { ArAccount } from "arweave-account";
import { arweave, getErrorMessage } from "@/utils";
import { APP_NAME, APP_VERSION } from "@/utils/constants";

const { Text, Title } = Typography;
const { useToken } = theme;

export default function BuyStorageCard() {
  const { token } = useToken();
  const walletApi = useApi();
  const [supports, setSupports] = useState<ISupport[]>([]);
  const [storageUnit, setStorageUnit] = useState("MB");
  const [storageValue, setStorageValue] = useState(1);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const { connected, connect } = useConnection();
  const connectedAddress = useActiveAddress();

  const [loading, setLoading] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [userAccount, setUserAccount] = useState<ArAccount>();

  const [supportValue, setSupportValue] = useState({
    winston: "0",
    ar: 0,
    usd: 0,
  });

  const storageOptions = [
    { label: "1", value: 1 },
    { label: "2", value: 2 },
    { label: "3", value: 3 },
  ];

  async function support(e: { preventDefault: () => void }) {
    e.preventDefault();
    setIsLoading(true);
    try {
      if (!connected) {
        await connect();
      }
      if (userAccount?.addr === connectedAddress) {
        throw new Error("You cannot support yourself.");
      }
      if (!userAccount?.addr) {
        throw new Error("No receiver address available.");
      }
      const transaction = await arweave.createTransaction({
        target: userAccount?.addr,
        quantity: supportValue.winston,
      });
      transaction.addTag("App-Name", APP_NAME);
      transaction.addTag("App-Version", APP_VERSION);
      transaction.addTag("Name", name);
      transaction.addTag("Description", description);
      transaction.addTag("Storage-Unit", storageUnit);
      transaction.addTag("Storage-Value", storageValue.toString());
      await walletApi?.sign(transaction);
      const response = await arweave.transactions.post(transaction);
      if (response.status !== 200) {
        throw new Error(
          response?.data?.error ?? "Support failed. Retry again!"
        );
      }
      setSupports((prev) => [
        {
          name,
          description,
          storageUnit,
          storageValue,
          supporter: connectedAddress,
        } as ISupport,
        ...prev,
      ]);
      message.success({
        content: "Thank you for your support.",
        duration: 5,
      });
    } catch (error) {
      message.error({
        content: getErrorMessage(error),
        duration: 5,
      });
    }
    setIsLoading(false);
  }

  return (
    <Card
      bordered={false}
      title={
        <Title level={3} style={{ textAlign: "center" }}>
          Buy{" "}
          <Text style={{ color: token.colorPrimary, fontSize: 24 }}>
            {userAccount?.profile.name}
            ProfileName
          </Text>{" "}
          a Storage
        </Title>
      }
      style={{ flex: 1, maxWidth: "600px" }}
    >
      <Space
        direction="vertical"
        size={16}
        style={{ width: "100%", marginBottom: 16 }}
      >
        <Select
          placeholder="Select storage"
          defaultValue={storageUnit}
          onChange={(value) => setStorageUnit(value)}
          style={{ width: "100%" }}
        >
          <Select.Option value="MB">MB</Select.Option>
          <Select.Option value="GB">GB</Select.Option>
          <Select.Option value="TB">TB</Select.Option>
        </Select>

        <Space direction="horizontal" style={{ width: "100%" }}>
          <Image src="/icon.svg" height={40} alt="" />
          <RxCross1 style={{ fontSize: "1.5em" }} />
          <Radio.Group
            value={storageValue}
            onChange={(e) => setStorageValue(e.target.value)}
            options={storageOptions}
            optionType="button"
            buttonStyle="solid"
          />

          <Input
            type="number"
            min={1}
            value={storageValue}
            onChange={(e) => setStorageValue(parseInt(e.target.value))}
            style={{ width: "100%" }}
          />
        </Space>
      </Space>
      <Space direction="vertical" style={{ width: "100%" }} size={16}>
        <Input
          type="text"
          placeholder="Name (optional)"
          onChange={(e) => setName(e.target.value)}
          value={name}
          style={{ width: "100%" }}
        />

        <Input.TextArea
          placeholder="Say something nice... (optional)"
          onChange={(e) => setDescription(e.target.value)}
          value={description}
          style={{ width: "100%" }}
        />

        {supportValue.ar && (
          <Space style={{ display: "flex", justifyContent: "center" }}>
            <Tag color="green">
              {supportValue.ar}
              AR
            </Tag>
            <Tag color="green">
              ~$
              {supportValue.usd}
            </Tag>
          </Space>
        )}

        <Button
          type="primary"
          onClick={support}
          loading={isLoading}
          disabled={userAccount?.addr === connectedAddress}
          shape="round"
          size="large"
          block
        >
          Support
        </Button>
      </Space>
    </Card>
  );
}
