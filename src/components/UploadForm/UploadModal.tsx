import React, { SetStateAction, useEffect, useRef, useState } from "react";
import { Button, Form, Image, Input, Modal, Row, Upload, message } from "antd";
import { InboxOutlined } from "@ant-design/icons";
import type { UploadChangeParam } from "antd/es/upload";
import type { RcFile, UploadFile, UploadProps } from "antd/es/upload/interface";
import ImageCard from "../Gallery/ImageCard";

const { Dragger } = Upload;

export interface IUploadModalProps {
  open: boolean;
  setOpen: React.Dispatch<SetStateAction<boolean>>;
  fileList: UploadFile<any>[];
  setFileList: React.Dispatch<SetStateAction<UploadFile<any>[]>>;
}

export default function UploadModal({
  open,
  setOpen,
  fileList,
  setFileList,
}: IUploadModalProps) {
  const lockRef = useRef(false);
  const [uploadForm] = Form.useForm();
  const [temporaryFiles, setTemporaryFiles] = useState<any>([]);

  const handleOk = () => {
    const filteredTemporaryFiles: any = temporaryFiles?.map((file: any) => {
      return {
        uid: file.uid,
        name: file.name,
        attachmentType: file.attachmentType,
        attachmentUrl: file.attachmentUrl,
      };
    });
    setFileList((prevFiles) => [...prevFiles, ...filteredTemporaryFiles]);
    setTemporaryFiles([]);
    message.success("Files successfully uploaded!");
    setOpen(false);
  };

  const handleCancel = () => {
    setOpen(false);
    setTemporaryFiles([]);
  };

  const props: UploadProps = {
    name: "file",
    multiple: true,
    fileList: temporaryFiles,
    showUploadList: false,
    beforeUpload: () => false,
    onChange: async (info: any) => {
      if (lockRef.current) return;
      lockRef.current = true;
      const newFiles = info.fileList.filter(
        (infoUid: any) => infoUid?.attachmentType !== "uploadType"
      );

      const newFileInfos = newFiles.map((file: UploadFile) => {
        const thumbnailUrl = URL.createObjectURL(file.originFileObj as RcFile);
        return {
          file: file,
          uid: file.uid,
          name: file.name,
          attachmentType: "uploadType",
          attachmentUrl: thumbnailUrl,
        };
      });
      await setTemporaryFiles((prevFiles: UploadFile<any>[]) => [
        ...prevFiles,
        ...newFileInfos,
      ]);
      lockRef.current = false;
    },
    onDrop(e) {
      console.log("Dropped files", e.dataTransfer.files);
    },
  };

  return (
    <Modal
      open={open}
      title="Upload Zone"
      onOk={handleOk}
      onCancel={handleCancel}
      footer={[
        <Button key="back" onClick={handleCancel}>
          Cancel
        </Button>,
        <Button key="submit" type="primary" onClick={handleOk}>
          Submit
        </Button>,
      ]}
    >
      <Form
        form={uploadForm}
        layout="vertical"
        style={{ background: "" }}
        preserve={false}
      >
        <Form.Item>
          <Dragger {...props}>
            <p className="ant-upload-drag-icon">
              <InboxOutlined />
            </p>
            <p className="ant-upload-text">
              Click or drag file to this area to upload
            </p>
            <p className="ant-upload-hint">
              Support for a single or bulk upload. Strictly prohibited from
              uploading company data or other banned files.
            </p>
            <Row gutter={[8, 8]} style={{ padding: 8 }}>
              <Image.PreviewGroup>
                {temporaryFiles?.map((file: any, index: number) => {
                  return <ImageCard key={index} attach={file} fromUploadZone />;
                })}
              </Image.PreviewGroup>
            </Row>
          </Dragger>
        </Form.Item>
      </Form>
    </Modal>
  );
}
