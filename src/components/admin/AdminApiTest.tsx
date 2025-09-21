// src/components/admin/AdminApiTest.tsx
"use client";

import React from "react";
import { Button, Space, Card } from "antd";
import apiClient from "@/lib/api/client";

export function AdminApiTest() {
  const testEndpoints = async () => {
    console.log("=== Testing Admin API Endpoints ===");

    // Test 1: Get all users
    try {
      console.log("Test 1: Getting all users...");
      const response = await apiClient.get("/admin/users");
      console.log("Users response:", response.data);
    } catch (error) {
      console.error("Users error:", error);
    }

    // Test 2: Get products without params
    try {
      console.log("Test 2: Getting products without params...");
      const response = await apiClient.get("/admin/products");
      console.log("Products response:", response.data);
    } catch (error) {
      console.error("Products error:", error);
    }

    // Test 3: Get products with params
    try {
      console.log("Test 3: Getting products with params...");
      const response = await apiClient.get("/admin/products", {
        params: {
          page: 0,
          size: 20,
        },
      });
      console.log("Products with params response:", response.data);
    } catch (error) {
      console.error("Products with params error:", error);
    }

    // Test 4: Check auth
    try {
      console.log("Test 4: Checking auth...");
      const response = await apiClient.get("/auth/me");
      console.log("Auth me response:", response.data);
    } catch (error) {
      console.error("Auth error:", error);
    }
  };

  return (
    <Card title="API Тестирование" className="m-4">
      <Space direction="vertical" className="w-full">
        <p>Откройте консоль браузера для просмотра результатов</p>
        <Button type="primary" onClick={testEndpoints}>
          Тестировать API Endpoints
        </Button>
      </Space>
    </Card>
  );
}
