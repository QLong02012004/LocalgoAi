import axios from "axios";

/**
 * Chuyển đổi tọa độ (lat, lng) sang địa chỉ cụ thể bằng Nominatim (OpenStreetMap)
 * @param lat Vĩ độ
 * @param lng Kinh độ
 * @returns Địa chỉ dạng chuỗi
 */
const addressCache = new Map<string, string>();
let lastRequestTime = 0;
const MIN_REQUEST_INTERVAL = 1200; // 1.2 giây để an toàn

// Hàng đợi để xử lý yêu cầu tuần tự
let requestQueue: Promise<any> = Promise.resolve();

export const reverseGeocode = async (lat: string | number, lng: string | number): Promise<string> => {
  const cacheKey = `${lat},${lng}`;
  if (addressCache.has(cacheKey)) {
    return addressCache.get(cacheKey)!;
  }

  // Xếp hàng yêu cầu
  return new Promise((resolve) => {
    requestQueue = requestQueue.then(async () => {
      // Đảm bảo khoảng cách giữa các yêu cầu
      const now = Date.now();
      const waitTime = Math.max(0, MIN_REQUEST_INTERVAL - (now - lastRequestTime));
      if (waitTime > 0) {
        await new Promise(r => setTimeout(r, waitTime));
      }
      
      try {
        const response = await axios.get(
          `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&addressdetails=1`,
          {
            headers: {
              "Accept-Language": "vi",
            },
          }
        );
        lastRequestTime = Date.now();

        if (response.data) {
          const addr = response.data.address;
          const display = response.data.display_name;
          const parts = [];
          
          if (addr) {
            if (addr.house_number) parts.push(addr.house_number);
            if (addr.road) parts.push(addr.road);
            if (addr.suburb || addr.neighbourhood) parts.push(addr.suburb || addr.neighbourhood);
            if (addr.city_district || addr.town || addr.village) parts.push(addr.city_district || addr.town || addr.village);
            if (addr.city || addr.state) parts.push(addr.city || addr.state);
          }
          
          const result = parts.length > 0 ? parts.join(", ") : (display || `${lat}, ${lng}`);
          addressCache.set(cacheKey, result);
          resolve(result);
        } else {
          resolve(`${lat}, ${lng}`);
        }
      } catch (error) {
        lastRequestTime = Date.now();
        console.error("Reverse geocoding error:", error);
        resolve(`${lat}, ${lng}`);
      }
    });
  });
};

/**
 * Chuyển đổi địa chỉ chữ sang tọa độ (Geocoding) bằng Nominatim
 * @param address Địa chỉ cần tìm
 * @param province Tên tỉnh/thành để thu hẹp phạm vi (tùy chọn)
 * @returns { lat: number, lng: number } | null
 */
export const geocode = async (address: string, province?: string): Promise<{ lat: number; lng: number } | null> => {
  if (!address || address.length < 3) return null;
  try {
    // Xây dựng câu truy vấn thông minh hơn
    let query = address;
    if (province && !address.toLowerCase().includes(province.toLowerCase())) {
      query += `, ${province}`;
    }
    if (!query.toLowerCase().includes("việt nam")) {
      query += ", Việt Nam";
    }

    const response = await axios.get(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=1&countrycodes=vn`,
      {
        headers: {
          "Accept-Language": "vi",
        },
      }
    );

    if (response.data && response.data.length > 0) {
      const result = response.data[0];
      return {
        lat: parseFloat(result.lat),
        lng: parseFloat(result.lon),
      };
    }
    
    // Nếu không tìm thấy địa chỉ cụ thể, thử tìm theo đường + tỉnh (bỏ số nhà)
    if (address.includes(",")) {
      const broaderQuery = address.split(",").slice(1).join(",") + (province ? `, ${province}` : "");
      const secondRes = await axios.get(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(broaderQuery)}&limit=1&countrycodes=vn`
      );
      if (secondRes.data && secondRes.data.length > 0) {
        return {
          lat: parseFloat(secondRes.data[0].lat),
          lng: parseFloat(secondRes.data[0].lon),
        };
      }
    }

    return null;
  } catch (error) {
    console.error("Geocoding error:", error);
    return null;
  }
};

/**
 * Kiểm tra xem một chuỗi có phải là tọa độ hay không (hỗ trợ cả dấu chấm và dấu phẩy thập phân)
 * Định dạng hỗ trợ: "16.05, 108.22" hoặc "16,05, 108,22"
 * @param address Chuỗi cần kiểm tra
 * @returns { lat: string, lng: string } | null
 */
export const parseCoordinates = (address: string) => {
  if (!address) return null;
  
  // 1. Thay thế dấu phẩy thập phân thành dấu chấm nếu có cấu trúc "số,số, số,số"
  // Hoặc đơn giản là chuẩn hóa chuỗi
  const normalized = address.replace(/\s+/g, ""); // Xóa khoảng trắng
  
  // Regex nhận diện tọa độ: (lat),(lng)
  // lat/lng có thể dùng dấu chấm hoặc dấu phẩy cho phần thập phân
  // Chúng ta sẽ tách theo dấu phẩy ở giữa (dấu phẩy ngăn cách lat và lng thường có khoảng trắng hoặc ở vị trí trung tâm)
  
  const parts = address.split(/,\s*/);
  if (parts.length === 2) {
    // Trường hợp chuẩn: "16.05, 108.22"
    const lat = parts[0].replace(",", ".");
    const lng = parts[1].replace(",", ".");
    if (!isNaN(Number(lat)) && !isNaN(Number(lng))) {
      return { lat, lng };
    }
  } else if (parts.length === 4) {
    // Trường hợp dùng dấu phẩy cho thập phân: "16,05, 108,22"
    const lat = `${parts[0]}.${parts[1]}`;
    const lng = `${parts[2]}.${parts[3]}`;
    if (!isNaN(Number(lat)) && !isNaN(Number(lng))) {
      return { lat, lng };
    }
  }

  return null;
};
