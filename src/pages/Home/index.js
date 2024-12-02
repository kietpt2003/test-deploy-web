import React, { useEffect, useState } from "react";
import HeroSection from './HeroSection';
import AOS from "aos";
import "aos/dist/aos.css";
import Products from "./Products";
import TopProducts from "./TopProducts";
import Banner from "./Banner";
import Subscribe from "./Subscribe";
import Testimonials from "./Testimonials";
import Popup from "./Popup";
import Footer from "~/components/layout/Footer";
import GadgetHistory from "../Gadgets/GadgetHistory";
import AiFeature from "./AiFeature";
import useAuth from "~/context/auth/useAuth";
import PosterBanner1 from "./Poster";
import SuggestGadgetCurrent from "./GadgetSuggestCurrent";

function Home() {
  const [orderPopup, setOrderPopup] = React.useState(false);
  const [deviceToken, setDeviceToken] = React.useState(null);
const{isAuthenticated}=useAuth();
  const handleOrderPopup = () => {
    setOrderPopup(!orderPopup);
  };
  React.useEffect(() => {
    AOS.init({
      offset: 100,
      duration: 800,
      easing: "ease-in-sine",
      delay: 100,
    });
    AOS.refresh();
  }, []);
  // useEffect(() => { // Yêu cầu quyền nhận thông báo và lấy token     
  //   onMessageListener()
  //     .then((payload) => {
  //       console.log("Foreground notification received: ", payload); // Bạn có thể hiển thị thông báo hoặc xử lý payload tại đây 
  //       alert(`New notification: ${payload.notification.title} - ${payload.notification.body}`);
  //     })
  //     .catch((err) => console.log("Failed to receive message: ", err));
  // }, []);

  return (
    <div className="bg-white dark:bg-gray-900 dark:text-white duration-200">
      <HeroSection handleOrderPopup={handleOrderPopup} />
     
      {isAuthenticated && <AiFeature />}
     <PosterBanner1/>
      <Products />
   
      <TopProducts handleOrderPopup={handleOrderPopup} />
      <Banner />
      {isAuthenticated && <SuggestGadgetCurrent />}
      {isAuthenticated && <GadgetHistory />}
      <Testimonials />

      <Popup orderPopup={orderPopup} setOrderPopup={setOrderPopup} />
    </div>
  )
}

export default Home