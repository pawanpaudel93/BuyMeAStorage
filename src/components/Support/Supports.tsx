import React, { useEffect, useState } from "react";
import { Typography, Button, Row, Col } from "antd";
import Support from "./Support";
import { ardb } from "@/utils";
import { Dispatch, SetStateAction } from "react";
import { APP_NAME } from "@/utils/constants";
import { ISupport, T_addr } from "@/types";
import ArdbBlock from "ardb/lib/models/block";
import ArdbTransaction from "ardb/lib/models/transaction";

const { Text } = Typography;

export default function Supports({
  recipient,
  supports,
  setSupports,
}: {
  recipient: T_addr;
  supports: ISupport[];
  setSupports: Dispatch<SetStateAction<ISupport[]>>;
}) {
  const [isLoading, setIsLoading] = useState(false);
  const [noMore, setNoMore] = useState(false);

  function checkForNoMore(txs: null | any | any[]) {
    if (!txs || (txs && Array.isArray(txs) && txs.length === 0)) {
      setNoMore(true);
    }
  }

  async function fetchSupports() {
    setIsLoading(true);
    try {
      let txs: any[] | ArdbTransaction[] | ArdbBlock[] = [];
      if (supports.length === 0) {
        txs = await ardb
          .search("transactions")
          .appName(APP_NAME)
          .tag("Payment-Type", "Support")
          .to(recipient)
          .find();
        checkForNoMore(txs);
      } else {
        const nextTxs = await ardb.next();
        checkForNoMore(nextTxs);
        if (nextTxs) {
          if (Array.isArray(nextTxs)) {
            txs = nextTxs;
          } else {
            txs = [nextTxs];
          }
        }
      }

      if (txs && txs.length > 0) {
        setSupports((prev) => [
          ...prev,
          ...txs.map((tx) => {
            const tags = tx._tags;
            const supporter = tx._owner.address;
            const name = tags[2].value || supporter;
            const description = tags[3].value;
            const storageUnit = tags[4].value;
            const storageValue = tags[5].value;

            return {
              name,
              description,
              storageUnit,
              storageValue,
              supporter,
            };
          }),
        ]);
      }
    } catch (error) {}
    setIsLoading(false);
  }

  useEffect(() => {
    fetchSupports();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [recipient]);

  return (
    <>
      <Row justify="center">
        <Text style={{ fontSize: 14, fontWeight: "bold", marginBottom: 3 }}>
          RECENT SUPPORTS
        </Text>
      </Row>
      <Row gutter={[16, 16]}>
        {supports?.map((support, index) => (
          <Col span={24} key={index}>
            <Support support={support} />
          </Col>
        ))}
      </Row>
      <Row justify="center" style={{ marginTop: 14 }}>
        <Button
          style={{ justifyContent: "center" }}
          loading={isLoading}
          onClick={fetchSupports}
          disabled={noMore}
          type="primary"
          shape="round"
          size="large"
        >
          {supports.length === 0
            ? "No Supports yet"
            : noMore
            ? "No more Supports"
            : "Load more Supports"}
        </Button>
      </Row>
    </>
  );
}
