// src/app/admin/products/page.tsx
"use client";

import React, {
  useState,
  useEffect,
  useCallback,
  useRef,
  useMemo,
} from "react";
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
  Row,
  Col,
  Image,
  Tooltip,
  message,
} from "antd";
import type { ColumnsType } from "antd/es/table";
import type { UploadFile, UploadProps } from "antd/es/upload/interface";
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  SearchOutlined,
  EyeOutlined,
} from "@ant-design/icons";

import { adminApi } from "@/lib/api/services/admin";
import type { ProductDTO, CategoryDTO, BrandDTO } from "@/types/api";
import { formatPrice } from "@/utils/format";
import { AdminApiTest } from "@/components/admin/AdminApiTest";
import { useDebounce } from "@/hooks/useDebounce";

const { TextArea } = Input;
const { Option } = Select;

export default function ProductManagementPage() {
  // Data
  const [products, setProducts] = useState<ProductDTO[]>([]);
  const [categories, setCategories] = useState<CategoryDTO[]>([]);
  const [brands, setBrands] = useState<BrandDTO[]>([]);

  // UI state
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingProduct, setEditingProduct] = useState<ProductDTO | null>(null);
  const [fileList, setFileList] = useState<UploadFile[]>([]);

  // Filters
  const [searchText, setSearchText] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<
    number | undefined
  >();
  const [selectedBrand, setSelectedBrand] = useState<number | undefined>();
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 20,
    total: 0,
  });

  const debouncedSearch = useDebounce(searchText.trim(), 400);
  const [form] = Form.useForm();
  const [messageApi, messageContextHolder] = message.useMessage();

  // Dictionaries helpers
  const getCategoryNameById = useCallback(
    (id?: number) => categories.find((c) => c.id === id)?.name,
    [categories],
  );
  const getBrandNameById = useCallback(
    (id?: number) => brands.find((b) => b.id === id)?.name,
    [brands],
  );

  // Request throttling
  const lastQueryKeyRef = useRef<string>("");
  const inFlightKeyRef = useRef<string>("");
  const lastCallTimeRef = useRef<number>(0);
  const MIN_INTERVAL_MS = 500;
  const makeQueryKey = (args: {
    page: number;
    size: number;
    search?: string;
    categoryId?: number;
    brandId?: number;
  }) =>
    JSON.stringify({
      page: args.page,
      size: args.size,
      search: args.search || "",
      categoryId: args.categoryId ?? null,
      brandId: args.brandId ?? null,
    });

  // API origin for static images
  const apiOrigin = useMemo(() => {
    const base = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api";
    try {
      return new URL(base).origin;
    } catch {
      return "http://localhost:8080";
    }
  }, []);

  // Normalize relative image paths to absolute URLs
  const resolveImageUrl = useCallback(
    (path?: string) => {
      if (!path) return "";
      const p = String(path).trim();
      if (/^https?:\/\//i.test(p)) return p;
      // If DB stores only filename, prepend the public upload path
      const cleaned = p.includes("/")
        ? p.replace(/^\/+/, "")
        : `uploads/product-images/${p}`;
      return `${apiOrigin}/${cleaned}`;
    },
    [apiOrigin],
  );

  // Sort images to ensure main first
  const sortImagesMainFirst = (
    imgs?: Array<{
      id?: number;
      imagePath: string;
      main?: boolean;
      isMain?: boolean;
    }>,
  ) => {
    if (!Array.isArray(imgs)) return [];
    return [...imgs].sort((a, b) => {
      const am = (a.main ?? a.isMain) ? 1 : 0;
      const bm = (b.main ?? b.isMain) ? 1 : 0;
      if (am !== bm) return bm - am;
      return 0;
    });
  };

  // Map product images to Upload fileList entries (for edit modal)
  const mapImagesToUploadFiles = useCallback(
    (
      imgs?: Array<{ id?: number; imagePath: string; main?: boolean }>,
    ): UploadFile[] => {
      const sorted = sortImagesMainFirst(imgs);
      return sorted.map((img, idx) => {
        const url = resolveImageUrl(img.imagePath);
        const name = img.imagePath.split("/").pop() || `image-${idx + 1}`;
        return {
          uid: String(img.id ?? `${name}-${idx}`),
          name,
          status: "done",
          url,
        } as UploadFile;
      });
    },
    [resolveImageUrl],
  );

  // Fetch products
  const fetchProducts = useCallback(
    async (args: {
      page: number;
      size: number;
      search?: string;
      categoryId?: number;
      brandId?: number;
    }) => {
      const key = makeQueryKey(args);
      const now = Date.now();
      if (
        lastQueryKeyRef.current === key &&
        now - lastCallTimeRef.current < MIN_INTERVAL_MS
      )
        return;
      if (inFlightKeyRef.current === key) return;

      inFlightKeyRef.current = key;
      lastCallTimeRef.current = now;

      setLoading(true);
      try {
        const resp = await adminApi.getProducts({
          page: args.page - 1,
          size: args.size,
          search: args.search || undefined,
          categoryId: args.categoryId,
          brandId: args.brandId,
        });

        const enriched = (resp.content || []).map((p: ProductDTO) => {
          const sortedImages = sortImagesMainFirst(p.images);
          const normalizedImages = sortedImages.map((img) => ({
            ...img,
            imagePath: resolveImageUrl(img.imagePath),
          }));
          return {
            ...p,
            categoryName:
              p.categoryName || getCategoryNameById(p.categoryId) || "",
            brandName: p.brandName || getBrandNameById(p.brandId) || "",
            images: normalizedImages,
          } as ProductDTO;
        });

        setProducts(enriched);
        setCategories(resp.categories || []);
        setBrands(resp.brands || []);

        if (typeof resp.totalItems === "number") {
          setPagination((prev) =>
            prev.total !== resp.totalItems
              ? { ...prev, total: resp.totalItems }
              : prev,
          );
        }

        lastQueryKeyRef.current = key;
      } catch (error) {
        console.error("Error fetching products:", error);
        messageApi.error("Не удалось загрузить товары");
      } finally {
        inFlightKeyRef.current = "";
        setLoading(false);
      }
    },
    [getCategoryNameById, getBrandNameById, resolveImageUrl, messageApi],
  );

  // Effects: fetch on filters/pagination change
  useEffect(() => {
    const args = {
      page: pagination.current,
      size: pagination.pageSize,
      search: debouncedSearch || undefined,
      categoryId: selectedCategory,
      brandId: selectedBrand,
    };
    void fetchProducts(args);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    pagination.current,
    pagination.pageSize,
    debouncedSearch,
    selectedCategory,
    selectedBrand,
    fetchProducts,
  ]);

  // Filters change → go to first page
  const onChangeCategory = (value?: number) => {
    setSelectedCategory(value);
    setPagination((prev) => ({ ...prev, current: 1 }));
  };
  const onChangeBrand = (value?: number) => {
    setSelectedBrand(value);
    setPagination((prev) => ({ ...prev, current: 1 }));
  };

  // Open Add modal
  const handleAddProduct = () => {
    setEditingProduct(null);
    form.resetFields();
    setFileList([]);
    setModalVisible(true);
  };

  // Open Edit modal
  const handleEditProduct = (record: ProductDTO) => {
    setEditingProduct(record);

    form.setFieldsValue({
      name: record.name,
      sku: record.sku,
      categoryId: record.categoryId,
      brandId: record.brandId,
      description: record.description,
      shortDescription: record.shortDescription,
      regularPrice: record.regularPrice,
      cosmetologistPrice: record.cosmetologistPrice,
      salePrice: record.salePrice,
      stockQuantity: record.stockQuantity,
      weight: record.weight,
      dimensions: record.dimensions,
      ingredients: record.ingredients,
      usageInstructions: record.usageInstructions,
      sortOrder: record.sortOrder,
      active: record.active,
      professional: record.professional,
    });

    // Pre-fill Upload with existing images
    const initialFiles = mapImagesToUploadFiles(record.images);
    setFileList(initialFiles);

    setModalVisible(true);
  };

  // Delete product
  const handleDeleteProduct = async (id: number) => {
    try {
      await adminApi.deleteProduct(id);
      messageApi.success("Товар успешно удален");
      await fetchProducts({
        page: pagination.current,
        size: pagination.pageSize,
        search: debouncedSearch || undefined,
        categoryId: selectedCategory,
        brandId: selectedBrand,
      });
    } catch (error) {
      console.error("Error deleting product:", error);
      messageApi.error("Не удалось удалить товар");
    }
  };

  // Submit (Create/Update + upload images)
  const handleSubmit = async (values: Partial<ProductDTO>) => {
    try {
      const productData = {
        ...values,
        active: values.active !== false,
        professional: values.professional || false,
      };

      let productId: number | undefined;

      if (editingProduct) {
        await adminApi.updateProduct(editingProduct.id, productData);
        productId = editingProduct.id;
        messageApi.success("Товар успешно обновлен");
      } else {
        const created = await adminApi.createProduct(productData);
        productId = created?.id;
        messageApi.success("Товар успешно создан");
      }

      // Upload images (first selected is main)
      if (!productId) {
        if (fileList.length > 0) {
          console.error("[ProductManagement] Missing product id after save");
          messageApi.error(
            "Не удалось определить ID товара для загрузки изображений",
          );
        }
      } else if (fileList.length > 0) {
        for (let i = 0; i < fileList.length; i++) {
          const file = fileList[i];
          if (file && file.originFileObj) {
            await adminApi.uploadProductImage(
              productId,
              file.originFileObj as File,
              i === 0,
            );
          }
        }
      }

      setModalVisible(false);
      setFileList([]);
      await fetchProducts({
        page: pagination.current,
        size: pagination.pageSize,
        search: debouncedSearch || undefined,
        categoryId: selectedCategory,
        brandId: selectedBrand,
      });
    } catch (error) {
      console.error("Error saving product:", error);
      messageApi.error("Не удалось сохранить товар");
    }
  };

  // Table columns
  const columns: ColumnsType<ProductDTO> = [
    {
      title: "Изображение",
      dataIndex: "images",
      key: "image",
      width: 80,
      fixed: "left",
      render: (
        images: Array<{ imagePath: string; main?: boolean }> | undefined,
      ) =>
        images && images.length > 0 ? (
          <Image
            width={60}
            height={60}
            src={images[0]?.imagePath}
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
      ellipsis: true,
      width: 260,
      render: (text: string, record: ProductDTO) => (
        <div className="min-w-0">
          <div className="font-medium truncate">{text}</div>
          <div className="text-xs text-gray-500 truncate">
            SKU: {record.sku}
          </div>
        </div>
      ),
    },
    {
      title: "Категория",
      dataIndex: "categoryName",
      key: "category",
      width: 160,
      render: (_: string, record: ProductDTO) => {
        const name =
          record.categoryName || getCategoryNameById(record.categoryId);
        return <Tag>{name || "Без категории"}</Tag>;
      },
    },
    {
      title: "Бренд",
      dataIndex: "brandName",
      key: "brand",
      width: 160,
      render: (_: string, record: ProductDTO) => {
        const name = record.brandName || getBrandNameById(record.brandId);
        return <Tag>{name || "Без бренда"}</Tag>;
      },
    },
    {
      title: "Цены",
      key: "prices",
      width: 220,
      responsive: ["md"],
      render: (_: unknown, record: ProductDTO) => (
        <Space direction="vertical" size="small">
          <div>Обычная: {formatPrice(record.regularPrice)}</div>
          {record.cosmetologistPrice != null && (
            <div className="text-blue-600">
              Косметолог: {formatPrice(record.cosmetologistPrice)}
            </div>
          )}
          {record.salePrice != null && (
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
      width: 140,
      render: (stock: number) => (
        <Tag color={stock > 10 ? "green" : stock > 0 ? "orange" : "red"}>
          {stock > 0 ? `В наличии: ${stock}` : "Нет в наличии"}
        </Tag>
      ),
    },
    {
      title: "Статус",
      key: "status",
      width: 160,
      render: (_: unknown, record: ProductDTO) => (
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
      fixed: "right",
      render: (_: unknown, record: ProductDTO) => (
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

  // Upload props
  const uploadProps: UploadProps = {
    beforeUpload: (file) => {
      const isImage = file.type?.startsWith("image/");
      if (!isImage) {
        messageApi.error("Можно загружать только изображения!");
        return Upload.LIST_IGNORE;
      }
      // prevent auto upload; we handle on submit
      return false;
    },
    fileList,
    onChange: ({ fileList: fl }) => setFileList(fl),
    onRemove: (file) => {
      setFileList((prev) => prev.filter((f) => f.uid !== file.uid));
      return true;
    },
    listType: "picture-card",
    accept: "image/*",
    multiple: true,
    maxCount: 10,
  };

  return (
    <div className="p-6">
      {messageContextHolder}
      <AdminApiTest />

      <Card>
        {/* Header */}
        <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
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
            className="self-start sm:self-auto"
          >
            Добавить товар
          </Button>
        </div>

        {/* Filters */}
        <Row gutter={[12, 12]} className="mb-6">
          <Col xs={24} md={8}>
            <Input
              placeholder="Поиск по названию..."
              prefix={<SearchOutlined />}
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              allowClear
            />
          </Col>
          <Col xs={24} md={8}>
            <Select
              placeholder="Выберите категорию"
              style={{ width: "100%" }}
              value={selectedCategory}
              onChange={onChangeCategory}
              allowClear
              showSearch
              optionFilterProp="children"
            >
              {categories.map((cat) => (
                <Option key={cat.id} value={cat.id}>
                  {cat.name}
                </Option>
              ))}
            </Select>
          </Col>
          <Col xs={24} md={8}>
            <Select
              placeholder="Выберите бренд"
              style={{ width: "100%" }}
              value={selectedBrand}
              onChange={onChangeBrand}
              allowClear
              showSearch
              optionFilterProp="children"
            >
              {brands.map((brand) => (
                <Option key={brand.id} value={brand.id}>
                  {brand.name}
                </Option>
              ))}
            </Select>
          </Col>
        </Row>

        {/* Products table */}
        <Table
          columns={columns}
          dataSource={products}
          rowKey="id"
          loading={loading}
          scroll={{ x: 1200 }}
          sticky
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

      {/* Modal: Add/Edit product */}
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
                  {categories.map((cat) => (
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
                  {brands.map((brand) => (
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
                  parser={(value) =>
                    Number(value?.replace(/\₸\s?|(,*)/g, "") || 0) as 0
                  }
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
                  parser={(value) =>
                    Number(value?.replace(/\₸\s?|(,*)/g, "") || 0) as 0
                  }
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
                  parser={(value) =>
                    Number(value?.replace(/\₸\s?|(,*)/g, "") || 0) as 0
                  }
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
              <Form.Item name="sortOrder" label="Порядок сортировки">
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
              {fileList.length >= 8 ? null : <div>Загрузить</div>}
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
