// src/app/admin/cosmetologists/page.tsx
"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  Table,
  Button,
  Space,
  Tag,
  Modal,
  Input,
  Card,
  Avatar,
  Tooltip,
  App,
  Spin,
  Empty,
  Tabs,
} from "antd";
import {
  CheckCircleOutlined,
  CloseCircleOutlined,
  UserOutlined,
  MailOutlined,
  PhoneOutlined,
  CalendarOutlined,
} from "@ant-design/icons";
import { adminApi } from "@/lib/api/services/admin";
import type { UserDTO } from "@/types/api";
import type { ColumnsType } from "antd/es/table";
import dayjs from "dayjs";

const { TextArea } = Input;

export default function CosmetologistApprovalPage() {
  const { message } = App.useApp();
  const [pendingCosmetologists, setPendingCosmetologists] = useState<UserDTO[]>(
    [],
  );
  const [approvedCosmetologists, setApprovedCosmetologists] = useState<
    UserDTO[]
  >([]);
  const [declinedCosmetologists, setDeclinedCosmetologists] = useState<
    UserDTO[]
  >([]);
  const [loading, setLoading] = useState(false);
  const [declineModalVisible, setDeclineModalVisible] = useState(false);
  const [selectedCosmetologist, setSelectedCosmetologist] =
    useState<UserDTO | null>(null);
  const [declineReason, setDeclineReason] = useState("");
  const [activeTab, setActiveTab] = useState("pending");

  const fetchCosmetologists = useCallback(async () => {
    setLoading(true);
    try {
      const result = await adminApi.getAllCosmetologists();

      setPendingCosmetologists(result.pending);
      setApprovedCosmetologists(result.approved);
      setDeclinedCosmetologists(result.declined);

      console.log("Fetched cosmetologists:", {
        pending: result.pending.length,
        approved: result.approved.length,
        declined: result.declined.length,
      });
    } catch (error) {
      console.error("Error fetching cosmetologists:", error);
      message.error("Не удалось загрузить список косметологов");
    } finally {
      setLoading(false);
    }
  }, [message]);

  useEffect(() => {
    fetchCosmetologists();
  }, [fetchCosmetologists]);

  const handleApprove = async (cosmetologist: UserDTO) => {
    Modal.confirm({
      title: "Подтверждение одобрения",
      content: `Вы уверены, что хотите одобрить заявку косметолога ${cosmetologist.firstName} ${cosmetologist.lastName}?`,
      okText: "Одобрить",
      cancelText: "Отмена",
      onOk: async () => {
        try {
          await adminApi.approveCosmetologist(cosmetologist.id);
          message.success("Косметолог успешно одобрен");
          fetchCosmetologists();
        } catch (error) {
          console.error("Error approving cosmetologist:", error);
          message.error("Не удалось одобрить косметолога");
        }
      },
    });
  };

  const handleDecline = (cosmetologist: UserDTO) => {
    setSelectedCosmetologist(cosmetologist);
    setDeclineModalVisible(true);
    setDeclineReason("");
  };

  const confirmDecline = async () => {
    if (!selectedCosmetologist || !declineReason.trim()) {
      message.warning("Пожалуйста, укажите причину отклонения");
      return;
    }

    try {
      await adminApi.declineCosmetologist(
        selectedCosmetologist.id,
        declineReason,
      );
      message.success("Заявка косметолога отклонена");
      setDeclineModalVisible(false);
      fetchCosmetologists();
    } catch (error) {
      console.error("Error declining cosmetologist:", error);
      message.error("Не удалось отклонить заявку");
    }
  };

  const columns: ColumnsType<UserDTO> = [
    {
      title: "Фото",
      dataIndex: "avatar",
      key: "avatar",
      width: 80,
      render: (_, record) => (
        <Avatar size={40} icon={<UserOutlined />}>
          {record.firstName?.[0]}
          {record.lastName?.[0]}
        </Avatar>
      ),
    },
    {
      title: "ФИО",
      key: "name",
      render: (_, record) => (
        <div>
          <div className="font-medium">
            {record.firstName} {record.lastName}
          </div>
          <div className="text-sm text-gray-500">{record.email}</div>
        </div>
      ),
    },
    {
      title: "Контакты",
      key: "contacts",
      render: (_, record) => (
        <Space direction="vertical" size="small">
          <span>
            <MailOutlined /> {record.email}
          </span>
          {record.phone && (
            <span>
              <PhoneOutlined /> {record.phone}
            </span>
          )}
        </Space>
      ),
    },
    {
      title: "Дата регистрации",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (date: string) => (
        <span>
          <CalendarOutlined /> {dayjs(date).format("DD.MM.YYYY")}
        </span>
      ),
    },
    {
      title: "Статус",
      key: "status",
      render: (_, record) => {
        if (record.verified && record.active) {
          return <Tag color="success">Одобрен</Tag>;
        } else if (!record.active && !record.verified) {
          return <Tag color="error">Отклонен</Tag>;
        } else {
          return <Tag color="warning">Ожидает проверки</Tag>;
        }
      },
    },
    {
      title: "Действия",
      key: "actions",
      width: 200,
      render: (_, record) => {
        if (!record.verified && record.active) {
          return (
            <Space>
              <Tooltip title="Одобрить">
                <Button
                  type="primary"
                  icon={<CheckCircleOutlined />}
                  onClick={() => handleApprove(record)}
                  className="bg-green-600 hover:bg-green-700"
                >
                  Одобрить
                </Button>
              </Tooltip>
              <Tooltip title="Отклонить">
                <Button
                  danger
                  icon={<CloseCircleOutlined />}
                  onClick={() => handleDecline(record)}
                >
                  Отклонить
                </Button>
              </Tooltip>
            </Space>
          );
        }

        if (record.verified && record.active) {
          return (
            <Button danger size="small" onClick={() => handleDecline(record)}>
              Отозвать доступ
            </Button>
          );
        }

        return null;
      },
    },
  ];

  return (
    <div className="p-6">
      <Card>
        <div className="mb-6">
          <h1 className="text-2xl font-bold">Управление косметологами</h1>
          <p className="text-gray-500 mt-2">
            Одобрение и управление заявками косметологов
          </p>
        </div>

        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          items={[
            {
              key: "pending",
              label: (
                <span>
                  Ожидают проверки
                  {pendingCosmetologists.length > 0 && (
                    <Tag color="warning" className="ml-2">
                      {pendingCosmetologists.length}
                    </Tag>
                  )}
                </span>
              ),
              children: loading ? (
                <div className="text-center py-8">
                  <Spin size="large" />
                </div>
              ) : pendingCosmetologists.length === 0 ? (
                <Empty
                  description="Нет заявок, ожидающих проверки"
                  image={Empty.PRESENTED_IMAGE_SIMPLE}
                />
              ) : (
                <Table
                  columns={columns}
                  dataSource={pendingCosmetologists}
                  rowKey="id"
                  pagination={{
                    pageSize: 10,
                    showSizeChanger: true,
                    showTotal: (total) => `Всего: ${total}`,
                  }}
                />
              ),
            },
            {
              key: "approved",
              label: (
                <span>
                  Одобренные
                  <Tag color="success" className="ml-2">
                    {approvedCosmetologists.length}
                  </Tag>
                </span>
              ),
              children: (
                <Table
                  columns={columns}
                  dataSource={approvedCosmetologists}
                  rowKey="id"
                  pagination={{
                    pageSize: 10,
                    showSizeChanger: true,
                    showTotal: (total) => `Всего: ${total}`,
                  }}
                />
              ),
            },
            {
              key: "declined",
              label: (
                <span>
                  Отклоненные
                  <Tag color="error" className="ml-2">
                    {declinedCosmetologists.length}
                  </Tag>
                </span>
              ),
              children: (
                <Table
                  columns={columns}
                  dataSource={declinedCosmetologists}
                  rowKey="id"
                  pagination={{
                    pageSize: 10,
                    showSizeChanger: true,
                    showTotal: (total) => `Всего: ${total}`,
                  }}
                />
              ),
            },
          ]}
        />
      </Card>

      {/* Модальное окно для отклонения заявки */}
      <Modal
        title="Отклонение заявки косметолога"
        open={declineModalVisible}
        onOk={confirmDecline}
        onCancel={() => setDeclineModalVisible(false)}
        okText="Отклонить"
        cancelText="Отмена"
        okButtonProps={{ danger: true }}
      >
        {selectedCosmetologist && (
          <div className="mb-4">
            <p className="font-medium">
              Косметолог: {selectedCosmetologist.firstName}{" "}
              {selectedCosmetologist.lastName}
            </p>
            <p className="text-sm text-gray-500">
              {selectedCosmetologist.email}
            </p>
          </div>
        )}
        <div>
          <label className="block text-sm font-medium mb-2">
            Причина отклонения <span className="text-red-500">*</span>
          </label>
          <TextArea
            rows={4}
            value={declineReason}
            onChange={(e) => setDeclineReason(e.target.value)}
            placeholder="Укажите причину отклонения заявки..."
          />
        </div>
      </Modal>
    </div>
  );
}
