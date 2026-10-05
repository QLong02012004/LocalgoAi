import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import AOS from "aos";
import { 
  getAttractionDetail, 
  type Destination, 
  getAllNearbyServices, 
  type NearbyService 
} from "../../../services/destinationService";
import { getHotelDetail } from "../../../services/hotelService";
import { getRestaurantDetail } from "../../../services/restaurantService";
import { getMockDestinationDetail, MOCK_NEARBY_SERVICES } from "../../../services/mockDestinationData";

export const useDestinationDetail = () => {
  const { id } = useParams<{ id: string }>();
  const [data, setData] = useState<Destination | null>(null);
  const [nearbyServices, setNearbyServices] = useState<NearbyService[]>([]); 
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<string>("overview");

  useEffect(() => {
    const fetchAllData = async () => {
      if (!id) return;
      
      const isHotel = window.location.pathname.includes('/hotel/');
      const isRestaurant = window.location.pathname.includes('/restaurant/');
      const targetType: "hotel" | "restaurant" | "attraction" = isHotel 
        ? "hotel" 
        : isRestaurant 
        ? "restaurant" 
        : "attraction";

      try {
        setIsLoading(true);

        let detailRes;
        if (isHotel) detailRes = await getHotelDetail(id);
        else if (isRestaurant) detailRes = await getRestaurantDetail(id);
        else detailRes = await getAttractionDetail(id);

        if (detailRes.data && detailRes.data.status === 200 && detailRes.data.data) {
          const mainData = detailRes.data.data;
          setData(mainData);
          document.title = `${mainData.name} - TravelAi`;
          
          try {
            const nearbyRes = await getAllNearbyServices(id, targetType);
            if (nearbyRes.status === 200 && nearbyRes.data && nearbyRes.data.length > 0) {
              const rawServices = nearbyRes.data.filter(s => s.status === 'ACTIVE');
              const uniqueServices = rawServices.filter((v, i, a) => a.findIndex(t => t.id === v.id) === i);
              setNearbyServices(uniqueServices.length > 0 ? uniqueServices : MOCK_NEARBY_SERVICES.default);
            } else {
              setNearbyServices(MOCK_NEARBY_SERVICES.default);
            }
          } catch (err) {
            console.warn("Lỗi khi tải dịch vụ lân cận từ BE, dùng mock data:", err);
            setNearbyServices(MOCK_NEARBY_SERVICES.default);
          }
        } else {
          // Fallback to rich mock data
          const mockData = getMockDestinationDetail(id, targetType);
          setData(mockData);
          setNearbyServices(MOCK_NEARBY_SERVICES.default);
          document.title = `${mockData.name} - TravelAi`;
        }
      } catch (err) {
        console.warn("BE offline, tải dữ liệu mẫu chi tiết địa điểm:", err);
        const mockData = getMockDestinationDetail(id, targetType);
        setData(mockData);
        setNearbyServices(MOCK_NEARBY_SERVICES.default);
        document.title = `${mockData.name} - TravelAi`;
      } finally {
        setIsLoading(false);
      }
    };

    fetchAllData();
    AOS.init({ duration: 800, once: true });
    window.scrollTo(0, 0);
  }, [id]);

  const normalizedServices: NearbyService[] = nearbyServices;

  return {
    data,
    nearbyServices,
    isLoading,
    activeTab,
    setActiveTab,
    normalizedServices
  };
};
