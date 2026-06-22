import React, { useState } from 'react';
import styles from './PlaceDetailPanel.module.scss';
import { 
  X, 
  MapPin, 
  Clock, 
  Star, 
  Bookmark, 
  ShareNetwork,
  NavigationArrow,
  Info,
  Sparkle,
  ImageSquare,
  Waveform,
  CircleNotch,
  Hourglass,
  Camera,
  Lightbulb,
  Buildings,
  Compass,
  Coins,
  ChatCircleText,
  MapTrifold,
  Plus
} from '@phosphor-icons/react';
import { type RoutePoint } from '../../types';
import { fetchReviewsByTarget, fetchNearbyServicesByTarget, type AdminReview, type AdminNearbyService } from '../../../../services/adminService';

interface Props {
  pointId: string | null;
  points: RoutePoint[];
  onClose: () => void;
  onOpenNavigation: (lat: number, lng: number, name: string) => void;
  userLocation: { lat: number, lng: number } | null;
  isSidebarCollapsed?: boolean;
  onAddNearby?: (place: any) => void;
}

type TabType = 'info' | 'reviews' | 'nearby';

const PlaceDetailPanel: React.FC<Props> = ({ pointId, points, onClose, onOpenNavigation, userLocation, isSidebarCollapsed, onAddNearby }) => {
  const point = points.find(p => p.id === pointId) || null;
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isDescExpanded, setIsDescExpanded] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>('info');
  const [reviews, setReviews] = useState<AdminReview[]>([]);
  const [nearbyServices, setNearbyServices] = useState<AdminNearbyService[]>([]);
  const [isLoadingReviews, setIsLoadingReviews] = useState(false);
  const [isLoadingNearby, setIsLoadingNearby] = useState(false);

  const [dynamicTips, setDynamicTips] = useState<string[]>([]);
  const [dynamicImages, setDynamicImages] = useState<string[]>([]);
  const [dynamicDesc, setDynamicDesc] = useState<string>("");
  const [isLoadingEnhancements, setIsLoadingEnhancements] = useState(false);

  // Fetch AI Dynamic Enhancements (Tips & realistic Images from Wikipedia & Unsplash themed catalogs)
  React.useEffect(() => {
    const fetchEnhancements = async () => {
      if (!point) return;
      setIsLoadingEnhancements(true);
      setDynamicTips([]);
      setDynamicImages([]);
      setDynamicDesc("");

      const name = point.name;
      const type = point.type;

      // 1. Generate Smart AI Tips & Recommendations
      let generatedTips: string[] = [];
      let themedImages: string[] = [];
      let fallbackDesc = "";

      if (type === 'restaurant') {
        const lowerName = name.toLowerCase();
        if (lowerName.includes("hải sản") || lowerName.includes("seafood") || lowerName.includes("cua") || lowerName.includes("ốc") || lowerName.includes("biển")) {
          generatedTips = [
            "Món nên ăn: Cua biển sốt me chua ngọt đậm đà, Mực lá nướng muối ớt cay nồng.",
            "Món nên ăn: Chíp chíp hấp sả thơm phức, Hàu sữa nướng mỡ hành béo ngậy.",
            "Kinh nghiệm: Bạn nên ra trực tiếp bể hải sản tươi sống để tự tay chọn và cân ký, đảm bảo tươi ngon 100%.",
            "Mẹo nhỏ: Đừng quên xin thêm nước chấm muối ớt xanh đặc trưng của quán, ăn kèm hải sản là ngon hết sẩy!"
          ];
          themedImages = [
            "https://images.unsplash.com/photo-1565557623262-b51c2513a641?q=80&w=600&auto=format&fit=crop",
            "https://images.unsplash.com/photo-1615141982883-c7ad0e69fd62?q=80&w=600&auto=format&fit=crop",
            "https://images.unsplash.com/photo-1553621042-f6e147245754?q=80&w=600&auto=format&fit=crop"
          ];
        } else if (lowerName.includes("bánh xèo") || lowerName.includes("bánh căn") || lowerName.includes("bà dưỡng")) {
          generatedTips = [
            "Món nên ăn: Bánh xèo tôm nhảy vỏ giòn tan nhân tôm thịt ngọt bùi.",
            "Món nên ăn: Nem lụi nướng than sả thơm phức ăn kèm rau sống.",
            "Kinh nghiệm: Hãy cuốn bánh xèo bằng bánh tráng mỏng, thêm xoài xanh, rau cải con và chấm ngập vào bát nước xốt tương gan béo ngậy.",
            "Mẹo nhỏ: Nem lụi ăn nóng hổi ngay khi vừa nướng xong là thơm ngon nhất."
          ];
          themedImages = [
            "https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?q=80&w=600&auto=format&fit=crop",
            "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?q=80&w=600&auto=format&fit=crop",
            "https://images.unsplash.com/photo-1569718212165-3a8278d5f624?q=80&w=600&auto=format&fit=crop"
          ];
        } else if (lowerName.includes("mì quảng") || lowerName.includes("quảng") || lowerName.includes("ếch")) {
          generatedTips = [
            "Món nên ăn: Mì Quảng ếch om niêu đất đậm đà hương sả nén.",
            "Món nên ăn: Mì Quảng gà ta rút xương dai ngọt thịt trọn vị truyền thống.",
            "Kinh nghiệm: Bẻ vụn bánh tráng nướng giòn rưới lên bát mì, thêm chút ớt xiêm xanh và trộn đều với lượng nước dùng xâm xấp.",
            "Mẹo nhỏ: Rau cải con và bắp chuối thái mỏng sẽ giúp tô mì thanh mát, ăn không bị ngán."
          ];
          themedImages = [
            "https://images.unsplash.com/photo-1569718212165-3a8278d5f624?q=80&w=600&auto=format&fit=crop",
            "https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?q=80&w=600&auto=format&fit=crop"
          ];
        } else if (lowerName.includes("bún chả cá") || lowerName.includes("chả cá") || lowerName.includes("bún cá")) {
          generatedTips = [
            "Món nên ăn: Bún chả cá thu/thác lác chiên hấp dai ngon đậm vị biển.",
            "Món nên ăn: Bún chả ram tôm giòn rụm lạ miệng.",
            "Kinh nghiệm: Cho thêm một thìa nhỏ mắm ruốc, hành tím ngâm và ớt tỏi băm để nước dùng dậy mùi thơm ngào ngạt.",
            "Mẹo nhỏ: Ăn kèm đĩa rau sống xắt nhuyễn sẽ khiến nước lèo ngon ngọt hơn rất nhiều."
          ];
          themedImages = [
            "https://images.unsplash.com/photo-1569718212165-3a8278d5f624?q=80&w=600&auto=format&fit=crop",
            "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?q=80&w=600&auto=format&fit=crop"
          ];
        } else {
          // General Restaurant tips
          generatedTips = [
            "Món nên ăn: Hãy chọn các món ăn mang hương vị ẩm thực địa phương đặc trưng.",
            "Món nên ăn: Thử gọi nước sâm dứa hoặc sữa đậu nành mát lạnh để giải nhiệt.",
            "Kinh nghiệm: Quán ăn này rất nổi tiếng với người bản địa, phục vụ nhanh chóng và nhiệt tình.",
            "Mẹo nhỏ: Nên đi vào khung giờ sớm một chút để tránh phải chờ đợi bàn vào giờ cao điểm."
          ];
          themedImages = [
            "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?q=80&w=600&auto=format&fit=crop",
            "https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?q=80&w=600&auto=format&fit=crop",
            "https://images.unsplash.com/photo-1569718212165-3a8278d5f624?q=80&w=600&auto=format&fit=crop"
          ];
        }
        fallbackDesc = `Chào mừng bạn đến với ${name}! Địa điểm ẩm thực tuyệt vời này hứa hẹn sẽ mang đến cho bạn những trải nghiệm ẩm thực đặc sắc của địa phương với các món ăn nóng hổi, đậm đà được chế biến khéo léo từ nguyên liệu tươi ngon nhất. Không gian quán ấm cúng, thân thiện, vô cùng thích hợp cho các buổi họp mặt gia đình và bạn bè sau một ngày dài khám phá danh lam thắng cảnh.`;
      } else if (type === 'hotel') {
        generatedTips = [
          "Mẹo nhận phòng: Thời gian check-in tiêu chuẩn là 14:00. Bạn có thể gửi hành lý miễn phí tại quầy lễ tân nếu tới sớm.",
          "Tiện ích nổi bật: Hãy thưởng thức buffet sáng đa dạng từ 6:30 - 9:30 tại nhà hàng tầng trệt.",
          "Trải nghiệm: Đừng bỏ lỡ khu vực hồ bơi vô cực ngắm nhìn toàn cảnh thành phố lung linh về đêm.",
          "Khám phá lân cận: Bạn có thể liên hệ quầy lễ tân để thuê xe máy chất lượng giá rẻ ngay tại khách sạn."
        ];
        themedImages = [
          "https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=600&auto=format&fit=crop",
          "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?q=80&w=600&auto=format&fit=crop",
          "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?q=80&w=600&auto=format&fit=crop"
        ];
        fallbackDesc = `${name} là điểm dừng chân nghỉ dưỡng lý tưởng dành cho bạn. Khách sạn sở hữu hệ thống phòng nghỉ sang trọng, hiện đại với đầy đủ tiện nghi cao cấp, mang lại không gian thư giãn tuyệt đối. Đội ngũ nhân viên chuyên nghiệp, thân thiện luôn sẵn sàng hỗ trợ bạn 24/7 để chuyến du lịch khám phá của bạn trở nên trọn vẹn nhất.`;
      } else {
        // Attractions tips
        const lowerName = name.toLowerCase();
        if (lowerName.includes("hải vân")) {
          generatedTips = [
            "Mẹo chụp ảnh: Dừng chân tại khúc cua chữ U thần thánh hoặc cây thông cô đơn để có những góc ảnh ngoạn mục.",
            "Kinh nghiệm di chuyển: Lái xe máy chậm rãi, giữ khoảng cách an toàn, bóp còi khi vào các khúc cua cùi chỏ bị khuất tầm nhìn.",
            "Trải nghiệm: Nên ghé quán cafe Hải Vân Đường trên đỉnh đèo để vừa thưởng thức trà nóng vừa săn mây cực đỉnh.",
            "Khuyên dùng: Chuẩn bị thêm một chiếc áo khoác mỏng vì đỉnh đèo gió rất to và se lạnh."
          ];
        } else if (lowerName.includes("ngũ hành sơn")) {
          generatedTips = [
            "Mẹo chuẩn bị: Hãy mang giày thể thao hoặc giày có độ bám tốt vì các bậc đá đi lên động và chùa rất trơn dốc.",
            "Kinh nghiệm tham quan: Có thể mua vé đi thang máy kính lên chùa Linh Ứng để tiết kiệm sức lực cho việc leo núi.",
            "Trải nghiệm: Đừng bỏ lỡ Động Huyền Không - hang động lớn nhất và huyền ảo nhất tại đây với các vạt nắng chiếu xuyên qua trần hang.",
            "Mẹo nhỏ: Nên mang theo nước lọc vì giá nước trên đỉnh núi sẽ đắt hơn bình thường."
          ];
        } else if (lowerName.includes("bà nà") || lowerName.includes("sun world") || lowerName.includes("cầu vàng") || lowerName.includes("hills")) {
          generatedTips = [
            "Mẹo check-in: Nên đón chuyến cáp treo sớm nhất từ 7:30 sáng để đến Cầu Vàng trước khi lượng khách đông và sương mù che khuất.",
            "Chuẩn bị: Nhiệt độ trên đỉnh Bà Nà chênh lệch khá nhiều so với đồng bằng, hãy chuẩn bị áo ấm mỏng và ô dù nhỏ phòng mưa.",
            "Trải nghiệm: Thử thách bản thân với các trò chơi cảm giác mạnh tại Fantasy Park và khám phá làng Pháp lãng mạn.",
            "Mẹo ăn uống: Nên mua vé buffet kèm cáp treo để tiết kiệm chi phí ẩm thực trên đỉnh."
          ];
        } else if (lowerName.includes("hội an") || lowerName.includes("chùa cầu") || lowerName.includes("sông hoài") || lowerName.includes("phố cổ")) {
          generatedTips = [
            "Mẹo check-in: Khoảng thời gian từ 16:30 chiều là đẹp nhất, khi phố cổ bắt đầu lên đèn lồng rực rỡ và thời tiết mát mẻ.",
            "Trải nghiệm: Hãy mua vé tham quan các nhà cổ (Nhà cổ Tấn Ký, Phùng Hưng) để nghe thuyết minh về lịch sử thương cảng.",
            "Kinh nghiệm: Thuê một chiếc xe đạp nhỏ để dạo quanh các ngõ sơn vàng thơ mộng và đi thuyền thả hoa đăng trên sông Hoài.",
            "Món nên thử: Thưởng thức bánh mì Phượng nổi tiếng thế giới hoặc đĩa cơm gà Bà Buội thơm lừng."
          ];
        } else if (lowerName.includes("cầu rồng") || lowerName.includes("cầu sông hàn") || lowerName.includes("bờ sông")) {
          generatedTips = [
            "Mẹo check-in: Cầu Rồng sẽ trình diễn phun lửa và nước vào lúc 21:00 các ngày Thứ 6, Thứ 7, Chủ Nhật hàng tuần.",
            "Góc nhìn đẹp nhất: Nên chọn vị trí tại các quán cafe rooftop ven sông hoặc đứng dưới chân cầu phía đường Trần Hưng Đạo để xem cận cảnh.",
            "Kinh nghiệm: Đứng quá gần cầu lúc phun nước có thể bị ướt, hãy chuẩn bị sẵn một túi chống nước bảo vệ điện thoại.",
            "Kết hợp: Đi bộ dạo chợ đêm Sơn Trà ngay bên cạnh cầu để thưởng thức ẩm thực đường phố sầm uất."
          ];
        } else {
          // General Attraction tips
          generatedTips = [
            "Mẹo trang phục: Nên ăn mặc lịch sự, kín kẽ khi ghé thăm các địa điểm tâm linh, chùa chiền tôn nghiêm.",
            "Chuẩn bị: Luôn mang theo kem chống nắng, mũ rộng vành, sạc dự phòng và nước uống đầy đủ trong túi xách.",
            "Mẹo chụp ảnh: Thời điểm ánh sáng đẹp nhất để có những bức ảnh lung linh là từ 8:00 - 10:00 sáng hoặc 15:30 - 17:30 chiều.",
            "Lưu ý: Giữ gìn vệ sinh chung, bỏ rác đúng nơi quy định để chung tay bảo vệ môi trường du lịch xanh sạch."
          ];
        }
        themedImages = [
          "https://images.unsplash.com/photo-1528127269322-539801943592?q=80&w=600&auto=format&fit=crop",
          "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=600&auto=format&fit=crop",
          "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?q=80&w=600&auto=format&fit=crop"
        ];
        fallbackDesc = `Chào mừng bạn đến với ${name}! Đây là một trong những địa điểm tham quan du lịch vô cùng nổi tiếng và hấp dẫn tại miền Trung Việt Nam. Đến đây, bạn sẽ được hòa mình vào không gian thiên nhiên hùng vĩ, khám phá những công trình kiến trúc mang đậm dấu ấn lịch sử, văn hóa độc đáo và lưu lại cho mình những bức ảnh check-in tuyệt đẹp, đầy ấn tượng.`;
      }

      // 2. Fetch Real-World Images & Official Descriptions from Wikipedia API!
      try {
        let searchTerm = name
          .replace(/Hải sản/i, '')
          .replace(/Nhà hàng/i, '')
          .replace(/Khách sạn/i, '')
          .replace(/Chùa/i, '')
          .replace(/Đèo/i, '')
          .trim();

        if (searchTerm.length < 3) searchTerm = name;

        const wikiUrl = `https://vi.wikipedia.org/w/api.php?action=query&prop=pageimages|extracts&format=json&piprop=thumbnail&pithumbsize=600&exintro&explaintext&titles=${encodeURIComponent(searchTerm)}&generator=search&gsrsearch=${encodeURIComponent(searchTerm)}&gsrlimit=1&origin=*`;
        const res = await fetch(wikiUrl);
        if (res.ok) {
          const wikiData = await res.json();
          const pages = wikiData.query?.pages;
          if (pages) {
            const pageId = Object.keys(pages)[0];
            const page = pages[pageId];
            
            if (page.thumbnail?.source) {
              themedImages = [page.thumbnail.source, ...themedImages];
            }
            if (page.extract && page.extract.length > 50) {
              fallbackDesc = page.extract;
            }
          }
        }
      } catch (err) {
        console.error("Wikipedia API fetch failed, falling back to smart content:", err);
      }

      setDynamicTips(generatedTips);
      setDynamicImages(themedImages);
      setDynamicDesc(fallbackDesc);
      setIsLoadingEnhancements(false);
    };

    fetchEnhancements();
  }, [pointId, point]);

  // Reset tab when point changes
  React.useEffect(() => {
    setActiveTab('info');
  }, [pointId]);

  // Fetch reviews and nearby services
  React.useEffect(() => {
    const fetchData = async () => {
      if (!point || !point.entityId) return;

      const entityId = Number(point.entityId);
      const type = point.type === 'hotel' ? 'hotel' : point.type === 'restaurant' ? 'restaurant' : 'attraction';

      setIsLoadingReviews(true);
      setIsLoadingNearby(true);

      try {
        const [reviewsRes, nearbyRes] = await Promise.all([
          fetchReviewsByTarget(type, entityId),
          fetchNearbyServicesByTarget(type, entityId)
        ]);
        setReviews(reviewsRes.data.data?.content || []);
        setNearbyServices(nearbyRes.data.data || []);
      } catch (err) {
        console.error("Error fetching detail data:", err);
      } finally {
        setIsLoadingReviews(false);
        setIsLoadingNearby(false);
      }
    };

    fetchData();
  }, [point]);

  // Pre-load voices for better reliability
  React.useEffect(() => {
    const loadVoices = () => {
      const v = window.speechSynthesis.getVoices();
      console.log("Available voices:", v.length);
    };
    loadVoices();
    if (window.speechSynthesis.onvoiceschanged !== undefined) {
      window.speechSynthesis.onvoiceschanged = loadVoices;
    }
  }, []);

  const handleTTS = () => {
    if (!point?.description) return;
    
    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    const utterance = new SpeechSynthesisUtterance(point.description);
    
    // 1. Refresh voices
    const voices = window.speechSynthesis.getVoices();
    
    // 2. Find Vietnamese voice with more flexible matching
    // Some systems use 'vi-VN', some 'vi_VN', some just 'vi'
    // Some names have 'Vietnamese', 'Tiếng Việt', 'An', 'Linh'
    const viVoice = voices.find(v => 
      v.lang.toLowerCase().replace('_', '-').startsWith('vi') || 
      v.name.toLowerCase().includes('vietnamese') ||
      v.name.toLowerCase().includes('tiếng việt')
    );

    if (viVoice) {
      utterance.voice = viVoice;
      utterance.lang = viVoice.lang;
    } else {
      // Fallback to standard code if no specific voice found
      utterance.lang = 'vi-VN';
    }
    
    utterance.rate = 0.9;
    utterance.pitch = 1;
    utterance.volume = 1;
    
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = (e) => {
      console.error('TTS Error:', e);
      setIsSpeaking(false);
    };
    
    // Cancel any ongoing speech before starting new
    window.speechSynthesis.cancel();
    
    // Small timeout to ensure cancel finishes in some browsers
    setTimeout(() => {
      window.speechSynthesis.speak(utterance);
    }, 50);
  };

  const calculateDistance = () => {
    if (!userLocation || !point) return null;
    const R = 6371; // Earth radius in km
    const dLat = (point.lat - userLocation.lat) * Math.PI / 180;
    const dLon = (point.lng - userLocation.lng) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(userLocation.lat * Math.PI / 180) * Math.cos(point.lat * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    const d = R * c;
    return d.toFixed(1);
  };

  const distance = calculateDistance();

  const handleOpenNavigation = () => {
    if (!point) return;
    onOpenNavigation(point.lat, point.lng, point.name);
  };

  const renderDescription = (text: string) => {
    if (!text) return null;
    const isLong = text.length > 250;
    const displayedText = (isLong && !isDescExpanded) ? text.slice(0, 250) + '...' : text;

    return (
      <div className={styles.descriptionWrapper}>
        <p className={`${styles.mainDesc} ${isLong && !isDescExpanded ? styles.truncated : ''}`}>
          {displayedText}
        </p>
        {isLong && (
          <button 
            className={styles.readMoreBtn} 
            onClick={() => setIsDescExpanded(!isDescExpanded)}
          >
            {isDescExpanded ? 'Thu gọn' : 'Xem thêm'}
          </button>
        )}
      </div>
    );
  };

  if (!pointId || !point) return null;

  return (
    <div className={`${styles.panelContainer} ${pointId ? styles.isOpen : ''} ${isSidebarCollapsed ? styles.collapsedSidebar : ''}`}>

      <div className={styles.contentScroll}>
        <div className={styles.heroSection}>
          <div className={styles.heroImageWrapper}>
            {(point.imageUrl || (dynamicImages.length > 0 && dynamicImages[0])) ? (
              <div className={styles.imageBg} style={{ backgroundImage: `url(${point.imageUrl || dynamicImages[0]})` }}>
                <div className={styles.imageOverlay}></div>
              </div>
            ) : (
              <div className={styles.placeholderBg}>
                <div className={styles.meshGradient}></div>
                <div className={styles.placeholderContent}>
                  <MapPin size={48} weight="duotone" />
                  <span>Đang tải hình ảnh...</span>
                </div>
              </div>
            )}
          </div>
          
          <div className={styles.floatingHeader}>
            <button type="button" className={styles.circleBtn} onClick={onClose}>
              <X size={20} weight="bold" />
            </button>
            <div className={styles.headerRight}>
              <button type="button" className={styles.circleBtn}><Bookmark size={20} weight="fill" /></button>
              <button type="button" className={styles.circleBtn}><ShareNetwork size={20} weight="bold" /></button>
            </div>
          </div>

          <div className={styles.heroContent}>
            <div className={styles.badgeRow}>
              <span className={styles.categoryBadge}>{point.type.toUpperCase()}</span>
              {distance && (
                <div className={styles.distanceBadge}>
                  <NavigationArrow size={12} weight="fill" />
                  {distance} km
                </div>
              )}
            </div>
            <h2 className={styles.title}>{point.name}</h2>
            <div className={styles.ratingBox}>
              <div className={styles.ratingChip}>
                <div className={styles.stars}>
                  <Star size={18} weight="fill" color="#FFD700" />
                  <span className={styles.ratingVal}>{point.rating || '4.8'}</span>
                </div>
                <span className={styles.reviewCount}>({point.reviewCount || '1,280'} đánh giá)</span>
              </div>
            </div>
          </div>
        </div>

        <div className={styles.panelBody}>
          <div className={styles.quickMetrics}>
            {point.estimatedCost !== undefined && point.estimatedCost >= 0 && (
              <div className={styles.metricCard}>
                <div className={`${styles.iconBox} ${styles.emerald}`}>
                  <Coins size={22} weight="duotone" />
                </div>
                <div className={styles.metricInfo}>
                  <span className={styles.label}>Ngân sách</span>
                  <span className={styles.value}>
                    {point.estimatedCost === 0 ? 'Miễn phí' : `${point.estimatedCost.toLocaleString()}₫`}
                  </span>
                </div>
              </div>
            )}
            <div className={styles.metricCard}>
              <div className={`${styles.iconBox} ${styles.blue}`}>
                <Clock size={22} weight="duotone" />
              </div>
              <div className={styles.metricInfo}>
                <span className={styles.label}>Thời gian</span>
                <span className={styles.value}>{point.time}{point.endTime ? ` - ${point.endTime}` : ''}</span>
              </div>
            </div>
            {point.durationMinutes && (
              <div className={styles.metricCard}>
                <div className={`${styles.iconBox} ${styles.purple}`}>
                  <Hourglass size={22} weight="duotone" />
                </div>
                <div className={styles.metricInfo}>
                  <span className={styles.label}>Thời lượng</span>
                  <span className={styles.value}>
                    {point.durationMinutes >= 60 
                      ? `${Math.floor(point.durationMinutes / 60)}h${point.durationMinutes % 60 > 0 ? ` ${point.durationMinutes % 60}m` : ''}`
                      : `${point.durationMinutes} phút`}
                  </span>
                </div>
              </div>
            )}
            <div className={styles.metricCard}>
              <div className={`${styles.iconBox} ${styles.orange}`}>
                <MapPin size={22} weight="duotone" />
              </div>
              <div className={styles.metricInfo}>
                <span className={styles.label}>Vị trí</span>
                <span className={styles.value}>{point.address || 'Đang cập nhật...'}</span>
              </div>
            </div>
          </div>

          <div className={styles.actionRow}>
            <button className={styles.mainAction} onClick={handleOpenNavigation}>
              <NavigationArrow size={22} weight="fill" />
              <span>Chỉ đường</span>
            </button>
            <button className={`${styles.aiAction} ${isSpeaking ? styles.pulse : ''}`} onClick={handleTTS}>
              {isSpeaking ? <Waveform size={22} weight="bold" /> : <Sparkle size={22} weight="fill" />}
              <span>{isSpeaking ? 'Đang đọc...' : 'Nghe AI mô tả'}</span>
            </button>
          </div>

          <div className={styles.detailsContainer}>
            <div className={styles.tabHeader}>
              <button 
                className={activeTab === 'info' ? styles.tabActive : styles.tabItem}
                onClick={() => setActiveTab('info')}
              >
                <Info size={18} weight={activeTab === 'info' ? "fill" : "bold"} />
                Giới thiệu
              </button>
              <button 
                className={activeTab === 'reviews' ? styles.tabActive : styles.tabItem}
                onClick={() => setActiveTab('reviews')}
              >
                <ChatCircleText size={18} weight={activeTab === 'reviews' ? "fill" : "bold"} />
                Đánh giá
              </button>
              <button 
                className={activeTab === 'nearby' ? styles.tabActive : styles.tabItem}
                onClick={() => setActiveTab('nearby')}
              >
                <MapTrifold size={18} weight={activeTab === 'nearby' ? "fill" : "bold"} />
                Dịch vụ lân cận
              </button>
            </div>
            
            <div className={styles.tabContent}>
              {activeTab === 'info' && (
                <>
                  <div className={styles.descriptionCard}>
                    {renderDescription(point.description || dynamicDesc)}
                    {!point.description && !dynamicDesc && (
                      <div className={styles.emptyState}>
                        <CircleNotch className={styles.spin} size={32} />
                        <p>AI đang tổng hợp dữ liệu...</p>
                      </div>
                    )}
                  </div>

                  {(point.tips || dynamicTips.length > 0) && (
                    <div className={styles.aiInsightCard}>
                      <div className={styles.insightHeader}>
                        <div className={styles.sparkleIcon}><Sparkle size={20} weight="fill" /></div>
                        <span>Lời khuyên từ LocalGo AI</span>
                      </div>
                      <div className={styles.insightContent}>
                        {((Array.isArray(point.tips) && point.tips.length > 0 && !point.tips[0].includes("Chỗ nghỉ chân")) || (typeof point.tips === 'string' && !point.tips.includes("Chỗ nghỉ chân"))) ? (
                          <ul className={styles.tipList}>
                            {(Array.isArray(point.tips) ? point.tips : [point.tips]).map((tip, idx) => {
                              const icons = [
                                <Buildings size={18} weight="duotone" />,
                                <Camera size={18} weight="duotone" />,
                                <Lightbulb size={18} weight="duotone" />,
                                <Compass size={18} weight="duotone" />
                              ];
                              return (
                                <li key={idx}>
                                  <div className={styles.tipIcon}>{icons[idx % icons.length]}</div>
                                  <span>{tip}</span>
                                </li>
                              );
                            })}
                          </ul>
                        ) : dynamicTips.length > 0 ? (
                          <ul className={styles.tipList}>
                            {dynamicTips.map((tip, idx) => {
                              const icons = [
                                <Buildings size={18} weight="duotone" />,
                                <Camera size={18} weight="duotone" />,
                                <Lightbulb size={18} weight="duotone" />,
                                <Compass size={18} weight="duotone" />
                              ];
                              return (
                                <li key={idx}>
                                  <div className={styles.tipIcon}>{icons[idx % icons.length]}</div>
                                  <span>{tip}</span>
                                </li>
                              );
                            })}
                          </ul>
                        ) : (
                          <p>{point.tips || "Đang tổng hợp lời khuyên từ AI..."}</p>
                        )}
                      </div>
                    </div>
                  )}

                  <div className={styles.gallerySection}>
                    <div className={styles.sectionHeader}>
                      <ImageSquare size={20} weight="bold" />
                      <span>Hình ảnh thực tế</span>
                    </div>
                    {(point.galleryImages && point.galleryImages.length > 0) ? (
                      <div className={styles.galleryGrid}>
                        {point.galleryImages.map((img, idx) => (
                          <div 
                            key={idx} 
                            className={styles.galleryItem}
                            style={{ backgroundImage: `url(${img})` }}
                            onClick={() => window.open(img, '_blank')}
                          >
                            <div className={styles.galleryOverlay}>
                              <NavigationArrow size={24} weight="fill" />
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (dynamicImages && dynamicImages.length > 0) ? (
                      <div className={styles.galleryGrid}>
                        {dynamicImages.map((img, idx) => (
                          <div 
                            key={idx} 
                            className={styles.galleryItem}
                            style={{ backgroundImage: `url(${img})` }}
                            onClick={() => window.open(img, '_blank')}
                          >
                            <div className={styles.galleryOverlay}>
                              <NavigationArrow size={24} weight="fill" />
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className={styles.emptyGallery}>
                        {isLoadingEnhancements ? (
                          <>
                            <CircleNotch className={styles.spin} size={40} />
                            <span>Đang tìm kiếm hình ảnh thực tế...</span>
                          </>
                        ) : (
                          <>
                            <ImageSquare size={40} weight="duotone" />
                            <span>Chưa có hình ảnh nào</span>
                          </>
                        )}
                      </div>
                    )}
                  </div>
                </>
              )}

              {activeTab === 'reviews' && (
                <div className={styles.reviewsList}>
                  {isLoadingReviews ? (
                    <div className={styles.loadingBox}>
                      <CircleNotch className={styles.spin} size={24} />
                      <span>Đang tải đánh giá...</span>
                    </div>
                  ) : reviews.length > 0 ? (
                    reviews.map((rev) => (
                      <div key={rev.id} className={styles.reviewItem}>
                        <div className={styles.reviewHeader}>
                          <img src={rev.userImage || "https://ui-avatars.com/api/?name=" + rev.userName} alt={rev.userName} />
                          <div className={styles.reviewUser}>
                            <span className={styles.name}>{rev.userName}</span>
                            <div className={styles.stars}>
                              {[...Array(5)].map((_, i) => (
                                <Star key={i} size={12} weight="fill" color={i < rev.rating ? "#FFD700" : "#e2e8f0"} />
                              ))}
                              <span className={styles.date}>{new Date(rev.createdAt).toLocaleDateString('vi-VN')}</span>
                            </div>
                          </div>
                        </div>
                        <p className={styles.comment}>{rev.comment}</p>
                        {rev.images && rev.images.length > 0 && (
                          <div className={styles.reviewImages}>
                            {rev.images.map((img, i) => (
                              <img key={i} src={img} alt="review" onClick={() => window.open(img, '_blank')} />
                            ))}
                          </div>
                        )}
                      </div>
                    ))
                  ) : (
                    <div className={styles.emptyReviews}>
                      <ChatCircleText size={48} weight="duotone" />
                      <p>Chưa có đánh giá nào cho địa điểm này</p>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'nearby' && (
                <div className={styles.nearbyServices}>
                  {isLoadingNearby ? (
                    <div className={styles.loadingBox}>
                      <CircleNotch className={styles.spin} size={24} />
                      <span>Đang tìm dịch vụ lân cận...</span>
                    </div>
                  ) : nearbyServices.length > 0 ? (
                    <div className={styles.servicesGrid}>
                      {nearbyServices.map((svc) => (
                        <div key={svc.id} className={styles.serviceItem}>
                          <div className={styles.svcImageContainer}>
                            {svc.imageUrl ? (
                              <img src={svc.imageUrl} alt={svc.serviceName} className={styles.svcImage} />
                            ) : (
                              <div className={styles.svcIconFallback}>
                                {svc.serviceType.toLowerCase().includes('atm') ? <Coins size={24} /> : 
                                 svc.serviceType.toLowerCase().includes('hospital') ? <Buildings size={24} /> :
                                 <MapPin size={24} />}
                              </div>
                            )}
                          </div>
                          <div className={styles.svcInfo}>
                            <div className={styles.svcHeader}>
                              <span className={styles.svcType}>{svc.serviceType}</span>
                              <span className={svc.status === 'ACTIVE' ? styles.statusActive : styles.statusClosed}>
                                {svc.status === 'ACTIVE' ? 'Đang mở' : 'Đóng cửa'}
                              </span>
                            </div>
                            <h4>{svc.serviceName.length > 20 && svc.serviceName.substring(0, svc.serviceName.length / 2) === svc.serviceName.substring(svc.serviceName.length / 2) 
                              ? svc.serviceName.substring(0, svc.serviceName.length / 2) 
                              : svc.serviceName}</h4>
                            <div className={styles.svcMeta}>
                              <span className={styles.distance}>
                                <MapPin size={14} weight="fill" color="#e11d48" />
                                {svc.distanceKm < 5 ? `${(svc.distanceKm * 1000).toFixed(0)} m` : `${svc.distanceKm.toFixed(0)} m`}
                              </span>
                              {svc.rating > 0 && (
                                <span className={styles.rating}>
                                  <Star size={14} weight="fill" color="#f59e0b" />
                                  {svc.rating}
                                </span>
                              )}
                            </div>
                            <p className={styles.svcAddress}>{svc.address}</p>
                            {onAddNearby && (
                              <button 
                                className={styles.svcAddBtn} 
                                onClick={(e) => { 
                                  e.stopPropagation(); 
                                  onAddNearby({
                                    id: svc.id,
                                    name: svc.serviceName,
                                    latitude: svc.latitude,
                                    longitude: svc.longitude,
                                    location: svc.location,
                                    addressDetailed: svc.address,
                                    imageUrl: svc.imageUrl,
                                    averagePrice: svc.averagePrice,
                                    rating: svc.rating,
                                    serviceType: svc.serviceType,
                                    description: svc.description || ""
                                  });
                                }}
                              >
                                <Plus size={14} weight="bold" /> Thêm
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className={styles.emptyNearby}>
                      <MapTrifold size={48} weight="duotone" />
                      <p>Không tìm thấy dịch vụ lân cận nào</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlaceDetailPanel;
