// src/app/admin/products/page.tsx
"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  Table,
  Button,
  Space,
  Modal,
  Form,
  Input,
  InputNumber,
  Select,
  Switch,
  Upload,
  Card,
  Tag,
  Popconfirm,
  message,
  Row,
  Col,
  Image,
  Tooltip,
} from "antd";
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  SearchOutlined,
  EyeOutlined,
} from "@ant-design/icons";
import { adminApi } from "@/lib/api/services/admin";
import type { ProductDTO, CategoryDTO, BrandDTO } from "@/types/api";
import type { ColumnsType } from "antd/es/table";
import type { UploadFile } from "antd/es/upload/interface";
import { formatPrice } from "@/utils/format";

const { TextArea } = Input;
const { Option } = Select;

export default function ProductManagementPage() {
  const [products, setProducts] = useState<ProductDTO[]>([]);
  const [categories, setCategories] = useState<CategoryDTO[]>([]);
  const [brands, setBrands] = useState<BrandDTO[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingProduct, setEditingProduct] = useState<ProductDTO | null>(null);
  const [searchText, setSearchText] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<
    number | undefined
  >();
  const [selectedBrand, setSelectedBrand] = useState<number | undefined>();
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 20,
    total: 0,
  });

  const [form] = Form.useForm();

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const response = await adminApi.getProducts({
        page: pagination.current - 1,
        size: pagination.pageSize,
        search: searchText || undefined,
        categoryId: selectedCategory,
        brandId: selectedBrand,
      });

      setProducts(response.content);
      setCategories(response.categories);
      setBrands(response.brands);
      setPagination((prev) => ({
        ...prev,
        total: response.totalItems,
      }));
    } catch (error) {
      console.error("Error fetching products:", error);
      message.error("Не удалось загрузить товары");
    } finally {
      setLoading(false);
    }
  }, [pagination, searchText, selectedCategory, selectedBrand]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const handleAddProduct = () => {
    setEditingProduct(null);
    setFileList([]);
    setModalVisible(true);
    // Reset form after modal is shown to ensure Form component is mounted
    setTimeout(() => {
      form.resetFields();
    }, 0);
  };

  const handleEditProduct = async (product: ProductDTO) => {
    setEditingProduct(product);
    form.setFieldsValue({
      ...product,
      categoryId: product.categoryId,
      brandId: product.brandId,
    });
    setFileList([]); // Загрузить существующие изображения если нужно
    setModalVisible(true);
  };

  const handleDeleteProduct = async (id: number) => {
    try {
      await adminApi.deleteProduct(id);
      message.success("Товар успешно удален");
      fetchProducts();
    } catch (error) {
      console.error("Error deleting product:", error);
      message.error("Не удалось удалить товар");
    }
  };

  const handleSubmit = async (values: Partial<ProductDTO>) => {
    try {
      // Подготавливаем данные
      const productData = {
        ...values,
        active: values.active !== false,
        professional: values.professional || false,
      };

      let savedProduct: ProductDTO;

      if (editingProduct) {
        savedProduct = await adminApi.updateProduct(
          editingProduct.id,
          productData,
        );
        message.success("Товар успешно обновлен");
      } else {
        savedProduct = await adminApi.createProduct(productData);
        message.success("Товар успешно создан");
      }

      // Загружаем изображения если есть
      if (fileList.length > 0) {
        for (let i = 0; i < fileList.length; i++) {
          const file = fileList[i];
          if (file && file.originFileObj) {
            await adminApi.uploadProductImage(
              savedProduct.id,
              file.originFileObj as File,
              i === 0, // Первое изображение делаем главным
            );
          }
        }
      }

      setModalVisible(false);
      fetchProducts();
    } catch (error) {
      console.error("Error saving product:", error);
      message.error("Не удалось сохранить товар");
    }
  };

  const columns: ColumnsType<ProductDTO> = [
    {
      title: "Изображение",
      dataIndex: "images",
      key: "image",
      width: 80,
      render: (images: Array<{ imagePath: string }>) =>
        images && images.length > 0 && images[0] ? (
          <Image
            width={60}
            height={60}
            src={images[0].imagePath}
            alt="Product"
            style={{ objectFit: "cover" }}
            fallback="/images/product-placeholder.jpg"
          />
        ) : (
          <div className="w-[60px] h-[60px] bg-gray-200 flex items-center justify-center">
            <EyeOutlined className="text-gray-400" />
          </div>
        ),
    },
    {
      title: "Название",
      dataIndex: "name",
      key: "name",
      render: (text: string, record: ProductDTO) => (
        <div>
          <div className="font-medium">{text}</div>
          <div className="text-xs text-gray-500">SKU: {record.sku}</div>
        </div>
      ),
    },
    {
      title: "Категория",
      dataIndex: "categoryName",
      key: "category",
      render: (text: string) => <Tag>{text || "Без категории"}</Tag>,
    },
    {
      title: "Бренд",
      dataIndex: "brandName",
      key: "brand",
      render: (text: string) => <Tag>{text || "Без бренда"}</Tag>,
    },
    {
      title: "Цены",
      key: "prices",
      render: (_, record: ProductDTO) => (
        <Space direction="vertical" size="small">
          <div>Обычная: {formatPrice(record.regularPrice)}</div>
          {record.cosmetologistPrice && (
            <div className="text-blue-600">
              Косметолог: {formatPrice(record.cosmetologistPrice)}
            </div>
          )}
          {record.salePrice && (
            <div className="text-red-600">
              Акция: {formatPrice(record.salePrice)}
            </div>
          )}
        </Space>
      ),
    },
    {
      title: "Наличие",
      dataIndex: "stockQuantity",
      key: "stock",
      render: (stock: number) => (
        <Tag color={stock > 10 ? "green" : stock > 0 ? "orange" : "red"}>
          {stock > 0 ? `В наличии: ${stock}` : "Нет в наличии"}
        </Tag>
      ),
    },
    {
      title: "Статус",
      key: "status",
      render: (_, record: ProductDTO) => (
        <Space>
          {record.active ? (
            <Tag color="success">Активен</Tag>
          ) : (
            <Tag color="default">Неактивен</Tag>
          )}
          {record.professional && <Tag color="blue">PRO</Tag>}
        </Space>
      ),
    },
    {
      title: "Действия",
      key: "actions",
      width: 120,
      render: (_, record: ProductDTO) => (
        <Space>
          <Tooltip title="Редактировать">
            <Button
              type="text"
              icon={<EditOutlined />}
              onClick={() => handleEditProduct(record)}
            />
          </Tooltip>
          <Popconfirm
            title="Удалить товар?"
            description="Это действие нельзя отменить"
            onConfirm={() => handleDeleteProduct(record.id)}
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

  const uploadProps = {
    beforeUpload: (file: File) => {
      const isImage = file.type.startsWith("image/");
      if (!isImage) {
        message.error("Можно загружать только изображения!");
        return false;
      }
      return false; // Предотвращаем автоматическую загрузку
    },
    fileList,
    onChange: ({ fileList }: { fileList: UploadFile[] }) => {
      setFileList(fileList);
    },
    onRemove: (file: UploadFile) => {
      const newFileList = fileList.filter((item) => item.uid !== file.uid);
      setFileList(newFileList);
    },
    listType: "picture-card" as const,
    accept: "image/*",
    multiple: true,
    maxCount: 10,
  };

  return (
    <div className="p-6">
      <Card>
        <div className="mb-6 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">Управление товарами</h1>
            <p className="text-gray-500 mt-2">
              Добавление, редактирование и удаление товаров
            </p>
          </div>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={handleAddProduct}
            size="large"
          >
            Добавить товар
          </Button>
        </div>

        {/* Фильтры */}
        <Row gutter={16} className="mb-6">
          <Col span={8}>
            <Input
              placeholder="Поиск по названию..."
              prefix={<SearchOutlined />}
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              allowClear
            />
          </Col>
          <Col span={8}>
            <Select
              placeholder="Выберите категорию"
              style={{ width: "100%" }}
              value={selectedCategory}
              onChange={setSelectedCategory}
              allowClear
            >
              {(categories || []).map((cat) => (
                <Option key={cat.id} value={cat.id}>
                  {cat.name}
                </Option>
              ))}
            </Select>
          </Col>
          <Col span={8}>
            <Select
              placeholder="Выберите бренд"
              style={{ width: "100%" }}
              value={selectedBrand}
              onChange={setSelectedBrand}
              allowClear
            >
              {(brands || []).map((brand) => (
                <Option key={brand.id} value={brand.id}>
                  {brand.name}
                </Option>
              ))}
            </Select>
          </Col>
        </Row>

        {/* Таблица товаров */}
        <Table
          columns={columns}
          dataSource={products}
          rowKey="id"
          loading={loading}
          pagination={{
            ...pagination,
            onChange: (page, pageSize) => {
              setPagination((prev) => ({
                ...prev,
                current: page,
                pageSize: pageSize || 20,
              }));
            },
            showSizeChanger: true,
            showTotal: (total) => `Всего: ${total} товаров`,
          }}
        />
      </Card>

      {/* Модальное окно для добавления/редактирования */}
      <Modal
        title={editingProduct ? "Редактирование товара" : "Добавление товара"}
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={null}
        width={900}
        destroyOnHidden={true}
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="name"
                label="Название товара"
                rules={[{ required: true, message: "Введите название" }]}
              >
                <Input placeholder="Название товара" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="sku"
                label="Артикул (SKU)"
                rules={[{ required: true, message: "Введите артикул" }]}
              >
                <Input placeholder="SKU-123456" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="categoryId"
                label="Категория"
                rules={[{ required: true, message: "Выберите категорию" }]}
              >
                <Select placeholder="Выберите категорию">
                  {(categories || []).map((cat) => (
                    <Option key={cat.id} value={cat.id}>
                      {cat.name}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="brandId"
                label="Бренд"
                rules={[{ required: true, message: "Выберите бренд" }]}
              >
                <Select placeholder="Выберите бренд">
                  {(brands || []).map((brand) => (
                    <Option key={brand.id} value={brand.id}>
                      {brand.name}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="description"
            label="Описание"
            rules={[{ required: true, message: "Введите описание" }]}
          >
            <TextArea rows={4} placeholder="Подробное описание товара" />
          </Form.Item>

          <Form.Item name="shortDescription" label="Краткое описание">
            <TextArea
              rows={2}
              placeholder="Краткое описание для карточки товара"
            />
          </Form.Item>

          <Row gutter={16}>
            <Col span={8}>
              <Form.Item
                name="regularPrice"
                label="Обычная цена"
                rules={[{ required: true, message: "Укажите цену" }]}
              >
                <InputNumber
                  style={{ width: "100%" }}
                  min={0}
                  placeholder="0"
                  formatter={(value) =>
                    `₸ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                  }
                  parser={(value) => {
                    const parsed = value?.replace(/\₸\s?|(,*)/g, "") || "";
                    const num = parseFloat(parsed);
                    return (isNaN(num) ? 0 : num) as 0;
                  }}
                />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="cosmetologistPrice"
                label="Цена для косметологов"
              >
                <InputNumber
                  style={{ width: "100%" }}
                  min={0}
                  placeholder="0"
                  formatter={(value) =>
                    `₸ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                  }
                  parser={(value) => {
                    const parsed = value?.replace(/\₸\s?|(,*)/g, "") || "";
                    const num = parseFloat(parsed);
                    return (isNaN(num) ? 0 : num) as 0;
                  }}
                />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="salePrice" label="Акционная цена">
                <InputNumber
                  style={{ width: "100%" }}
                  min={0}
                  placeholder="0"
                  formatter={(value) =>
                    `₸ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                  }
                  parser={(value) => {
                    const parsed = value?.replace(/\₸\s?|(,*)/g, "") || "";
                    const num = parseFloat(parsed);
                    return (isNaN(num) ? 0 : num) as 0;
                  }}
                />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={8}>
              <Form.Item
                name="stockQuantity"
                label="Количество на складе"
                rules={[{ required: true, message: "Укажите количество" }]}
              >
                <InputNumber
                  style={{ width: "100%" }}
                  min={0}
                  placeholder="0"
                />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="weight" label="Вес (г)">
                <InputNumber
                  style={{ width: "100%" }}
                  min={0}
                  placeholder="0"
                />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="sortOrder"
                label="Порядок сортировки"
                initialValue={0}
              >
                <InputNumber
                  style={{ width: "100%" }}
                  min={0}
                  placeholder="0"
                />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item name="ingredients" label="Состав">
            <TextArea rows={3} placeholder="Ингредиенты и состав продукта" />
          </Form.Item>

          <Form.Item name="usageInstructions" label="Инструкция по применению">
            <TextArea rows={3} placeholder="Как использовать продукт" />
          </Form.Item>

          <Row gutter={16}>
            <Col span={8}>
              <Form.Item
                name="active"
                label="Активен"
                valuePropName="checked"
                initialValue={true}
              >
                <Switch checkedChildren="Да" unCheckedChildren="Нет" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="professional"
                label="Профессиональный"
                valuePropName="checked"
                initialValue={false}
              >
                <Switch checkedChildren="Да" unCheckedChildren="Нет" />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item label="Изображения товара">
            <Upload {...uploadProps}>
              {fileList.length >= 10 ? null : (
                <div>
                  <PlusOutlined />
                  <div style={{ marginTop: 8 }}>Загрузить</div>
                </div>
              )}
            </Upload>
          </Form.Item>

          <Form.Item className="mt-6 mb-0">
            <Space>
              <Button type="primary" htmlType="submit" size="large">
                {editingProduct ? "Сохранить изменения" : "Добавить товар"}
              </Button>
              <Button onClick={() => setModalVisible(false)} size="large">
                Отмена
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
