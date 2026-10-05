import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import type { RootState } from "../../../redux/store";
import type { UserState } from "../../../redux/slices/userSlice";
import { 
  getHighlightLocations, 
  getHighlightRestaurants, 
  getHighlightAttractionsByKeyword,
  getHighlightRestaurantsByKeyword,
  type HighlightItem 
} from "../../../services/highlightService";
import { getHotels, getHotelsByKeyword } from "../../../services/hotelService";
import {
  getSavedTrips,
  addFavorite,
  removeFavorite,
  type SavedTrip,
} from "../../../services/profileService";
import { getCache, setCache } from "../../../utils/DataCache";
import * as adminService from "../../../services/adminService";
import * as itineraryService from "../../../services/itineraryService";

const ITEMS_PER_PAGE = 9;

export const EXPLORE_MOCK_DATA: HighlightItem[] = [
  // ==================== ĐÀ NẴNG (provinceId: 2) ====================
  {
    id: 9991,
    name: "Cầu Vàng - Bà Nà Hills",
    location: "Hòa Phú, Hòa Vang, Đà Nẵng",
    rating: 4.9,
    reviewCount: 3500,
    imageUrl: "https://images.unsplash.com/photo-1569154941061-e231b4725ef1?auto=format&fit=crop&w=1600&q=80",
    description: "Kiệt tác kiến trúc kỳ vĩ với đôi bàn tay khổng lồ rêu phong vươn giữa mây ngàn đỉnh núi Chúa.",
    type: "pin",
    category: "Địa điểm tham quan",
    averagePrice: 0,
    provinceId: 2,
    status: "ACTIVE",
    latitude: 15.9950,
    longitude: 107.9940,
    uniqueId: "pin-9991"
  },
  {
    id: 9992,
    name: "Bà Nà Hills Sun World",
    location: "Thôn An Sơn, Hòa Ninh, Hòa Vang, Đà Nẵng",
    rating: 4.8,
    reviewCount: 2800,
    imageUrl: "https://images.unsplash.com/photo-1552465011-b4e21bf6e79a?auto=format&fit=crop&w=1600&q=80",
    description: "Khu du lịch sinh thái nghỉ dưỡng hàng đầu với làng Pháp cổ kính, lâu đài Mặt Trăng và cáp treo đạt nhiều kỷ lục.",
    type: "pin",
    category: "Khu du lịch sinh thái",
    averagePrice: 850000,
    provinceId: 2,
    status: "ACTIVE",
    latitude: 15.9976,
    longitude: 107.9881,
    uniqueId: "pin-9992"
  },
  {
    id: 9993,
    name: "Cầu Rồng Đà Nẵng",
    location: "Nguyễn Văn Linh, Phước Ninh, Hải Châu, Đà Nẵng",
    rating: 4.7,
    reviewCount: 1950,
    imageUrl: "https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&w=1600&q=80",
    description: "Cây cầu hình rồng thép độc nhất vô nhị vắt qua sông Hàn, nổi bật với màn trình diễn phun lửa, phun nước vào cuối tuần.",
    type: "pin",
    category: "Địa điểm tham quan",
    averagePrice: 0,
    provinceId: 2,
    status: "ACTIVE",
    latitude: 16.0610,
    longitude: 108.2260,
    uniqueId: "pin-9993"
  },
  {
    id: 9994,
    name: "Bãi Biển Mỹ Khê",
    location: "Võ Nguyên Giáp, Phước Mỹ, Sơn Trà, Đà Nẵng",
    rating: 4.8,
    reviewCount: 3100,
    imageUrl: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1600&q=80",
    description: "Một trong 6 bãi biển quyến rũ nhất hành tinh do tạp chí Forbes bình chọn, với bãi cát trắng mịn trải dài.",
    type: "pin",
    category: "Bãi biển",
    averagePrice: 0,
    provinceId: 2,
    status: "ACTIVE",
    latitude: 16.0592,
    longitude: 108.2460,
    uniqueId: "pin-9994"
  },
  {
    id: 9995,
    name: "Bán Đảo Sơn Trà & Chùa Linh Ứng",
    location: "Bãi Bụt, Bán Đảo Sơn Trà, Đà Nẵng",
    rating: 4.9,
    reviewCount: 2200,
    imageUrl: "https://images.unsplash.com/photo-1528127269322-539801943592?auto=format&fit=crop&w=1200&q=80",
    description: "Ngôi chùa linh thiêng với tượng Phật Bà Quan Thế Âm cao 67m hướng mắt nhìn ra đại dương xanh ngắt.",
    type: "pin",
    category: "Địa điểm tâm linh",
    averagePrice: 0,
    provinceId: 2,
    status: "ACTIVE",
    latitude: 16.1000,
    longitude: 108.2770,
    uniqueId: "pin-9995"
  },
  {
    id: 9996,
    name: "InterContinental Danang Sun Peninsula",
    location: "Bãi Bắc, Bán Đảo Sơn Trà, Đà Nẵng",
    rating: 4.9,
    reviewCount: 1200,
    imageUrl: "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1600&q=80",
    description: "Khu nghỉ dưỡng 5 sao đẳng cấp thế giới do Bill Bensley thiết kế, nép mình bên sườn đồi thoai thoải hướng biển.",
    type: "bed",
    category: "Khách sạn",
    averagePrice: 7500000,
    provinceId: 2,
    status: "ACTIVE",
    latitude: 16.1190,
    longitude: 108.3075,
    uniqueId: "bed-9996"
  },
  {
    id: 9997,
    name: "Novotel Danang Premier Han River",
    location: "36 Bạch Đằng, Hải Châu, Đà Nẵng",
    rating: 4.6,
    reviewCount: 940,
    imageUrl: "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=1600&q=80",
    description: "Khách sạn hiện đại sát bờ sông Hàn, sở hữu Sky36 bar ngắm toàn cảnh thành phố rực rỡ về đêm.",
    type: "bed",
    category: "Khách sạn",
    averagePrice: 1900000,
    provinceId: 2,
    status: "ACTIVE",
    latitude: 16.0768,
    longitude: 108.2241,
    uniqueId: "bed-9997"
  },
  {
    id: 9998,
    name: "Nhà hàng Hải sản Bé Mặn",
    location: "Lô 11 Võ Nguyên Giáp, Mân Thái, Sơn Trà, Đà Nẵng",
    rating: 4.5,
    reviewCount: 1600,
    imageUrl: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=1600&q=80",
    description: "Điểm hẹn thưởng thức hải sản tươi sống đánh bắt trong ngày với đa dạng cách chế biến đậm vị miền Trung.",
    type: "food",
    category: "Nhà hàng",
    averagePrice: 350000,
    provinceId: 2,
    status: "ACTIVE",
    latitude: 16.0694,
    longitude: 108.2472,
    uniqueId: "food-9998"
  },
  {
    id: 9999,
    name: "Bếp Trang - Mì Quảng Ếch",
    location: "24 Pasteur, Hải Châu 1, Hải Châu, Đà Nẵng",
    rating: 4.6,
    reviewCount: 880,
    imageUrl: "https://images.unsplash.com/photo-1569718212165-3a8278d5f624?auto=format&fit=crop&w=1600&q=80",
    description: "Thương hiệu mì Quảng ếch nổi tiếng xứ Đà, phục vụ trên mẹt lót lá chuối dân dã và thơm lừng.",
    type: "food",
    category: "Nhà hàng",
    averagePrice: 75000,
    provinceId: 2,
    status: "ACTIVE",
    latitude: 16.0682,
    longitude: 108.2195,
    uniqueId: "food-9999"
  },

  // ==================== QUẢNG NAM / HỘI AN (provinceId: 3) ====================
  {
    id: 8881,
    name: "Phố Cổ Hội An",
    location: "Minh An, Hội An, Quảng Nam",
    rating: 4.9,
    reviewCount: 4200,
    imageUrl: "https://images.unsplash.com/photo-1583417319070-4a69db38a482?auto=format&fit=crop&w=1600&q=80",
    description: "Khu phố cổ lung linh đèn lồng bên dòng sông Hoài, bảo tồn trọn vẹn nét văn hóa thương cảng thế kỷ 16.",
    type: "pin",
    category: "Phố cổ",
    averagePrice: 0,
    provinceId: 3,
    status: "ACTIVE",
    latitude: 15.8794,
    longitude: 108.3282,
    uniqueId: "pin-8881"
  },
  {
    id: 8882,
    name: "Thánh Địa Mỹ Sơn",
    location: "Duy Phú, Duy Xuyên, Quảng Nam",
    rating: 4.7,
    reviewCount: 1500,
    imageUrl: "https://images.unsplash.com/photo-1528127269322-539801943592?auto=format&fit=crop&w=1600&q=80",
    description: "Quần thể đền tháp Chăm Pa huyền bí giữa thung lũng đại ngàn, di sản văn hóa thế giới UNESCO.",
    type: "pin",
    category: "Di tích lịch sử",
    averagePrice: 150000,
    provinceId: 3,
    status: "ACTIVE",
    latitude: 15.7997,
    longitude: 108.1239,
    uniqueId: "pin-8882"
  },
  {
    id: 8883,
    name: "Rừng Dừa Bảy Mẫu",
    location: "Tổ 2, Thôn Vạn Lăng, Cẩm Thanh, Hội An, Quảng Nam",
    rating: 4.8,
    reviewCount: 2300,
    imageUrl: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1600&q=80",
    description: "Trải nghiệm đi thuyền thúng len lỏi qua rặng dừa nước bạt ngàn và xem nghệ nhân biểu diễn xoay thúng ngoạn mục.",
    type: "pin",
    category: "Khu du lịch sinh thái",
    averagePrice: 120000,
    provinceId: 3,
    status: "ACTIVE",
    latitude: 15.8674,
    longitude: 108.3685,
    uniqueId: "pin-8883"
  },
  {
    id: 8884,
    name: "Anantara Hoi An Resort",
    location: "1 Phạm Hồng Thái, Cẩm Châu, Hội An, Quảng Nam",
    rating: 4.8,
    reviewCount: 760,
    imageUrl: "https://images.unsplash.com/photo-1540541338287-41700207dee6?auto=format&fit=crop&w=1600&q=80",
    description: "Khu nghỉ dưỡng phong cách Đông Dương trang nhã tọa lạc yên bình bên dòng sông Thu Bồn thơ mộng.",
    type: "bed",
    category: "Khách sạn",
    averagePrice: 3200000,
    provinceId: 3,
    status: "ACTIVE",
    latitude: 15.8767,
    longitude: 108.3375,
    uniqueId: "bed-8884"
  },
  {
    id: 8885,
    name: "Bánh Mì Phượng Hội An",
    location: "2B Phan Chu Trinh, Cẩm Châu, Hội An, Quảng Nam",
    rating: 4.7,
    reviewCount: 3800,
    imageUrl: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=1600&q=80",
    description: "Thương hiệu bánh mì nổi tiếng thế giới với vỏ giòn rụm, nhân thịt pate đậm đà và các loại rau thơm tươi ngon.",
    type: "food",
    category: "Nhà hàng",
    averagePrice: 40000,
    provinceId: 3,
    status: "ACTIVE",
    latitude: 15.8778,
    longitude: 108.3323,
    uniqueId: "food-8885"
  },

  // ==================== THỪA THIÊN HUẾ (provinceId: 1) ====================
  {
    id: 7771,
    name: "Đại Nội & Kinh Thành Huế",
    location: "Thuận Thành, Thành phố Huế, Thừa Thiên Huế",
    rating: 4.8,
    reviewCount: 2900,
    imageUrl: "https://images.unsplash.com/photo-1544077960-604201fe74bc?auto=format&fit=crop&w=1600&q=80",
    description: "Kinh đô phong kiến triều Nguyễn lưu giữ hàng trăm công trình cung điện nguy nga, cổ kính và vàng son một thuở.",
    type: "pin",
    category: "Di tích lịch sử",
    averagePrice: 200000,
    provinceId: 1,
    status: "ACTIVE",
    latitude: 16.4697,
    longitude: 107.5786,
    uniqueId: "pin-7771"
  },
  {
    id: 7772,
    name: "Chùa Thiên Mụ",
    location: "Hương Hòa, Thành phố Huế, Thừa Thiên Huế",
    rating: 4.8,
    reviewCount: 2100,
    imageUrl: "https://images.unsplash.com/photo-1508672019048-805b876b67e2?auto=format&fit=crop&w=1600&q=80",
    description: "Biểu tượng tâm linh cố đô với tháp Phước Duyên 7 tầng sừng sững bên dòng sông Hương êm đềm.",
    type: "pin",
    category: "Địa điểm tâm linh",
    averagePrice: 0,
    provinceId: 1,
    status: "ACTIVE",
    latitude: 16.4528,
    longitude: 107.5453,
    uniqueId: "pin-7772"
  },
  {
    id: 7773,
    name: "Silk Path Grand Hue Hotel",
    location: "02 Lê Lợi, Vĩnh Ninh, Thành phố Huế, Thừa Thiên Huế",
    rating: 4.8,
    reviewCount: 650,
    imageUrl: "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1600&q=80",
    description: "Khách sạn 5 sao mang phong cách quý tộc cung đình kết hợp nét kiến trúc Đông Dương sang trọng bậc nhất Huế.",
    type: "bed",
    category: "Khách sạn",
    averagePrice: 2100000,
    provinceId: 1,
    status: "ACTIVE",
    latitude: 16.4612,
    longitude: 107.5873,
    uniqueId: "bed-7773"
  },
  {
    id: 7774,
    name: "Cơm Hến Hoa Đông",
    location: "64 Kiệt 7 Ưng Bình, Cồn Hến, Thành phố Huế, Thừa Thiên Huế",
    rating: 4.6,
    reviewCount: 920,
    imageUrl: "https://images.unsplash.com/photo-1569718212165-3a8278d5f624?auto=format&fit=crop&w=1600&q=80",
    description: "Địa chỉ thưởng thức cơm hến, bún hến gia truyền đậm đà hương vị cay nồng đặc trưng Cồn Hến.",
    type: "food",
    category: "Nhà hàng",
    averagePrice: 35000,
    provinceId: 1,
    status: "ACTIVE",
    latitude: 16.4815,
    longitude: 107.6042,
    uniqueId: "food-7774"
  }
];



export const useExplore = () => {
  const navigate = useNavigate();
  const { userInfo } = useSelector((state: RootState) => state.user as UserState);
  
  const [places, setPlaces] = useState<HighlightItem[]>([]);
  const [savedTrips, setSavedTrips] = useState<SavedTrip[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState("pin");
  const [searchTerm, setSearchTerm] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "map">("grid");
  const [selectedRoutePoints, setSelectedRoutePoints] = useState<HighlightItem[]>([]);
  const [isOptimizingRoute, setIsOptimizingRoute] = useState(false);
  const [routeGeometry, setRouteGeometry] = useState<[number, number][] | null>(null);
  const [activeMapPointId, setActiveMapPointId] = useState<string | number | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [filterProvince, setFilterProvince] = useState("2");
  const [filterPriceRange, setFilterPriceRange] = useState("all");
  const [filterSubCategory, setFilterSubCategory] = useState("all");
  const [sortBy, setSortBy] = useState("rating");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [isOptimizeModalOpen, setIsOptimizeModalOpen] = useState(false);
  const [nearbyServices, setNearbyServices] = useState<HighlightItem[]>([]);
  const [isFetchingNearby, setIsFetchingNearby] = useState(false);
  const [primaryActivePointId, setPrimaryActivePointId] = useState<string | number | null>(null);

  const lastRequestId = useRef(0);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchTerm), 500);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  useEffect(() => {
    const fetchSavedTrips = async () => {
      try {
        const savedRes = await getSavedTrips();
        if (savedRes.data?.data) setSavedTrips(savedRes.data.data);
      } catch (e) {
        console.warn("Lỗi tải saved trips:", e);
      }
    };
    fetchSavedTrips();
  }, []);

  const fetchPlaces = useCallback(async () => {
    const requestId = ++lastRequestId.current;
    const cacheKey = `explore-${activeCategory}-${debouncedSearch}-${filterProvince}`;
    const cachedData = getCache(cacheKey);

    if (cachedData) {
      setPlaces(cachedData);
      setIsLoading(false);
      setError(null);
      return;
    }

    setIsLoading(true);
    setPlaces([]);
    setError(null);

    try {
      const isSearching = debouncedSearch.trim().length > 0;
      const limit = 500; 
      
      let hotelsRes, restaurantsRes, attractionsRes, servicesRes;
      
      if (activeCategory === "all") {
        const allLimit = 500;
        [hotelsRes, restaurantsRes, attractionsRes, servicesRes] = await Promise.all([
          isSearching ? getHotelsByKeyword(debouncedSearch, 0, allLimit) : getHotels(0, allLimit, filterProvince),
          isSearching ? getHighlightRestaurantsByKeyword(debouncedSearch, 0, allLimit) : getHighlightRestaurants(allLimit, filterProvince),
          isSearching ? getHighlightAttractionsByKeyword(debouncedSearch, 0, allLimit) : getHighlightLocations(allLimit, filterProvince),
          adminService.fetchAllNearbyServices(0, 50)
        ]);
      } else if (activeCategory === "bed") {
        hotelsRes = isSearching ? await getHotelsByKeyword(debouncedSearch, 0, limit) : await getHotels(0, limit, filterProvince);
      } else if (activeCategory === "food") {
        restaurantsRes = isSearching ? await getHighlightRestaurantsByKeyword(debouncedSearch, 0, limit) : await getHighlightRestaurants(limit, filterProvince);
      } else if (activeCategory === "pin") {
        attractionsRes = isSearching ? await getHighlightAttractionsByKeyword(debouncedSearch, 0, limit) : await getHighlightLocations(limit, filterProvince);
      } else if (activeCategory === "service") {
        servicesRes = await adminService.fetchAllNearbyServices(0, 100);
      }

      if (requestId !== lastRequestId.current) return;

      const extractContent = (res: any) => {
        const rawData = res?.data?.data;
        if (!rawData) return [];
        return Array.isArray(rawData) ? rawData : (rawData.content || []);
      };

      const extractCoords = (raw: string) => {
        if (!raw) return null;
        const match = raw.match(/(-?\d+\.?\d*)\s*,\s*(-?\d+\.?\d*)/);
        if (match) return { lat: parseFloat(match[1]), lng: parseFloat(match[2]) };
        return null;
      };

      const mapWithCoords = (items: any[]) => {
        return items.map(item => {
          const coords = extractCoords(item.location) || 
                         ((item.latitude && item.longitude) ? { lat: item.latitude, lng: item.longitude } : null);
          
          return {
            ...item,
            latitude: coords?.lat || item.latitude,
            longitude: coords?.lng || item.longitude,
            uniqueId: item.uniqueId || `${item.type || 'unknown'}-${item.id}`
          };
        });
      };

      const mappedServices = extractContent(servicesRes).map((s: any) => {
        let type = s.serviceType.toLowerCase();
        if (type === 'restaurant') type = 'food';
        if (type === 'hotel') type = 'bed';
        
        const coords = extractCoords(s.location) || ((s.latitude && s.longitude) 
          ? { lat: s.latitude, lng: s.longitude }
          : null);

        return {
          ...s,
          name: s.serviceName,
          type: type,
          location: s.address,
          latitude: coords?.lat || s.latitude,
          longitude: coords?.lng || s.longitude,
          rating: s.rating || 5.0,
          averagePrice: 0,
          category: s.serviceType,
          uniqueId: `service-${s.id}`,
          isService: true
        };
      });

      const allItems = [
        ...mapWithCoords(extractContent(hotelsRes)),
        ...mapWithCoords(extractContent(restaurantsRes)),
        ...mapWithCoords(extractContent(attractionsRes)),
        ...mappedServices
      ];

      const uniqueItems = allItems
        .filter(item => {
          if (!item || (!item.id && !item.uniqueId)) return false;
          const name = (item.name || "").trim();
          const invalidNames = ["unknown attraction", "địa điểm tham quan", "be đang thiếu", "đang cập nhật", "null", "undefined"];
          const isBasicValid = name && !invalidNames.some(invalid => name.toLowerCase().includes(invalid));
          return isBasicValid && item.status === 'ACTIVE';
        });

      setCache(cacheKey, uniqueItems);

      if (activeCategory === "all" && !debouncedSearch) {
        const hotels = uniqueItems.filter(i => i.type === "bed");
        const foods = uniqueItems.filter(i => i.type === "food");
        const pins = uniqueItems.filter(i => i.type === "pin");
        if (hotels.length > 0) setCache("explore-bed-", hotels);
        if (foods.length > 0) setCache("explore-food-", foods);
        if (pins.length > 0) setCache("explore-pin-", pins);
      }

      if (uniqueItems.length === 0) {
        setPlaces(EXPLORE_MOCK_DATA);
      } else {
        setPlaces(uniqueItems);
      }
    } catch (err) {
      if (requestId === lastRequestId.current) {
        console.error("Lỗi fetchPlaces:", err);
        setPlaces(EXPLORE_MOCK_DATA);
        setError(null);
      }
    } finally {
      if (requestId === lastRequestId.current) {
        setIsLoading(false);
      }
    }
  }, [debouncedSearch, activeCategory, filterProvince]);

  useEffect(() => {
    fetchPlaces();
  }, [fetchPlaces]);

  // Fetch nearby services when active point changes
  useEffect(() => {
    const fetchNearby = async () => {
      if (!activeMapPointId) {
        if (primaryActivePointId === null) {
          setNearbyServices([]);
        }
        return;
      }

      // Find the item using uniqueId or ID
      const activeItemInPlaces = places.find(p => 
        (p.uniqueId && String(p.uniqueId) === String(activeMapPointId)) || 
        String(p.id) === String(activeMapPointId)
      );
      
      // Case 1: Clicking a Main Location (not a service)
      if (activeItemInPlaces && !activeItemInPlaces.isService) {
        const currentId = activeItemInPlaces.uniqueId || activeItemInPlaces.id;
        setPrimaryActivePointId(currentId);
        console.log(`[Explore] Main point selected: ${activeItemInPlaces.name}`);
        
        // Fetch from API and Scan locally... (logic remains)
        let apiNearby: HighlightItem[] = [];
        const typeMap: Record<string, "hotel" | "restaurant" | "attraction"> = {
          bed: "hotel",
          food: "restaurant",
          pin: "attraction"
        };

        const targetType = typeMap[activeItemInPlaces.type];
        if (targetType) {
          try {
            const res = await adminService.fetchNearbyServicesByTarget(targetType, activeItemInPlaces.id);
            const rawData = res?.data?.data || [];
            
            const extractCoords = (raw: string) => {
              if (!raw) return null;
              const match = raw.match(/(-?\d+\.?\d*)\s*,\s*(-?\d+\.?\d*)/);
              if (match) return { lat: parseFloat(match[1]), lng: parseFloat(match[2]) };
              return null;
            };

            apiNearby = rawData.map((s: any) => {
              let type = s.serviceType.toLowerCase();
              if (type === 'restaurant') type = 'food';
              if (type === 'hotel') type = 'bed';
              const coords = (s.latitude && s.longitude) ? { lat: s.latitude, lng: s.longitude } : extractCoords(s.location);
              return {
                ...s, name: s.serviceName, type, location: s.address,
                latitude: coords?.lat || s.latitude, longitude: coords?.lng || s.longitude,
                rating: s.rating || 5.0, averagePrice: 0, category: s.serviceType,
                uniqueId: `nearby-${s.id}`, isService: true
              };
            });
          } catch (err) {
            console.error("Lỗi fetchNearbyServices API:", err);
          }
        }

        const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
          const R = 6371; 
          const dLat = (lat2 - lat1) * Math.PI / 180;
          const dLon = (lon2 - lon1) * Math.PI / 180;
          const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
                    Math.sin(dLon / 2) * Math.sin(dLon / 2);
          const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
          return R * c;
        };

        const localNearby = places.filter(p => {
          if (String(p.id) === String(activeMapPointId)) return false; 
          if (!p.latitude || !p.longitude || !activeItemInPlaces.latitude || !activeItemInPlaces.longitude) return false;
          const dist = calculateDistance(Number(activeItemInPlaces.latitude), Number(activeItemInPlaces.longitude), Number(p.latitude), Number(p.longitude));
          return dist <= 1.2; // Increased scanning radius from 1.2km to 5.0km
        }).map(p => ({ ...p, uniqueId: `local-nearby-${p.id}`, isService: true }));

        const combined = [...apiNearby, ...localNearby];
        
        // Improve unique filtering to avoid key collisions
        const uniqueMap = new Map();
        combined.forEach(item => {
          const key = `${item.type}-${item.id}`;
          if (!uniqueMap.has(key)) {
            uniqueMap.set(key, {
              ...item,
              uniqueId: `service-${key}` // Consistent uniqueId
            });
          }
        });
        
        setNearbyServices(Array.from(uniqueMap.values()));
      } 
      // Case 2: Clicking a Nearby Service
      else {
        // Just keep the current nearbyServices as is, but update the panel info
        console.log(`[Explore] Nearby service selected, keeping current context.`);
      }
    };

    fetchNearby();
  }, [activeMapPointId, places]);

  // Handle clearing when activeMapPointId becomes null explicitly
  const handleCloseDetail = useCallback(() => {
    // If the point being closed is the PRIMARY one, clear everything
    // If not, it means we're closing a service, so we might want to return to primary or stay
    setActiveMapPointId(null);
    setNearbyServices([]);
    setPrimaryActivePointId(null);
  }, []);

  const filteredData = useMemo(() => {
    const searchLower = debouncedSearch.toLowerCase();
    
    const result = (places || [])
      .filter((item) => {
        const matchesMainCategory = 
          activeCategory === "all" || 
          item.type === activeCategory || 
          (activeCategory === "service" && item.isService);
        const itemCategory = item.category?.toUpperCase() || "";
        const matchesSubCategory = filterSubCategory === "all" || itemCategory.includes(filterSubCategory.toUpperCase());
        const itemProvinceId = item.provinceId?.toString() || "0";
        const matchesProvince = filterProvince === "all" || itemProvinceId === filterProvince;
        
        let matchesPrice = true;
        const itemPrice = Number(item.averagePrice) || 0;
        if (filterPriceRange === "budget") matchesPrice = itemPrice >= 0 && itemPrice < 500000;
        else if (filterPriceRange === "mid") matchesPrice = itemPrice >= 500000 && itemPrice <= 2000000;
        else if (filterPriceRange === "luxury") matchesPrice = itemPrice > 2000000;

        let matchesSemantic = true;
        if (selectedTags.length > 0) {
           const itemText = (item.name + item.description + item.category).toLowerCase();
           matchesSemantic = selectedTags.every(tag => {
              if (tag === 'quiet') return itemText.includes('yên tĩnh') || itemText.includes('không gian riêng');
              if (tag === 'work') return itemText.includes('làm việc') || itemText.includes('ổ cắm') || itemText.includes('wifi');
              if (tag === 'chill') return itemText.includes('chill') || itemText.includes('thư giãn') || itemText.includes('view');
              if (tag === 'checkin') return itemText.includes('sống ảo') || itemText.includes('đẹp') || itemText.includes('chụp ảnh');
              if (tag === 'family') return itemText.includes('gia đình') || itemText.includes('trẻ em');
              if (tag === 'date') return itemText.includes('hẹn hò') || itemText.includes('lãng mạn');
              return true;
           });
        }

        if (debouncedSearch) {
           const matchesSearch = (item.name + item.description + item.location).toLowerCase().includes(searchLower);
           if (!matchesSearch) return false;
        }

        return matchesMainCategory && matchesSubCategory && matchesProvince && matchesPrice && matchesSemantic;
      });
    
    return result.sort((a, b) => {
        if (sortBy === "rating") return (Number(b.rating) || 0) - (Number(a.rating) || 0);
        if (sortBy === "priceAsc") return (Number(a.averagePrice) || 0) - (Number(b.averagePrice) || 0);
        if (sortBy === "priceDesc") return (Number(b.averagePrice) || 0) - (Number(a.averagePrice) || 0);
        return 0;
      });
  }, [places, activeCategory, filterProvince, filterPriceRange, filterSubCategory, sortBy, selectedTags, debouncedSearch]);

  const totalPages = Math.ceil(filteredData.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const displayedData = useMemo(() => filteredData.slice(startIndex, startIndex + ITEMS_PER_PAGE), [filteredData, startIndex]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const handleCategoryChange = (category: string) => {
    setActiveCategory(category);
    setFilterSubCategory("all");
    setCurrentPage(1);
  };

  const handleTagToggle = (tagId: string) => {
    setSelectedTags(prev => prev.includes(tagId) ? prev.filter(t => t !== tagId) : [...prev, tagId]);
    setCurrentPage(1);
  };

  const handleToggleRouteSelection = (item: HighlightItem) => {
    const exists = selectedRoutePoints.find(p => p.id === item.id);
    if (exists) {
      setSelectedRoutePoints(prev => prev.filter(p => p.id !== item.id));
      setRouteGeometry(null);
    } else {
      if (selectedRoutePoints.length > 0) {
        if (String(item.provinceId) !== String(selectedRoutePoints[0].provinceId)) {
          toast.error("Vui lòng chỉ chọn các địa điểm trong cùng một khu vực!");
          return;
        }
      }
      if (selectedRoutePoints.length >= 10) {
        toast.warning("Tối đa 10 địa điểm!");
        return;
      }
      setSelectedRoutePoints(prev => [...prev, item]);
      setRouteGeometry(null);
      toast.success(`Đã thêm ${item.name}`);
    }
  };

  const handleOptimizeRoute = () => {
    if (selectedRoutePoints.length < 2) return;
    setIsOptimizeModalOpen(true);
  };

  const confirmOptimize = async (config: any) => {
    if (!userInfo) {
      toast.error("Vui lòng đăng nhập để sử dụng tính năng này!");
      setIsOptimizeModalOpen(false);
      return;
    }

    setIsOptimizeModalOpen(false);
    setIsOptimizingRoute(true);
    toast.info("AI đang tối ưu hóa lộ trình...");

    try {
      // Map budget string to number
      const budgetMap: Record<string, number> = {
        "Dưới 5 triệu": 3000000,
        "5 - 10 triệu": 7000000,
        "10 - 20 triệu": 15000000,
        "Trên 20 triệu": 30000000
      };

      // Calculate days
      const start = new Date(config.startDate);
      const end = new Date(config.endDate);
      const diffTime = Math.abs(end.getTime() - start.getTime());
      const daysCount = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;

      // Map selected locations
      const selectedLocations = selectedRoutePoints.map(p => ({
        id: p.id,
        type: p.type === 'bed' ? 'HOTEL' : p.type === 'food' ? 'RESTAURANT' : 'ATTRACTION',
        name: p.name
      }));

      const requestBody: itineraryService.GenerateItineraryRequest = {
        userId: Number(userInfo.id),
        provinceId: Number(selectedRoutePoints[0]?.provinceId) || 1,
        days: daysCount,
        budget: budgetMap[config.budget] || 5000000,
        interests: config.interests.map((i: string) => i.toLowerCase()),
        startDate: String(config.startDate),
        numberOfPeople: parseInt(config.peopleGroup) || 1,
        selectedLocations: selectedLocations
      };

      const res = await itineraryService.generateItinerary(requestBody);

      if (res.data?.status === 201 || res.data?.status === 200) {
        const newItineraryId = res.data?.data?.itineraryId || res.data?.data?.id;
        toast.success("Tối ưu hóa thành công!");
        navigate(`/itinerary-detail/${newItineraryId}`);
      } else {
        toast.error(res.data?.message || "Không thể tối ưu hóa lộ trình.");
      }
    } catch (err: any) {
      console.error("Lỗi tối ưu hóa AI:", err);
      toast.error(err.response?.data?.message || "Đã xảy ra lỗi khi gọi AI.");
    } finally {
      setIsOptimizingRoute(false);
    }
  };

  const clearRouteSelection = () => {
    setSelectedRoutePoints([]);
    setRouteGeometry(null);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 400, behavior: "smooth" });
  };

  const handleToggleLike = async (location: HighlightItem) => {
    const savedTrip = savedTrips.find((trip) => trip.locationId == location.id);
    const originalSavedTrips = [...savedTrips];
    const typeMap: Record<string, string> = { pin: "ATTRACTION", food: "RESTAURANT", bed: "HOTEL" };
    const locationType = typeMap[location.type] || "ATTRACTION";

    if (savedTrip) {
      setSavedTrips(savedTrips.filter((trip) => trip.locationId != location.id));
      try { 
        const res = await removeFavorite(location.id, locationType); 
        toast.info(res.data?.message || `Đã xóa khỏi yêu thích`);
      } catch (err: any) { 
        setSavedTrips(originalSavedTrips); 
        toast.error(err.response?.data?.message || "Lỗi khi xóa");
      }
    } else {
      const tempTrip: SavedTrip = { id: `temp-${Date.now()}`, locationId: location.id, title: location.name, image: location.imageUrl || "", timeAgo: "Vừa xong" };
      setSavedTrips([...savedTrips, tempTrip]);
      try { 
        const res = await addFavorite({
          locationId: location.id,
          locationType,
          locationName: location.name,
          imageUrl: location.imageUrl,
          rating: Number(location.rating) || 0,
          address: location.location || "Đang cập nhật"
        }); 
        if (res.data?.data) {
          const realFavorite = res.data.data;
          setSavedTrips(prev => prev.map(t => t.locationId == location.id ? { ...t, id: realFavorite.id } : t));
          toast.success(res.data?.message || "Đã thêm yêu thích!");
        }
      } catch (err: any) { 
        setSavedTrips(originalSavedTrips); 
        toast.error(err.response?.data?.message || "Lỗi khi thêm");
      }
    }
  };

  return {
    places, savedTrips, isLoading, error, activeCategory, searchTerm, viewMode, 
    selectedRoutePoints, isOptimizingRoute, routeGeometry, activeMapPointId, 
    currentPage, filterProvince, filterPriceRange, filterSubCategory, sortBy, 
    debouncedSearch, selectedTags, isOptimizeModalOpen,
    displayedData, filteredData, totalPages, nearbyServices, isFetchingNearby, primaryActivePointId,
    setSearchTerm, setActiveCategory, setViewMode, setFilterProvince, setFilterSubCategory,
    setFilterPriceRange, setSortBy, handleSearchChange, handleCategoryChange, 
    handleTagToggle, handleToggleRouteSelection, handleOptimizeRoute, confirmOptimize, 
    clearRouteSelection, handlePageChange, handleToggleLike, setActiveMapPointId,
    handleCloseDetail,
    setIsOptimizeModalOpen, fetchPlaces
  };
};
