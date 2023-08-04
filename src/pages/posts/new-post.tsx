import { MdEditor, ToolbarNames } from "md-editor-rt";
import "md-editor-rt/lib/style.css";

import { useActiveAddress, useApi } from "arweave-wallet-kit";
import { getErrorMessage } from "@/utils";
import { arweave } from "@/utils";
import { useState } from "react";
import {
  APP_NAME,
  APP_VERSION,
  ATOMIC_ASSET_SRC,
  UDL,
} from "@/utils/constants";
import { Button, Form, Input, Row, Select, Space, message } from "antd";
import usePersistStore from "@/lib/store/persist";
import { registerPost } from "@/lib/warp/asset";

const licenseOptions = [
  {
    label: "UDL Default Public",
    value: "default",
  },
  {
    label: "UDL Restricted Access",
    value: "access",
  },
  {
    label: "UDL Commercial Use - One Time",
    value: "commercial",
  },
  {
    label: "UDL Derivative Works - One Time Payment",
    value: "derivative",
  },
];

export default function NewPost() {
  const [postForm] = Form.useForm();
  const { post, setPost } = usePersistStore();
  const walletApi = useApi();
  const activeAddress = useActiveAddress();
  const [showAmountInput, setShowAmountInput] = useState(false);
  const toolbarsExclude: ToolbarNames[] = ["github"];
  const [isLoading, setIsLoading] = useState(false);

  function getMimeType(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const fileReader = new FileReader();

      fileReader.onloadend = function (event: ProgressEvent<EventTarget>) {
        if (!event.target) {
          reject(new Error("FileReader onloadend: event target is null."));
          return;
        }

        const target = event.target as FileReader;
        let mimeType = "";

        const arr = new Uint8Array(target.result as ArrayBuffer).subarray(0, 4);
        let header = "";

        for (let index = 0; index < arr.length; index++) {
          header += arr[index].toString(16);
        }

        // View other byte signature patterns here:
        // 1) https://mimesniff.spec.whatwg.org/#matching-an-image-type-pattern
        // 2) https://en.wikipedia.org/wiki/List_of_file_signatures
        switch (header) {
          case "89504e47": {
            mimeType = "image/png";
            break;
          }
          case "47494638": {
            mimeType = "image/gif";
            break;
          }
          case "52494646":
          case "57454250":
            mimeType = "image/webp";
            break;
          case "49492A00":
          case "4D4D002A":
            mimeType = "image/tiff";
            break;
          case "ffd8ffe0":
          case "ffd8ffe1":
          case "ffd8ffe2":
          case "ffd8ffe3":
          case "ffd8ffe8":
            mimeType = "image/jpeg";
            break;
          default: {
            mimeType = file.type;
            break;
          }
        }

        resolve(mimeType);
      };

      fileReader.onerror = function (event: ProgressEvent<EventTarget>) {
        if (!event.target) {
          reject(new Error("FileReader onerror: event target is null."));
          return;
        }

        const target = event.target as FileReader;
        reject(target.error || new Error("FileReader onerror: unknown error."));
      };

      fileReader.readAsArrayBuffer(file);
    });
  }

  const onSave = (content: string) => {
    if (content) {
      const blob = new Blob([content], {
        type: "text/plain;charset=utf-8",
      });

      const fileName = `${
        post?.title ? post?.title.split(" ").join("-") : "post"
      }.md`;

      // Create an anchor element
      const anchor = document.createElement("a");

      // Set anchor's attributes
      anchor.href = URL.createObjectURL(blob);
      anchor.download = fileName;

      // Programmatically trigger a click event on the anchor to initiate the download
      anchor.click();

      // Clean up by removing the anchor from the DOM
      anchor.remove();

      // Clean up by revoking the URL object
      URL.revokeObjectURL(anchor.href);
    }
  };

  const onUploadImg = async (
    files: Array<File>,
    callback: (urls: Array<string>) => void
  ) => {
    if (files.length > 0) {
      try {
        const res = await Promise.all(
          files.map(async (file) => {
            const transaction = await arweave.createTransaction({
              data: await new Response(file).arrayBuffer(),
            });
            const mimeType = file.type ?? (await getMimeType(file));
            transaction.addTag("Content-Type", mimeType);
            await walletApi?.sign(transaction);
            const response = await walletApi?.dispatch(transaction);
            return `https://arweave.net/${response?.id}`;
          })
        );
        callback(res.map((imageUrl) => imageUrl));
      } catch (error) {
        message.error({
          content: getErrorMessage(error),
        });
      }
    }
  };

  async function publish(value: { license: string; payment: string }) {
    setIsLoading(true);
    try {
      const topics = post.topics.split(",").map((topic) => {
        topic = topic.trim();
        return { name: `topic:${topic}`, value: topic };
      });
      const published = new Date().getTime();
      let tags = [
        { name: "App-Name", value: "SmartWeaveContract" },
        { name: "App-Version", value: "0.3.0" },
        { name: "Content-Type", value: "text/markdown" },
        { name: "Indexed-By", value: "ucm" },
        { name: "License", value: UDL },
        { name: "Payment-Mode", value: "Global-Distribution" },
        { name: "Title", value: post.title },
        { name: "Description", value: post.description },
        { name: "Type", value: "blog-post" },
        { name: "Protocol", value: `${APP_NAME}-Post-v${APP_VERSION}` },
        { name: "Published", value: published.toString() },
        {
          name: "Contract-Manifest",
          value:
            '{"evaluationOptions":{"sourceType":"redstone-sequencer","allowBigInt":true,"internalWrites":true,"unsafeClient":"skip","useConstructor":true}}',
        },
        { name: "Contract-Src", value: ATOMIC_ASSET_SRC },
        {
          name: "Init-State",
          value: JSON.stringify({
            title: post.title,
            description: post.description,
            creator: activeAddress,
            claimable: [],
            ticker: "POST",
            name: post.title,
            balances: {
              [activeAddress as string]: 10000,
            },
            emergencyHaltWallet: activeAddress as string,
            contentType: "text/markdown",
            published,
            settings: [["isTradeable", true]],
            transferable: true,
          }),
        },
      ].concat(topics);

      if (value.license === "access") {
        tags = tags.concat([
          { name: "Access", value: "Restricted" },
          { name: "Access-Fee", value: "One-Time-" + value.payment },
        ]);
      }
      if (value.license === "derivative") {
        tags = tags.concat([
          { name: "Derivation", value: "Allowed-with-license-fee" },
          { name: "Derivation-Fee", value: "One-Time-" + value.payment },
        ]);
      }
      if (value.license === "commercial") {
        tags = tags.concat([
          { name: "Commercial-Use", value: "Allowed" },
          { name: "Commercial-Fee", value: "One-Time-" + value.payment },
        ]);
      }

      const transaction = await arweave.createTransaction({
        data: post.content,
      });
      tags.forEach((tag) => transaction.addTag(tag.name, tag.value));

      await walletApi?.sign(transaction);
      const response = await walletApi?.dispatch(transaction);
      if (response?.id) {
        const contractTxId = await registerPost(response?.id);
        setPost({
          title: "",
          description: "",
          content: "",
          topics: "",
        });
        message.success({
          content: "Post published sucessfully",
        });
      } else {
        throw new Error("Post publish error");
      }
    } catch (error) {
      message.error({
        content: "Post publish error",
      });
    }
    setIsLoading(false);
  }

  const handleLicenseChange = (value: string) => {
    setShowAmountInput(value !== "default");
  };

  return (
    <Row style={{ width: "100%", padding: "16px 24px" }}>
      <Form
        layout="vertical"
        form={postForm}
        onFinish={publish}
        style={{ width: "100%" }}
      >
        <Form.Item label="Title" name="title" rules={[{ required: true }]}>
          <Input
            placeholder="Title"
            value={post.title}
            defaultValue={post.title}
            onChange={(e) => setPost({ title: e.target.value })}
          />
        </Form.Item>

        <Form.Item
          label="Description"
          name="description"
          rules={[{ required: true }]}
        >
          <Input
            placeholder="Description"
            maxLength={150}
            value={post.description}
            defaultValue={post.description}
            showCount
            onChange={(e) => setPost({ description: e.target.value })}
          />
        </Form.Item>

        <Form.Item label="Content" name="content" rules={[{ required: true }]}>
          <MdEditor
            language="en-US"
            modelValue={post.content}
            toolbarsExclude={toolbarsExclude}
            onChange={(content: string) => setPost({ content })}
            onSave={onSave}
            onUploadImg={onUploadImg}
            style={{
              padding: "25px",
              height: "55vh",
            }}
            previewTheme="github"
            codeTheme="github"
          />
        </Form.Item>

        <Form.Item label="Topics" name="topics">
          <Input
            placeholder="Enter a set of topics as keywords about your posts - seperated by commas"
            value={post.topics}
            defaultValue={post.topics}
            onChange={(e) => setPost({ topics: e.target.value })}
          />
        </Form.Item>

        <Form.Item
          name="license"
          label="License"
          rules={[
            {
              required: true,
              message: "please select license!",
            },
          ]}
          style={{ marginBottom: 8 }}
          initialValue="default"
        >
          <Select
            placeholder="Select license"
            options={licenseOptions}
            onChange={handleLicenseChange}
          />
        </Form.Item>

        {showAmountInput && (
          <Form.Item
            label="Payment"
            name="payment"
            rules={[{ required: showAmountInput }]}
          >
            <Input placeholder="Amount in $AR" type="number" />
          </Form.Item>
        )}

        <Form.Item style={{ textAlign: "end" }}>
          <Space>
            <Button>Cancel</Button>
            <Button
              type="primary"
              loading={isLoading}
              onClick={() => postForm.submit()}
            >
              Publish
            </Button>
          </Space>
        </Form.Item>
      </Form>
    </Row>
  );
}
