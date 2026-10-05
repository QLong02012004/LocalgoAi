import { type Destination, type NearbyService } from "./destinationService";

export const MOCK_NEARBY_SERVICES: Record<string, NearbyService[]> = {
  default: [
    {
      id: 101,
      attractionId: 9991,
      hotelId: null,
      restaurantId: null,
      provinceId: 2,
      serviceType: "RESTAURANT",
      serviceName: "Nhà hàng Buffet La Crique",
      description: "Buffet ẩm thực Âu - Á phong phú với hơn 100 món ăn tinh tế trong không gian sang trọng trên đỉnh Bà Nà.",
      address: "Quảng trường Làng Pháp, Bà Nà Hills, Đà Nẵng",
      location: "15.9970, 107.9890",
      latitude: 15.9970,
      longitude: 107.9890,
      distanceKm: 0.3,
      phoneNumber: "0905 123 456",
      openingHours: "10:30 - 15:00",
      rating: 4.8,
      reviewCount: 320,
      imageUrl: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=600&q=80",
      priceLevel: "$$",
      status: "ACTIVE"
    },
    {
      id: 102,
      attractionId: 9991,
      hotelId: null,
      restaurantId: null,
      provinceId: 2,
      serviceType: "HOTEL",
      serviceName: "Mercure Danang French Village Bana Hills",
      description: "Khách sạn 4 sao phong cách lâu đài Pháp cổ kính giữa mây trời, sở hữu bể bơi nước ấm trong nhà tuyệt đẹp.",
      address: "Bà Nà Hills, Hòa Ninh, Hòa Vang, Đà Nẵng",
      location: "15.9980, 107.9875",
      latitude: 15.9980,
      longitude: 107.9875,
      distanceKm: 0.5,
      phoneNumber: "0236 3799 888",
      openingHours: "24/24",
      rating: 4.7,
      reviewCount: 890,
      imageUrl: "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=600&q=80",
      priceLevel: "$$$",
      status: "ACTIVE"
    },
    {
      id: 103,
      attractionId: 9991,
      hotelId: null,
      restaurantId: null,
      provinceId: 2,
      serviceType: "CAFE",
      serviceName: "Rosa Coffee & Bakery Bana Hills",
      description: "Quán cà phê ngắm mây với các loại bánh ngọt Pháp tươi mới mỗi ngày và cà phê thơm ngon.",
      address: "Ga Morin, Bà Nà Hills, Đà Nẵng",
      location: "15.9965, 107.9895",
      latitude: 15.9965,
      longitude: 107.9895,
      distanceKm: 0.2,
      phoneNumber: "0905 987 654",
      openingHours: "08:00 - 18:00",
      rating: 4.6,
      reviewCount: 210,
      imageUrl: "https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?auto=format&fit=crop&w=600&q=80",
      priceLevel: "$",
      status: "ACTIVE"
    },
    {
      id: 104,
      attractionId: 9991,
      hotelId: null,
      restaurantId: null,
      provinceId: 2,
      serviceType: "SHOP",
      serviceName: "Cửa hàng Lưu niệm Cham Stone",
      description: "Quà lưu niệm thủ công mỹ nghệ tinh xảo, áo thun kỷ niệm và đặc sản Đà Nẵng chính gốc.",
      address: "Làng Pháp, Bà Nà Hills, Đà Nẵng",
      location: "15.9972, 107.9880",
      latitude: 15.9972,
      longitude: 107.9880,
      distanceKm: 0.4,
      phoneNumber: "0903 456 789",
      openingHours: "08:30 - 17:30",
      rating: 4.5,
      reviewCount: 95,
      imageUrl: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=600&q=80",
      priceLevel: "$$",
      status: "ACTIVE"
    }
  ]
};

export const MOCK_DESTINATIONS_DATA: Record<string, Destination> = {
  // 1. CẦU VÀNG - BÀ NÀ HILLS (id: 9991 hoặc 1)
  "9991": {
    id: 9991,
    name: "Cầu Vàng - Bà Nà Hills",
    location: "Hòa Phú, Hòa Vang, Thành phố Đà Nẵng",
    heroImage: "https://images.unsplash.com/photo-1569154941061-e231b4725ef1?auto=format&fit=crop&w=1600&q=80",
    rating: "4.9",
    reviews: "3,520",
    distance: "25km từ trung tâm",
    price: "850.000đ",
    time: "4 - 6 giờ",
    category: "Địa điểm tham quan",
    description: "Cầu Vàng tọa lạc tại vườn Thiên Thai thuộc quần thể nghỉ dưỡng Sun World Ba Na Hills Đà Nẵng, nằm ở độ cao 1.414m so với mực nước biển. Cây cầu có thiết kế độc nhất vô nhị với đôi bàn tay khổng lồ bằng đá rêu phong nâng đỡ dải lụa vàng óng ả vắt ngang qua mây trời, mở ra tầm nhìn bao quát toàn cảnh núi rừng hùng vĩ của xứ Đà. Được các tạp chí hàng đầu thế giới như TIME, CNN ca ngợi là một trong những kỳ quan kiến trúc thế giới thế kỷ 21.",
    gallery: [
      "https://images.unsplash.com/photo-1569154941061-e231b4725ef1?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1552465011-b4e21bf6e79a?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1506929562872-bb421503ef21?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1528127269322-539801943592?auto=format&fit=crop&w=1200&q=80"
    ],
    services: [
      {
        id: 1,
        type: "Khách sạn",
        name: "Mercure French Village",
        location: "Bà Nà Hills",
        price: "2.100.000đ",
        unit: "/đêm",
        rating: 4.8,
        image: "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=600&q=80",
        buttonText: "Đặt phòng"
      },
      {
        id: 2,
        type: "Nhà hàng",
        name: "Buffet La Crique",
        location: "Làng Pháp",
        price: "350.000đ",
        unit: "/khách",
        rating: 4.7,
        image: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=600&q=80",
        buttonText: "Xem thực đơn"
      }
    ],
    reviewsData: {
      average: 4.9,
      total: 3520,
      breakdown: [
        { stars: 5, percentage: 88 },
        { stars: 4, percentage: 9 },
        { stars: 3, percentage: 2 },
        { stars: 2, percentage: 1 },
        { stars: 1, percentage: 0 }
      ],
      list: [
        {
          user: "Nguyễn Hoàng Nam",
          avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=120&q=80",
          rating: 5,
          date: "15/05/2026",
          tag: "Đã trải nghiệm",
          content: "Cảnh tượng ở Cầu Vàng buổi sớm lúc sương mờ tan dần đẹp như chốn bồng lai tiên cảnh. Nên đi sớm trước 8h sáng để chụp ảnh vắng người và ngắm trọn vẹn vẻ đẹp nơi đây!",
          images: [
            "https://images.unsplash.com/photo-1569154941061-e231b4725ef1?auto=format&fit=crop&w=400&q=80"
          ]
        },
        {
          user: "Trần Minh Thư",
          avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=120&q=80",
          rating: 5,
          date: "10/05/2026",
          tag: "Chuyến đi gia đình",
          content: "Cáp treo lên đỉnh núi rất hiện đại và êm ái. Không khí mát mẻ, dịch vụ ăn uống và vui chơi rất chuyên nghiệp, các bé nhà mình rất thích lâu đài Mặt Trăng!",
        }
      ]
    },
    travelTips: [
      {
        icon: "Camera",
        title: "Thời điểm chụp ảnh đẹp nhất",
        content: "Nên có mặt tại Cầu Vàng vào khung giờ 07:00 - 08:30 sáng hoặc 16:30 - 17:30 chiều để đón ánh nắng vàng và không bị đông đúc."
      },
      {
        icon: "CoatCheck",
        title: "Trang phục phù hợp",
        content: "Nhiệt độ trên đỉnh núi Bà Nà thấp hơn trung tâm thành phố từ 6 - 8 độ C, nên mang theo áo khoác mỏng hoặc khăn choàng nhẹ."
      },
      {
        icon: "Ticket",
        title: "Đặt vé trước",
        content: "Nên mua vé cáp treo online trước để quét mã QR qua cổng nhanh chóng, không phải xếp hàng chờ đợi tại quầy vé."
      }
    ],
    weatherCurrent: { temp: 22, description: "Mát mẻ, nắng nhẹ", icon: "CloudSun" },
    travelTimeFromHanoi: "1h20p bay + 45p xe buýt",
    coordinates: { lat: 15.9950, lng: 107.9940 },
    locationRaw: "15.9950, 107.9940",
    mapScreenshot: "",
    quickInfo: [
      { id: 1, label: "Trạng thái", value: "Đang mở cửa (07:30 - 21:00)" },
      { id: 2, label: "Độ cao", value: "1.414m so với mực nước biển" },
      { id: 3, label: "Chiều dài cầu", value: "150 mét gồm 8 nhịp" },
      { id: 4, label: "Giá vé cáp treo", value: "850.000đ (Người lớn)" }
    ],
    provinceId: 2
  },

  // 2. PHỐ CỔ HỘI AN (id: 8881 hoặc 9993)
  "8881": {
    id: 8881,
    name: "Phố Cổ Hội An",
    location: "Minh An, Hội An, Tỉnh Quảng Nam",
    heroImage: "https://images.unsplash.com/photo-1583417319070-4a69db38a482?auto=format&fit=crop&w=1600&q=80",
    rating: "4.9",
    reviews: "4,200",
    distance: "30km từ Đà Nẵng",
    price: "Miễn phí",
    time: "1 ngày",
    category: "Di sản văn hóa",
    description: "Phố cổ Hội An là một đô thị cổ nằm ở hạ lưu sông Thu Bồn, từng là thương cảng quốc tế sầm uất bậc nhất Đông Nam Á từ thế kỷ 16 đến thế kỷ 19. Nơi đây bảo tồn gần như nguyên vẹn hơn 1.000 di tích kiến trúc gồm nhà cổ mái ngói rêu phong, hội quán người Hoa, chùa Cầu và các ngõ nhỏ quét vôi vàng đặc trưng. Khi đêm về, phố cổ rực rỡ với hàng nghìn chiếc đèn lồng lung linh soi bóng dòng sông Hoài thơ mộng.",
    gallery: [
      "https://images.unsplash.com/photo-1583417319070-4a69db38a482?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1569718212165-3a8278d5f624?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1540541338287-41700207dee6?auto=format&fit=crop&w=1200&q=80"
    ],
    services: [
      {
        id: 1,
        type: "Khách sạn",
        name: "Anantara Hoi An Resort",
        location: "1 Phạm Hồng Thái, Hội An",
        price: "3.200.000đ",
        unit: "/đêm",
        rating: 4.8,
        image: "https://images.unsplash.com/photo-1540541338287-41700207dee6?auto=format&fit=crop&w=600&q=80",
        buttonText: "Đặt phòng"
      },
      {
        id: 2,
        type: "Nhà hàng",
        name: "Bánh Mì Phượng",
        location: "2B Phan Chu Trinh, Hội An",
        price: "40.000đ",
        unit: "/suất",
        rating: 4.7,
        image: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=600&q=80",
        buttonText: "Xem quán"
      }
    ],
    reviewsData: {
      average: 4.9,
      total: 4200,
      breakdown: [
        { stars: 5, percentage: 92 },
        { stars: 4, percentage: 6 },
        { stars: 3, percentage: 2 },
        { stars: 2, percentage: 0 },
        { stars: 1, percentage: 0 }
      ],
      list: [
        {
          user: "Lê Thanh Hương",
          avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=120&q=80",
          rating: 5,
          date: "12/05/2026",
          tag: "Đã trải nghiệm",
          content: "Đi thuyền thả hoa đăng trên sông Hoài vào buổi tối là một trải nghiệm không thể nào quên. Đồ ăn Hội An như Cao Lầu, Mì Quảng, Bánh bao bánh vạc ngon tuyệt vời!",
        }
      ]
    },
    travelTips: [
      {
        icon: "Bicycle",
        title: "Thuê xe đạp dạo phố",
        content: "Nên thuê xe đạp (chỉ 30.000đ/ngày) để khám phá các con hẻm nhỏ tĩnh lặng và đạp ra cánh đồng lúa Cẩm Châu."
      },
      {
        icon: "Clock",
        title: "Giờ phố đi bộ",
        content: "Phố cổ cấm xe máy từ 09:00 - 11:00 và 15:00 - 21:30 hàng ngày, thời điểm lý tưởng nhất để tản bộ."
      }
    ],
    weatherCurrent: { temp: 29, description: "Nắng ráo, gió nhẹ", icon: "Sun" },
    travelTimeFromHanoi: "1h20p bay + 40p taxi",
    coordinates: { lat: 15.8794, lng: 108.3282 },
    locationRaw: "15.8794, 108.3282",
    mapScreenshot: "",
    quickInfo: [
      { id: 1, label: "Trạng thái", value: "Mở cửa tự do 24/7" },
      { id: 2, label: "Di sản thế giới", value: "UNESCO công nhận từ năm 1999" },
      { id: 3, label: "Đặc sản", value: "Cao Lầu, Cơm gà, Bánh mì, Nước Mót" },
      { id: 4, label: "Vé tham quan di tích", value: "120.000đ / 5 điểm di tích" }
    ],
    provinceId: 3
  },

  // 3. ĐẠI NỘI HUẾ (id: 7771 hoặc 9992)
  "7771": {
    id: 7771,
    name: "Đại Nội & Kinh Thành Huế",
    location: "Thuận Thành, Thành phố Huế, Tỉnh Thừa Thiên Huế",
    heroImage: "https://images.unsplash.com/photo-1544077960-604201fe74bc?auto=format&fit=crop&w=1600&q=80",
    rating: "4.8",
    reviews: "2,900",
    distance: "Trung tâm thành phố Huế",
    price: "200.000đ",
    time: "3 - 4 giờ",
    category: "Di tích lịch sử",
    description: "Đại Nội Huế là trung tâm chính trị, hành chính của triều đình nhà Nguyễn - triều đại phong kiến cuối cùng trong lịch sử Việt Nam (1802 - 1945). Quần thể di tích bao gồm Hoàng Thành và Tử Cấm Thành với hàng trăm công trình cung điện nguy nga tráng lệ như Ngọ Môn, Điện Thái Hòa, Thế Miếu, Cung Diên Thọ... mang đậm nét tinh hoa nghệ thuật kiến trúc cung đình phương Đông.",
    gallery: [
      "https://images.unsplash.com/photo-1544077960-604201fe74bc?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1508672019048-805b876b67e2?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1528127269322-539801943592?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=80"
    ],
    services: [
      {
        id: 1,
        type: "Khách sạn",
        name: "Silk Path Grand Hue Hotel",
        location: "02 Lê Lợi, Huế",
        price: "2.100.000đ",
        unit: "/đêm",
        rating: 4.8,
        image: "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=600&q=80",
        buttonText: "Đặt phòng"
      }
    ],
    reviewsData: {
      average: 4.8,
      total: 2900,
      breakdown: [
        { stars: 5, percentage: 85 },
        { stars: 4, percentage: 12 },
        { stars: 3, percentage: 3 },
        { stars: 2, percentage: 0 },
        { stars: 1, percentage: 0 }
      ],
      list: [
        {
          user: "Phạm Quốc Bảo",
          avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=120&q=80",
          rating: 5,
          date: "14/05/2026",
          tag: "Khách du lịch",
          content: "Di sản cung đình đồ sộ và uy nghiêm. Cảm giác mặc trang phục cổ trang đi dạo trong Đại Nội chụp hình rất ấn tượng!",
        }
      ]
    },
    travelTips: [
      {
        icon: "Shirt",
        title: "Thuê Cổ Phục Việt",
        content: "Ngay cổng Ngọ Môn có nhiều tiệm cho thuê trang phục Nhật Bình, Áo Tấc cung đình để chụp ảnh kỷ niệm."
      },
      {
        icon: "Sun",
        title: "Tránh nắng trưa",
        content: "Khuôn viên Đại Nội rất rộng và ít bóng râm, nên mang theo ô/nón và khởi hành từ đầu giờ sáng."
      }
    ],
    weatherCurrent: { temp: 28, description: "Nắng nhẹ, gió mát", icon: "CloudSun" },
    travelTimeFromHanoi: "1h15p bay",
    coordinates: { lat: 16.4697, lng: 107.5786 },
    locationRaw: "16.4697, 107.5786",
    mapScreenshot: "",
    quickInfo: [
      { id: 1, label: "Giờ mở cửa", value: "07:00 - 17:30 hàng ngày" },
      { id: 2, label: "Giá vé", value: "200.000đ / người lớn" },
      { id: 3, label: "Di sản thế giới", value: "UNESCO công nhận năm 1993" }
    ],
    provinceId: 1
  },

  // 4. BÁN ĐẢO SƠN TRÀ & CHÙA LINH ỨNG (id: 9995)
  "9995": {
    id: 9995,
    name: "Bán Đảo Sơn Trà & Chùa Linh Ứng",
    location: "Bãi Bụt, Bán Đảo Sơn Trà, Thành phố Đà Nẵng",
    heroImage: "https://images.unsplash.com/photo-1528127269322-539801943592?auto=format&fit=crop&w=1600&q=80",
    rating: "4.9",
    reviews: "2,200",
    distance: "10km từ trung tâm thành phố",
    price: "Miễn phí",
    time: "3 - 5 giờ",
    category: "Địa điểm tâm linh & Thiên nhiên",
    description: "Bán đảo Sơn Trà được mệnh danh là 'lá phổi xanh' và viên ngọc quý của thành phố Đà Nẵng với hệ sinh thái rừng nguyên sinh tiếp giáp biển độc nhất vô nhị. Nổi bật tại đây là Chùa Linh Ứng Bãi Bụt - ngôi chùa lớn và linh thiêng bậc nhất xứ Đà, nơi tọa lạc tượng Phật Bà Quan Thế Âm cao 67m hướng mắt hiền từ nhìn ra biển Đông. Từ bán đảo, du khách có thể ngắm toàn cảnh vịnh Đà Nẵng tuyệt mỹ, khám phá Đỉnh Bàn Cờ, Cây đa ngàn năm và chiêm ngưỡng loài Voọc chà vá chân nâu quý hiếm.",
    gallery: [
      "https://images.unsplash.com/photo-1528127269322-539801943592?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1559592490-67245a494447?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80"
    ],
    services: [
      {
        id: 1,
        type: "Khách sạn",
        name: "InterContinental Danang Sun Peninsula Resort",
        location: "Bãi Bắc, Sơn Trà",
        price: "7.500.000đ",
        unit: "/đêm",
        rating: 4.9,
        image: "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=600&q=80",
        buttonText: "Đặt phòng"
      },
      {
        id: 2,
        type: "Nhà hàng",
        name: "Hải Sản Bé Mặn Sơn Trà",
        location: "Lô 11 Võ Nguyên Giáp, Sơn Trà",
        price: "250.000đ",
        unit: "/khách",
        rating: 4.8,
        image: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=600&q=80",
        buttonText: "Xem thực đơn"
      }
    ],
    reviewsData: {
      average: 4.9,
      total: 2200,
      breakdown: [
        { stars: 5, percentage: 90 },
        { stars: 4, percentage: 8 },
        { stars: 3, percentage: 2 },
        { stars: 2, percentage: 0 },
        { stars: 1, percentage: 0 }
      ],
      list: [
        {
          user: "Đỗ Đức Anh",
          avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=120&q=80",
          rating: 5,
          date: "14/05/2026",
          tag: "Đã trải nghiệm",
          content: "Chùa Linh Ứng rất thanh tịnh, tượng Phật Bà đồ sộ hướng ra biển cả bao la đem lại cảm giác bình an lạ kỳ. Đường đèo ven biển Sơn Trà rất đẹp và thoáng đãng!",
          images: [
            "https://images.unsplash.com/photo-1528127269322-539801943592?auto=format&fit=crop&w=400&q=80"
          ]
        },
        {
          user: "Mai Thu Trang",
          avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80",
          rating: 5,
          date: "08/05/2026",
          tag: "Du lịch tự túc",
          content: "Đi xe máy lên Đỉnh Bàn Cờ lúc chiều tà ngắm hoàng hôn buông xuống thành phố Đà Nẵng là khoảnh khắc tuyệt mỹ nhất chuyến đi!",
        }
      ]
    },
    travelTips: [
      {
        icon: "Car",
        title: "Phương tiện di chuyển",
        content: "Nên sử dụng xe số hoặc thuê xe ô tô có tài xế khi lên các đoạn đèo dốc quanh co ở Đỉnh Bàn Cờ và Hải Đăng Sơn Trà."
      },
      {
        icon: "Sun",
        title: "Thời điểm ngắm cảnh",
        content: "Buổi sáng sớm (06:00 - 08:30) hoặc chiều tà (16:30 - 18:00) là lúc thời tiết mát mẻ nhất và dễ bắt gặp đàn Voọc chà vá."
      },
      {
        icon: "ShieldCheck",
        title: "Quy định tham quan",
        content: "Trang phục lịch sự khi viếng Chùa Linh Ứng, tuyệt đối không cho khỉ và động vật hoang dã ăn thức ăn nhân tạo."
      }
    ],
    weatherCurrent: { temp: 27, description: "Gió biển trong lành, nắng nhẹ", icon: "CloudSun" },
    travelTimeFromHanoi: "1h20p bay + 20p taxi",
    coordinates: { lat: 16.1000, lng: 108.2770 },
    locationRaw: "16.1000, 108.2770",
    mapScreenshot: "",
    quickInfo: [
      { id: 1, label: "Trạng thái", value: "Mở cửa tự do (06:00 - 18:30)" },
      { id: 2, label: "Chiều cao tượng", value: "67m (Tương đương tòa nhà 30 tầng)" },
      { id: 3, label: "Vé tham quan", value: "Miễn phí vé vào cổng" },
      { id: 4, label: "Hệ sinh thái", value: "Khu bảo tồn thiên nhiên quốc gia" }
    ],
    provinceId: 2
  }
};

/**
 * Hàm lấy hoặc tự động tạo dữ liệu chi tiết cho bất kỳ ID nào
 */
export const getMockDestinationDetail = (id: string | number, type: "attraction" | "hotel" | "restaurant" = "attraction"): Destination => {
  const idStr = String(id);
  
  if (MOCK_DESTINATIONS_DATA[idStr]) {
    return MOCK_DESTINATIONS_DATA[idStr];
  }

  // Alias maps for common IDs
  if (idStr === "1" || idStr === "9991") return MOCK_DESTINATIONS_DATA["9991"];
  if (idStr === "2" || idStr === "8881" || idStr === "9993") return MOCK_DESTINATIONS_DATA["8881"];
  if (idStr === "3" || idStr === "7771" || idStr === "9992") return MOCK_DESTINATIONS_DATA["7771"];
  if (idStr === "4" || idStr === "9995") return MOCK_DESTINATIONS_DATA["9995"];

  // Generic dynamic fallback for any other ID
  const isHotel = type === "hotel";
  const isFood = type === "restaurant";

  const defaultName = isHotel 
    ? `Khách sạn Nghỉ Dưỡng ${idStr}` 
    : isFood 
    ? `Nhà hàng Đặc sản ${idStr}` 
    : `Địa điểm Du lịch Nổi bật #${idStr}`;

  const defaultCategory = isHotel ? "Khách sạn & Resort" : isFood ? "Ẩm thực địa phương" : "Địa điểm tham quan";
  const defaultPrice = isHotel ? "1.500.000đ / đêm" : isFood ? "150.000đ / người" : "Miễn phí";

  const defaultHero = isHotel 
    ? "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1600&q=80"
    : isFood 
    ? "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=1600&q=80"
    : "https://images.unsplash.com/photo-1569154941061-e231b4725ef1?auto=format&fit=crop&w=1600&q=80";

  return {
    id: id,
    name: defaultName,
    location: "Thành phố Đà Nẵng, Việt Nam",
    heroImage: defaultHero,
    rating: "4.8",
    reviews: "1,250",
    distance: "Trung tâm",
    price: defaultPrice,
    time: "2 - 3 giờ",
    category: defaultCategory,
    description: `Khám phá và trải nghiệm dịch vụ chất lượng cao tại ${defaultName}. Tọa lạc tại vị trí đắc địa, thuận tiện di chuyển tới các danh lam thắng cảnh lân cận và các trung tâm vui chơi giải trí hàng đầu.`,
    gallery: [
      defaultHero,
      "https://images.unsplash.com/photo-1583417319070-4a69db38a482?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1544077960-604201fe74bc?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80"
    ],
    services: [
      {
        id: 1,
        type: "Khách sạn",
        name: "Khách sạn lân cận",
        location: "Đà Nẵng",
        price: "1.200.000đ",
        unit: "/đêm",
        rating: 4.8,
        image: "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=600&q=80",
        buttonText: "Đặt phòng"
      }
    ],
    reviewsData: {
      average: 4.8,
      total: 1250,
      breakdown: [
        { stars: 5, percentage: 80 },
        { stars: 4, percentage: 15 },
        { stars: 3, percentage: 5 },
        { stars: 2, percentage: 0 },
        { stars: 1, percentage: 0 }
      ],
      list: [
        {
          user: "Nguyễn Văn An",
          avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=120&q=80",
          rating: 5,
          date: "12/05/2026",
          tag: "Đã trải nghiệm",
          content: "Dịch vụ tuyệt vời, không gian đẹp và sạch sẽ, nhân viên phục vụ tận tình chu đáo. Chắc chắn sẽ quay lại lần sau!"
        }
      ]
    },
    travelTips: [
      {
        icon: "MapPin",
        title: "Vị trí thuận tiện",
        content: "Dễ dàng tìm kiếm trên Google Maps và thuận tiện gọi taxi, xe công nghệ di chuyển."
      },
      {
        icon: "Clock",
        title: "Thời gian phục vụ",
        content: "Nên đến vào khung giờ sáng sớm hoặc xế chiều để tận hưởng dịch vụ thoải mái nhất."
      }
    ],
    weatherCurrent: { temp: 28, description: "Trời nắng đẹp", icon: "Sun" },
    travelTimeFromHanoi: "1h20p",
    coordinates: { lat: 16.0544, lng: 108.2022 },
    locationRaw: "16.0544, 108.2022",
    mapScreenshot: "",
    quickInfo: [
      { id: 1, label: "Trạng thái", value: "Đang mở cửa" },
      { id: 2, label: "Đánh giá", value: "4.8 / 5.0 (Rất tốt)" },
      { id: 3, label: "Mức giá", value: defaultPrice }
    ],
    provinceId: 2
  };
};
