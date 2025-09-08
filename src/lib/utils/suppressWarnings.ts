export function suppressConsoleWarnings() {
  if (typeof window === "undefined") return;

  const originalWarn = console.warn;
  const originalError = console.error;

  console.warn = (...args) => {
    // Фильтруем известные безопасные warnings
    const warningMessage = args.join(" ");

    // Игнорируем warnings от Next.js Image
    if (warningMessage.includes("Image with src")) return;

    // Игнорируем warnings от React Hydration
    if (warningMessage.includes("Hydration")) return;

    // Игнорируем warnings от третьих библиотек
    if (warningMessage.includes("componentWillReceiveProps")) return;

    // Все остальные warnings показываем
    originalWarn.apply(console, args);
  };

  console.error = (...args) => {
    const errorMessage = args.join(" ");

    // Игнорируем ошибки загрузки изображений
    if (errorMessage.includes("Failed to load resource")) return;
    if (
      errorMessage.includes("404 (Not Found)") &&
      errorMessage.includes("image")
    )
      return;

    // Все остальные ошибки показываем
    originalError.apply(console, args);
  };
}
