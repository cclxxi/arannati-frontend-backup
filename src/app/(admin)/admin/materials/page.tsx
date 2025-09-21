// src/app/admin/materials/page.tsx
"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  Table,
  Button,
  Space,
  Modal,
  Form,
  Input,
  Upload,
  Card,
  Popconfirm,
  Tooltip,
  Empty,
  App,
} from "antd";
import {
  UploadOutlined,
  FileOutlined,
  DeleteOutlined,
  DownloadOutlined,
  FilePdfOutlined,
  FileWordOutlined,
  FileExcelOutlined,
  FileTextOutlined,
  VideoCameraOutlined,
  PlusOutlined,
} from "@ant-design/icons";
import { adminApi } from "@/lib/api/services/admin";
import type { ColumnsType } from "antd/es/table";
import type { RcFile } from "antd/es/upload/interface";
import dayjs from "dayjs";

const { TextArea } = Input;
const { Dragger } = Upload;

interface Material {
  id: number;
  title: string;
  description: string;
  fileName: string;
  fileSize: number;
  fileType?: string;
  uploadDate: string;
  uploadedBy?: string;
}

export default function MaterialsManagementPage() {
  const { message } = App.useApp();
  const [materials, setMaterials] = useState<Material[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [uploadFile, setUploadFile] = useState<RcFile | null>(null);
  const [form] = Form.useForm();

  const fetchMaterials = useCallback(async () => {
    setLoading(true);
    try {
      const data = await adminApi.getMaterials();
      setMaterials(data);
    } catch (error) {
      console.error("Error fetching materials:", error);
      message.error("Не удалось загрузить материалы");
    } finally {
      setLoading(false);
    }
  }, [message]);

  useEffect(() => {
    fetchMaterials();
  }, [fetchMaterials]);

  const getFileIcon = (fileName: string) => {
    const extension = fileName.split(".").pop()?.toLowerCase();
    switch (extension) {
      case "pdf":
        return <FilePdfOutlined className="text-red-500 text-2xl" />;
      case "doc":
      case "docx":
        return <FileWordOutlined className="text-blue-500 text-2xl" />;
      case "xls":
      case "xlsx":
        return <FileExcelOutlined className="text-green-500 text-2xl" />;
      case "mp4":
      case "avi":
      case "mov":
        return <VideoCameraOutlined className="text-purple-500 text-2xl" />;
      case "txt":
        return <FileTextOutlined className="text-gray-500 text-2xl" />;
      default:
        return <FileOutlined className="text-gray-500 text-2xl" />;
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
  };

  const handleUpload = async (values: {
    title: string;
    description: string;
  }) => {
    if (!uploadFile) {
      message.error("Пожалуйста, выберите файл для загрузки");
      return;
    }

    try {
      await adminApi.uploadMaterial(
        uploadFile,
        values.title,
        values.description,
      );
      message.success("Материал успешно загружен");
      setModalVisible(false);
      form.resetFields();
      setUploadFile(null);
      fetchMaterials();
    } catch (error) {
      console.error("Error uploading material:", error);
      message.error("Не удалось загрузить материал");
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await adminApi.deleteMaterial(id);
      message.success("Материал успешно удален");
      fetchMaterials();
    } catch (error) {
      console.error("Error deleting material:", error);
      message.error("Не удалось удалить материал");
    }
  };

  const handleDownload = (material: Material) => {
    // Создаем ссылку для скачивания
    const link = document.createElement("a");
    link.href = `/api/materials/download/${material.id}`;
    link.download = material.fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const uploadProps = {
    beforeUpload: (file: RcFile) => {
      setUploadFile(file);
      return false; // Предотвращаем автоматическую загрузку
    },
    onRemove: () => {
      setUploadFile(null);
    },
    maxCount: 1,
    accept: ".pdf,.doc,.docx,.xls,.xlsx,.txt,.mp4,.avi,.mov",
  };

  const columns: ColumnsType<Material> = [
    {
      title: "Файл",
      key: "file",
      width: 80,
      render: (_, record) => getFileIcon(record.fileName),
    },
    {
      title: "Название",
      key: "title",
      render: (_, record) => (
        <div>
          <div className="font-medium">{record.title}</div>
          <div className="text-sm text-gray-500">{record.fileName}</div>
        </div>
      ),
    },
    {
      title: "Описание",
      dataIndex: "description",
      key: "description",
      render: (text: string) => (
        <div className="max-w-md">
          <p className="line-clamp-2">{text || "Без описания"}</p>
        </div>
      ),
    },
    {
      title: "Размер",
      dataIndex: "fileSize",
      key: "fileSize",
      width: 120,
      render: (size: number) => formatFileSize(size),
    },
    {
      title: "Дата загрузки",
      dataIndex: "uploadDate",
      key: "uploadDate",
      width: 150,
      render: (date: string) => dayjs(date).format("DD.MM.YYYY HH:mm"),
    },
    {
      title: "Загрузил",
      dataIndex: "uploadedBy",
      key: "uploadedBy",
      width: 150,
      render: (text: string) => text || "Администратор",
    },
    {
      title: "Действия",
      key: "actions",
      width: 120,
      render: (_, record) => (
        <Space>
          <Tooltip title="Скачать">
            <Button
              type="text"
              icon={<DownloadOutlined />}
              onClick={() => handleDownload(record)}
            />
          </Tooltip>
          <Popconfirm
            title="Удалить материал?"
            description="Это действие нельзя отменить"
            onConfirm={() => handleDelete(record.id)}
            okText="Удалить"
            cancelText="Отмена"
          >
            <Tooltip title="Удалить">
              <Button type="text" danger icon={<DeleteOutlined />} />
            </Tooltip>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div className="p-6">
      <Card>
        <div className="mb-6 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">Материалы для косметологов</h1>
            <p className="text-gray-500 mt-2">
              Загрузка и управление обучающими материалами
            </p>
          </div>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => setModalVisible(true)}
            size="large"
          >
            Загрузить материал
          </Button>
        </div>

        {materials.length === 0 && !loading ? (
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description="Нет загруженных материалов"
          >
            <Button type="primary" onClick={() => setModalVisible(true)}>
              Загрузить первый материал
            </Button>
          </Empty>
        ) : (
          <Table
            columns={columns}
            dataSource={materials}
            rowKey="id"
            loading={loading}
            pagination={{
              pageSize: 10,
              showSizeChanger: true,
              showTotal: (total) => `Всего: ${total} материалов`,
            }}
          />
        )}
      </Card>

      {/* Модальное окно для загрузки материала */}
      <Modal
        title="Загрузка материала"
        open={modalVisible}
        onCancel={() => {
          setModalVisible(false);
          form.resetFields();
          setUploadFile(null);
        }}
        footer={null}
        width={600}
      >
        <Form form={form} layout="vertical" onFinish={handleUpload}>
          <Form.Item
            name="title"
            label="Название материала"
            rules={[{ required: true, message: "Введите название материала" }]}
          >
            <Input placeholder="Например: Инструкция по работе с продукцией Holy Land" />
          </Form.Item>

          <Form.Item
            name="description"
            label="Описание"
            rules={[{ required: true, message: "Введите описание материала" }]}
          >
            <TextArea
              rows={4}
              placeholder="Опишите содержание материала и для кого он предназначен"
            />
          </Form.Item>

          <Form.Item label="Файл" required>
            <Dragger {...uploadProps}>
              <p className="ant-upload-drag-icon">
                <UploadOutlined className="text-4xl text-blue-500" />
              </p>
              <p className="ant-upload-text">
                Нажмите или перетащите файл для загрузки
              </p>
              <p className="ant-upload-hint">
                Поддерживаются форматы: PDF, Word, Excel, TXT, видео (MP4, AVI,
                MOV)
              </p>
              {uploadFile && (
                <div className="mt-4 p-2 bg-blue-50 rounded">
                  <Space>
                    {getFileIcon(uploadFile.name)}
                    <span className="font-medium">{uploadFile.name}</span>
                    <span className="text-gray-500">
                      ({formatFileSize(uploadFile.size)})
                    </span>
                  </Space>
                </div>
              )}
            </Dragger>
          </Form.Item>

          <Form.Item className="mt-6 mb-0">
            <Space>
              <Button
                type="primary"
                htmlType="submit"
                size="large"
                disabled={!uploadFile}
              >
                Загрузить материал
              </Button>
              <Button
                onClick={() => {
                  setModalVisible(false);
                  form.resetFields();
                  setUploadFile(null);
                }}
                size="large"
              >
                Отмена
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
