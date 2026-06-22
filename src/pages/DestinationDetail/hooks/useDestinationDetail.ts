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

export const useDestinationDetail = () => {
  const { id } = useParams<{ id: string }>();
  const [data, setData] = useState<Destination | null>(null);
  const [nearbyServices, setNearbyServices] = useState<NearbyService[]>([]); 
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<string>("overview");

  useEffect(() => {
    const fetchAllData = async () => {
      if (!id) return;
      
      try {
        setIsLoading(true);
        
        const isHotel = window.location.pathname.includes('/hotel/');
        const isRestaurant = window.location.pathname.includes('/restaurant/');
        const isAttraction = window.location.pathname.includes('/attraction/');

        let detailRes;
        if (isHotel) detailRes = await getHotelDetail(id);
        else if (isRestaurant) detailRes = await getRestaurantDetail(id);
        else if (isAttraction) detailRes = await getAttractionDetail(id);
        else return;

        if (detailRes.data && detailRes.data.status === 200 && detailRes.data.data) {
          const mainData = detailRes.data.data;
          setData(mainData);
          document.title = `${mainData.name} - TravelAi`;
          
          try {
            let targetType: "hotel" | "restaurant" | "attraction" = "attraction";
            if (isHotel) targetType = "hotel";
            else if (isRestaurant) targetType = "restaurant";
            
            const nearbyRes = await getAllNearbyServices(id, targetType);
            if (nearbyRes.status === 200 && nearbyRes.data) {
              const rawServices = nearbyRes.data.filter(s => s.status === 'ACTIVE');
              // Loại bỏ trùng lặp theo ID
              const uniqueServices = rawServices.filter((v, i, a) => a.findIndex(t => t.id === v.id) === i);
              setNearbyServices(uniqueServices);
            }
          } catch (err) {
            console.error("Lỗi khi tải dịch vụ lân cận:", err);
          }
        }
      } catch (err) {
        console.error("Lỗi khi tải thông tin chi tiết:", err);
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
