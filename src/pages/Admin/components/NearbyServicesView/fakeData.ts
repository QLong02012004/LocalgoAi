export interface NearbyServiceItem {
  id: number;
  locationId: number;
  locationName: string;
  serviceType: string;
  serviceName: string;
  description: string;
  address: string;
  latitude: number;
  longitude: number;
  distanceKm: number;
  phoneNumber: string | null;
  openingHours: string;
  rating: number;
  reviewCount: number;
  imageUrl: string | null;
  priceLevel: string;
  status: string;
}

export const FAKE_DATA: NearbyServiceItem[] = [
  { id: 1, locationId: 1, locationName: "Cầu Rồng", serviceType: "HOTEL", serviceName: "Khách sạn Mường Thanh", description: "Khách sạn 4 sao view sông Hàn", address: "270 Trần Hưng Đạo, Đà Nẵng", latitude: 16.061, longitude: 108.224, distanceKm: 0.8, phoneNumber: "0236 3888 999", openingHours: "24/7", rating: 4.5, reviewCount: 320, imageUrl: "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400", priceLevel: "$$$$", status: "ACTIVE" },
  { id: 2, locationId: 1, locationName: "Cầu Rồng", serviceType: "RESTAURANT", serviceName: "Nhà hàng Madame Lân", description: "Ẩm thực Việt đặc sắc bên sông Hàn", address: "4 Bạch Đằng, Đà Nẵng", latitude: 16.059, longitude: 108.225, distanceKm: 0.3, phoneNumber: "0236 3561 111", openingHours: "10:00 - 22:00", rating: 4.7, reviewCount: 540, imageUrl: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400", priceLevel: "$$$", status: "ACTIVE" },
  { id: 3, locationId: 2, locationName: "Bãi biển Mỹ Khê", serviceType: "HOTEL", serviceName: "Fusion Suites Đà Nẵng", description: "Resort cao cấp bên bờ biển", address: "Võ Nguyên Giáp, Đà Nẵng", latitude: 16.053, longitude: 108.245, distanceKm: 0.1, phoneNumber: "0236 3919 777", openingHours: "24/7", rating: 4.8, reviewCount: 890, imageUrl: "https://images.unsplash.com/photo-1582719508461-905c673771fd?w=400", priceLevel: "$$$$", status: "ACTIVE" },
  { id: 4, locationId: 3, locationName: "Phố cổ Hội An", serviceType: "ATTRACTION", serviceName: "Chùa Cầu Hội An", description: "Di tích lịch sử nổi tiếng", address: "Trần Phú, Hội An", latitude: 15.877, longitude: 108.326, distanceKm: 0.2, phoneNumber: null, openingHours: "07:00 - 21:00", rating: 4.9, reviewCount: 2100, imageUrl: "https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?w=400", priceLevel: "$", status: "ACTIVE" },
  { id: 5, locationId: 2, locationName: "Bãi biển Mỹ Khê", serviceType: "RESTAURANT", serviceName: "Quán Bé Mặn", description: "Hải sản tươi sống giá bình dân", address: "Lê Quang Đạo, Đà Nẵng", latitude: 16.050, longitude: 108.247, distanceKm: 0.5, phoneNumber: "0905 123 456", openingHours: "09:00 - 23:00", rating: 4.3, reviewCount: 750, imageUrl: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=400", priceLevel: "$$", status: "ACTIVE" },
  { id: 6, locationId: 4, locationName: "Đại Nội Huế", serviceType: "ATTRACTION", serviceName: "Chợ Đông Ba", description: "Chợ truyền thống lớn nhất Huế", address: "Trần Hưng Đạo, TP Huế", latitude: 16.469, longitude: 107.586, distanceKm: 1.2, phoneNumber: null, openingHours: "05:00 - 20:00", rating: 4.1, reviewCount: 430, imageUrl: "https://images.unsplash.com/photo-1555529669-e69e7aa0ba9a?w=400", priceLevel: "$", status: "ACTIVE" },
  { id: 7, locationId: 3, locationName: "Phố cổ Hội An", serviceType: "HOTEL", serviceName: "Anantara Hội An Resort", description: "Resort 5 sao bên sông Thu Bồn", address: "1 Phạm Hồng Thái, Hội An", latitude: 15.879, longitude: 108.328, distanceKm: 0.4, phoneNumber: "0235 3914 555", openingHours: "24/7", rating: 4.9, reviewCount: 1200, imageUrl: "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=400", priceLevel: "$$$$", status: "ACTIVE" },
  { id: 8, locationId: 4, locationName: "Đại Nội Huế", serviceType: "RESTAURANT", serviceName: "Quán Hạnh", description: "Bún bò Huế truyền thống", address: "11 Phó Đức Chính, TP Huế", latitude: 16.465, longitude: 107.590, distanceKm: 0.6, phoneNumber: "0234 3826 789", openingHours: "06:00 - 21:00", rating: 4.6, reviewCount: 980, imageUrl: "https://images.unsplash.com/photo-1552566626-52f8b828add9?w=400", priceLevel: "$", status: "ACTIVE" },
  { id: 9, locationId: 5, locationName: "Bà Nà Hills", serviceType: "HOTEL", serviceName: "Mercure Bà Nà Hills", description: "Khách sạn trên đỉnh núi", address: "Bà Nà Hills, Hòa Vang", latitude: 15.995, longitude: 107.995, distanceKm: 0.1, phoneNumber: "0236 3791 999", openingHours: "24/7", rating: 4.4, reviewCount: 560, imageUrl: "https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?w=400", priceLevel: "$$$", status: "MAINTENANCE" },
  { id: 10, locationId: 5, locationName: "Bà Nà Hills", serviceType: "RESTAURANT", serviceName: "Beer Plaza Bà Nà", description: "Nhà hàng Bia tươi trên núi", address: "Bà Nà Hills, Hòa Vang", latitude: 15.996, longitude: 107.996, distanceKm: 0.05, phoneNumber: null, openingHours: "10:00 - 20:00", rating: 3.9, reviewCount: 210, imageUrl: "https://images.unsplash.com/photo-1514933651103-005eec06c04b?w=400", priceLevel: "$$", status: "MAINTENANCE" },
  { id: 11, locationId: 1, locationName: "Cầu Rồng", serviceType: "ATTRACTION", serviceName: "Bảo tàng Chăm", description: "Bảo tàng điêu khắc Chăm lớn nhất", address: "02 Tháng 9, Đà Nẵng", latitude: 16.060, longitude: 108.222, distanceKm: 1.0, phoneNumber: "0236 3572 935", openingHours: "07:00 - 17:00", rating: 4.2, reviewCount: 670, imageUrl: "https://images.unsplash.com/photo-1582510003544-4d00b7f74220?w=400", priceLevel: "$", status: "ACTIVE" },
  { id: 12, locationId: 6, locationName: "Sơn Trà", serviceType: "ATTRACTION", serviceName: "Chùa Linh Ứng", description: "Chùa có tượng Phật Bà cao nhất VN", address: "Bán đảo Sơn Trà, Đà Nẵng", latitude: 16.100, longitude: 108.277, distanceKm: 2.5, phoneNumber: null, openingHours: "06:00 - 18:00", rating: 4.8, reviewCount: 3200, imageUrl: "https://images.unsplash.com/photo-1528181304800-259b08848526?w=400", priceLevel: "$", status: "ACTIVE" },
];

export const SERVICE_TYPE_MAP: Record<string, { label: string; colorClass: string }> = {
  HOTEL: { label: "Khách sạn", colorClass: "bgBlue" },
  RESTAURANT: { label: "Nhà hàng", colorClass: "bgOrange" },
  ATTRACTION: { label: "Điểm tham quan", colorClass: "bgPurple" },
};
