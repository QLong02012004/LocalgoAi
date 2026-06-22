/**
 * Một bộ nhớ đệm đơn giản để lưu trữ các Promise hoặc dữ liệu đã fetch
 * Giúp chia sẻ dữ liệu giữa các component (ví dụ: Navbar prefetch dữ liệu cho Explore)
 */
export const globalDataCache: Record<string, any> = {};

export const setCache = (key: string, data: any) => {
  globalDataCache[key] = data;
};

export const getCache = (key: string) => {
  return globalDataCache[key];
};
