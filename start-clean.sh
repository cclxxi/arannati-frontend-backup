#!/bin/bash

echo "Удаление node_modules и .next..."
rm -rf node_modules
rm -rf .next

echo "Установка зависимостей..."
npm install

echo "npm run validate && npm run format:check"
npm run validate && npm run format:check

echo "Prettier"
npx prettier . --write

echo "Сборка проекта (next build)..."
npx next build

echo "Запуск в dev-режиме с Turbopack..."
npx next dev --turbo