import type { AxiosResponse } from "axios";
import instance from "../utils/AxiosCustomize";
import type { NewsItem } from "../pages/News/types";
import { type BackendResponse } from "../types/backend";

export interface PageInfo {
  size: number;
  number: number;
  totalElements: number;
  totalPages: number;
}

export interface NewsResponse {
  content: NewsItem[];
  page: PageInfo;
}

// Helper to format date
const formatDate = (isoString: string) => {
  const date = new Date(isoString);
  if (isNaN(date.getTime())) return isoString;
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  return `${day} Th${month}, ${year}`;
};

export const MOCK_NEWS_LIST: NewsItem[] = [
  {
    id: 9801,
    title: "10 Địa Điểm Không Thể Bỏ Qua Khi Đến Đà Nẵng Mùa Hè 2026",
    excerpt: "Đà Nẵng không chỉ nổi tiếng với những bãi biển xanh cát trắng mà còn bởi những công trình kiến trúc kỳ vĩ bậc nhất thế giới.",
    content: `Đà Nẵng không chỉ nổi tiếng với những bãi biển xanh cát trắng mà còn bởi những công trình kiến trúc kỳ vĩ bậc nhất thế giới. Từ Cầu Vàng lơ lửng giữa mây ngàn tại Bà Nà Hills đến các hang động huyền bí tại Ngũ Hành Sơn, đây là danh sách 10 địa điểm du lịch Đà Nẵng tuyệt vời nhất mà bạn nhất định phải ghé thăm.

1. Cầu Vàng (Bà Nà Hills): Cây cầu đi bộ độc đáo được nâng đỡ bởi hai bàn tay khổng lồ, điểm check-in gây sốt toàn cầu.
2. Cầu Rồng Đà Nẵng: Chiêm ngưỡng màn phun lửa và phun nước mãn nhãn vào lúc 21h00 mỗi tối Thứ 7 và Chủ nhật.
3. Bãi biển Mỹ Khê: Tận hưởng làn nước mát lành và tham gia các hoạt động thể thao biển hấp dẫn như lướt ván, dù lượn.
4. Bán đảo Sơn Trà & Chùa Linh Ứng: Chiêm bái tượng Phật Bà Quan Âm cao 67m hướng ra biển Đông.
5. Danh thắng Ngũ Hành Sơn: Khám phá hệ thống hang động đá vôi kỳ thú và làng đá mỹ nghệ Non Nước truyền thống.`,
    image: "https://images.unsplash.com/photo-1569154941061-e231b4725ef1?auto=format&fit=crop&w=800&q=80",
    category: "Điểm đến",
    readTime: "5 phút đọc",
    isFeatured: true,
    authorName: "Nguyễn Văn Hùng",
    createdAt: "2026-05-10T08:00:00Z",
    date: "10 Th05, 2026",
    viewCount: 1420
  },
  {
    id: 9802,
    title: "Khám Phá Bản Sắc Ẩm Thực Cung Đình Huế Xưa Và Nay",
    excerpt: "Ẩm thực cung đình Huế không chỉ là món ăn ngon, đó là cả một nghệ thuật tinh túy phản ánh chiều sâu văn hóa lịch sử triều đại Nguyễn.",
    content: `Ẩm thực cung đình Huế không chỉ là món ăn ngon, đó là cả một nghệ thuật tinh túy phản ánh chiều sâu văn hóa lịch sử triều đại Nguyễn. Từ những món ăn được bày biện công phu như nem công chả phượng đến các chén chè sen thanh mát, mỗi hương vị đều là sự giao thoa hoàn hảo giữa nguyên liệu tự nhiên và tài hoa người đầu bếp.

Tại đất cố đô, nghệ thuật ẩm thực được chia làm hai dòng chính: Ẩm thực cung đình quý tộc và Ẩm thực dân gian đậm đà. Thưởng thức một bữa tiệc cung đình trong tiếng nhã nhạc êm dịu sẽ đưa du khách trở về với không gian hoàng gia lộng lẫy một thời.`,
    image: "https://images.unsplash.com/photo-1544077960-604201fe74bc?auto=format&fit=crop&w=800&q=80",
    category: "Ẩm thực",
    readTime: "4 phút đọc",
    isFeatured: false,
    authorName: "Trần Thị Lan",
    createdAt: "2026-05-12T09:30:00Z",
    date: "12 Th05, 2026",
    viewCount: 980
  },
  {
    id: 9803,
    title: "Mẹo Nhỏ Để Có Chuyến Du Lịch Hội An Tiết Kiệm Và Trọn Vẹn",
    excerpt: "Hội An luôn mang vẻ đẹp hoài cổ lãng mạn. Hãy cùng bỏ túi những kinh nghiệm du lịch tự túc tiết kiệm mà vẫn cực kỳ lý thú dưới đây.",
    content: `Hội An luôn mang vẻ đẹp hoài cổ lãng mạn. Hãy cùng bỏ túi những kinh nghiệm du lịch tự túc tiết kiệm mà vẫn cực kỳ lý thú dưới đây. Hướng dẫn chọn thời gian ghé thăm lý tưởng, cách thuê xe đạp khám phá ngõ nhỏ, thưởng thức bánh mì Phượng nổi tiếng mà không phải xếp hàng lâu.

Kinh nghiệm thuê phòng: Hãy chọn các homestay ven sông hoặc gần làng gốm Thanh Hà để vừa có mức giá mềm vừa được trải nghiệm cuộc sống thường nhật của người dân địa phương. Đừng quên thử nước mót thảo mộc trứ danh trên đường Trần Phú nhé!`,
    image: "https://images.unsplash.com/photo-1583417319070-4a69db38a482?auto=format&fit=crop&w=800&q=80",
    category: "Mẹo du lịch",
    readTime: "6 phút đọc",
    isFeatured: false,
    authorName: "Lê Minh Triết",
    createdAt: "2026-05-14T10:15:00Z",
    date: "14 Th05, 2026",
    viewCount: 1850
  },
  {
    id: 9804,
    title: "Lễ Hội Pháo Hoa Quốc Tế Đà Nẵng DIFF 2026 Có Gì Hot?",
    excerpt: "Sự kiện được mong chờ nhất mùa hè 2026 tại thành phố sông Hàn hứa hẹn đem đến những màn trình diễn ánh sáng đỉnh cao từ nhiều quốc gia.",
    content: `Sự kiện được mong chờ nhất mùa hè 2026 tại thành phố sông Hàn hứa hẹn đem đến những màn trình diễn ánh sáng đỉnh cao từ nhiều quốc gia. Lễ hội pháo hoa quốc tế DIFF chính thức quay trở lại hoành tráng hơn, hội tụ các đội bắn pháo hoa hàng đầu thế giới từ Ý, Pháp, Mỹ hứa hẹn thắp sáng bầu trời Đà Nẵng.`,
    image: "https://images.unsplash.com/photo-1533105079780-92b9be482077?auto=format&fit=crop&w=800&q=80",
    category: "Sự kiện",
    readTime: "4 phút đọc",
    isFeatured: false,
    authorName: "Phạm Hồng Phước",
    createdAt: "2026-05-15T14:20:00Z",
    date: "15 Th05, 2026",
    viewCount: 2200
  }
];

/**
 * Lấy danh sách tin tức
 */
export const getNewsList = async (page = 0, size = 100, category?: string, keyword?: string): Promise<AxiosResponse<BackendResponse<NewsResponse>>> => {
  let url = `/news?page=${page}&size=${size}`;
  
  if (keyword && keyword.trim() !== "") {
    url = `/news/search?keyword=${encodeURIComponent(keyword)}&page=${page}&size=${size}`;
  } else if (category && category !== "Tất cả") {
    url = `/news/category/${encodeURIComponent(category)}?page=${page}&size=${size}`;
  }
  
  try {
    const response = await instance.get<BackendResponse<NewsResponse>>(url);
    if (response.data && response.data.data && response.data.data.content && response.data.data.content.length > 0) {
      response.data.data.content = response.data.data.content.map(item => ({
        ...item,
        date: item.createdAt ? formatDate(item.createdAt) : "",
        image: item.image || "https://images.unsplash.com/photo-1436491865332-7a61a109c0f3?q=80&w=800"
      }));
      return response;
    }
    throw new Error("No news from BE");
  } catch {
    let filtered = MOCK_NEWS_LIST;
    if (category && category !== "Tất cả") {
      filtered = filtered.filter(n => n.category.toLowerCase().includes(category.toLowerCase()));
    }
    if (keyword && keyword.trim() !== "") {
      const kw = keyword.toLowerCase();
      filtered = filtered.filter(n => n.title.toLowerCase().includes(kw) || n.excerpt.toLowerCase().includes(kw));
    }
    return {
      status: 200,
      statusText: "OK",
      headers: {},
      config: {} as any,
      data: {
        status: 200,
        message: "Success (Mock)",
        data: {
          content: filtered,
          page: {
            size: size,
            number: page,
            totalElements: filtered.length,
            totalPages: 1
          }
        }
      }
    } as AxiosResponse<BackendResponse<NewsResponse>>;
  }
};

/**
 * Lấy danh sách tin tức nổi bật
 */
export const getFeaturedNewsList = async (page = 0, size = 5): Promise<AxiosResponse<BackendResponse<NewsResponse>>> => {
  try {
    const response = await instance.get<BackendResponse<NewsResponse>>(`/news/featured`);
    const rawData = response.data.data;
    if (rawData) {
      const content = Array.isArray(rawData) ? rawData : (rawData as any).content;
      if (Array.isArray(content) && content.length > 0) {
        const mapped = content.map(item => ({
          ...item,
          date: item.createdAt ? formatDate(item.createdAt) : "",
          image: item.image || "https://images.unsplash.com/photo-1436491865332-7a61a109c0f3?q=80&w=800"
        }));
        if (Array.isArray(rawData)) (response.data as any).data = mapped;
        else (response.data.data as any).content = mapped;
        return response;
      }
    }
    throw new Error("No featured news from BE");
  } catch {
    return {
      status: 200,
      statusText: "OK",
      headers: {},
      config: {} as any,
      data: {
        status: 200,
        message: "Success (Mock)",
        data: {
          content: MOCK_NEWS_LIST.slice(0, size),
          page: {
            size: size,
            number: page,
            totalElements: MOCK_NEWS_LIST.length,
            totalPages: 1
          }
        }
      }
    } as AxiosResponse<BackendResponse<NewsResponse>>;
  }
};

/**
 * Lấy chi tiết một tin tức
 */
export const getNewsDetail = async (id: number | string): Promise<AxiosResponse<BackendResponse<NewsItem>>> => {
  try {
    const response = await instance.get<BackendResponse<NewsItem>>(`/news/${id}`);
    if (response.data && response.data.data) {
      const item = response.data.data;
      response.data.data = {
        ...item,
        date: item.createdAt ? formatDate(item.createdAt) : "",
        image: item.image || "https://images.unsplash.com/photo-1436491865332-7a61a109c0f3?q=80&w=800"
      };
      return response;
    }
    throw new Error("No detail from BE");
  } catch {
    const found = MOCK_NEWS_LIST.find(n => String(n.id) === String(id)) || MOCK_NEWS_LIST[0];
    return {
      status: 200,
      statusText: "OK",
      headers: {},
      config: {} as any,
      data: {
        status: 200,
        message: "Success (Mock)",
        data: found
      }
    } as AxiosResponse<BackendResponse<NewsItem>>;
  }
};
