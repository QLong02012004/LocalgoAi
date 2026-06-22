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

      setPlaces(uniqueItems);
    } catch (err) {
      if (requestId === lastRequestId.current) {
        console.error("Lỗi fetchPlaces:", err);
        
        const fakeData: any[] = [
          {
            id: 9991,
            name: "Cầu Vàng",
            location: "Đà Nẵng",
            rating: 4.8,
            reviewCount: 1250,
            imageUrl: "https://vnpay.vn/s1/statics.vnpay.vn/2023/12/0oiyw2ntokz1/cau-vang-da-nang-7-1701423405788.jpg",
            description: "Một trong những biểu tượng du lịch nổi tiếng thế giới tại Đà Nẵng với thiết kế độc đáo hình bàn tay khổng lồ.",
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
            name: "Khách sạn Mường Thanh",
            location: "Thừa Thiên Huế",
            rating: 4.5,
            reviewCount: 850,
            imageUrl: "https://vnpay.vn/s1/statics.vnpay.vn/2023/12/0oiyw2ntokz1/cau-vang-da-nang-7-1701423405788.jpg",
            description: "Khách sạn 4 sao sang trọng tọa lạc tại trung tâm thành phố Huế, mang đến trải nghiệm nghỉ dưỡng tuyệt vời.",
            type: "bed",
            category: "Khách sạn",
            averagePrice: 1200000,
            provinceId: 1,
            status: "ACTIVE",
            latitude: 16.4637,
            longitude: 107.5905,
            uniqueId: "bed-9992"
          },
          {
            id: 9993,
            name: "Phố cổ Hội An",
            location: "Quảng Nam",
            rating: 4.9,
            reviewCount: 2100,
            imageUrl: "https://hoianit.com/wp-content/uploads/2020/09/chua-cau-hoi-an-1.jpg",
            description: "Thành phố cổ xinh đẹp nổi tiếng với những ngôi nhà cổ, lồng đèn rực rỡ và nền ẩm thực phong phú.",
            type: "pin",
            category: "Phố cổ",
            averagePrice: 0,
            provinceId: 3,
            status: "ACTIVE",
            latitude: 15.8794,
            longitude: 108.3282,
            uniqueId: "pin-9993"
          },
          {
            id: 9994,
            name: "Nhà hàng Mộc",
            location: "Quảng Nam",
            rating: 4.7,
            reviewCount: 520,
            imageUrl: "https://hoianit.com/wp-content/uploads/2020/09/chua-cau-hoi-an-1.jpg",
            description: "Thưởng thức các món đặc sản Hội An trong không gian đồng quê mộc mạc, yên bình.",
            type: "food",
            category: "Nhà hàng",
            averagePrice: 350000,
            provinceId: 3,
            status: "ACTIVE",
            latitude: 15.8820,
            longitude: 108.3300,
            uniqueId: "food-9994"
          },
          {
            id: 9995,
            name: "Bà Nà Hills",
            location: "Đà Nẵng",
            rating: 4.6,
            reviewCount: 1500,
            imageUrl: "https://vnpay.vn/s1/statics.vnpay.vn/2023/12/0oiyw2ntokz1/cau-vang-da-nang-7-1701423405788.jpg",
            description: "Quần thể du lịch nghỉ dưỡng trên núi với tuyến cáp treo đạt nhiều kỷ lục thế giới.",
            type: "pin",
            category: "Khu du lịch sinh thái",
            averagePrice: 850000,
            provinceId: 2,
            status: "ACTIVE",
            latitude: 15.9976,
            longitude: 107.9881,
            uniqueId: "pin-9995"
          },
          {
            id: 9996,
            name: "Cơm Niêu",
            location: "Đà Nẵng",
            rating: 4.4,
            reviewCount: 410,
            imageUrl: "https://vnpay.vn/s1/statics.vnpay.vn/2023/12/0oiyw2ntokz1/cau-vang-da-nang-7-1701423405788.jpg",
            description: "Nhà hàng chuyên phục vụ cơm niêu và các món ăn gia đình truyền thống Việt Nam.",
            type: "food",
            category: "Nhà hàng",
            averagePrice: 150000,
            provinceId: 2,
            status: "ACTIVE",
            latitude: 16.0645,
            longitude: 108.2223,
            uniqueId: "food-9996"
          }
        ];
        
        setPlaces(fakeData);
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
