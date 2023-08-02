import { MdEditor, ToolbarNames } from "md-editor-rt";
import "md-editor-rt/lib/style.css";

import { useApi } from "arweave-wallet-kit";
import { getErrorMessage } from "@/utils";
import { arweave } from "@/utils";
import { FormEvent, useState } from "react";
import { APP_NAME, APP_VERSION } from "@/utils/constants";
import { Button, Form, Input, Row, Space, message } from "antd";
import usePersistStore from "@/lib/store/persist";

export default function NewPost() {
  const [postForm] = Form.useForm();
  const { post, setPost } = usePersistStore();
  const walletApi = useApi();
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

  // Function to convert Markdown to short description
  function onHtmlChanged(htmlText: string, maxLength = 100) {
    const plainText = htmlText.replace(/<[^>]+>/g, "");
    const previewContent = plainText.slice(0, maxLength);
    setPost({ ...post, previewContent });
  }

  async function publish(e: FormEvent) {
    e.preventDefault();
    setIsLoading(true);
    try {
      const transaction = await arweave.createTransaction({
        data: post.content,
      });
      transaction.addTag("App-Name", APP_NAME);
      transaction.addTag("App-Version", APP_VERSION);
      transaction.addTag("Content-Type", "text/markdown");
      transaction.addTag("Title", post.title);
      transaction.addTag("Preview-Content", post.previewContent);
      transaction.addTag("Type", "post");
      transaction.addTag("Published-At", post.createdAt.toString());
      transaction.addTag("Updated-At", post.updatedAt.toString());
      await walletApi?.sign(transaction);
      const response = await walletApi?.dispatch(transaction);
      console.log(response);
      setPost({
        title: "",
        previewContent: "",
        content: "# Note",
        createdAt: new Date().getTime(),
        updatedAt: new Date().getTime(),
      });
      message.success({
        content: "Post published sucessfully",
      });
    } catch (error) {
      message.success({
        content: "Post publish error",
      });
    }
    setIsLoading(false);
  }

  return (
    <Row style={{ width: "100%", padding: "16px 24px" }}>
      <Form
        layout="vertical"
        form={postForm}
        onFinish={publish}
        style={{ width: "100%" }}
      >
        <Form.Item label="Title" name="title">
          <Input
            placeholder="Title"
            value={post.title}
            onChange={(e) => setPost({ ...post, title: e.target.value })}
          />
        </Form.Item>

        <Form.Item label="Description" name="editor">
          <MdEditor
            language="en-US"
            modelValue={post.content}
            toolbarsExclude={toolbarsExclude}
            onChange={(v: string) => {
              setPost({ ...post, content: v });
            }}
            onSave={onSave}
            onUploadImg={onUploadImg}
            style={{
              padding: "25px",
              height: "55vh",
            }}
            // theme=""
            previewTheme="github"
            codeTheme="github"
            onHtmlChanged={(html: string) => onHtmlChanged(html)}
          />
        </Form.Item>

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
