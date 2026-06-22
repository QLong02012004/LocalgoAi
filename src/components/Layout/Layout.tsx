import React, { useEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";
import Navbar from "./Navbar/Navbar";
import Footer from "./Footer/Footer";
import AOS from "aos";
import "aos/dist/aos.css";

const Layout: React.FC = () => {
  const location = useLocation();

  useEffect(() => {
    // Chỉ khởi tạo một lần duy nhất
    AOS.init({
      duration: 1000,
      once: true, // Chỉ chạy animation một lần khi cuộn tới
      offset: 100, // Khoảng cách từ mép màn hình trước khi bắt đầu chạy animation
    });
  }, []);

  useEffect(() => {
    // Làm mới AOS mỗi khi URL thay đổi để nhận các phần tử mới trên trang mới
    AOS.refresh();
    
    // Cuộn lên đầu trang khi chuyển trang (tăng trải nghiệm người dùng)
    window.scrollTo(0, 0);
  }, [location]);

  return (
    <div className="app-layout">
      <Navbar />
      <main>
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};

export default Layout;

