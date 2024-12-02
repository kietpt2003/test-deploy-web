import React, { Fragment } from "react";
import { Routes, Route } from "react-router-dom";

import Home from "./pages/Home";
import SignUp from "./pages/SignUp/SignUpPage";
import Verify from "./pages/SignUp/Verify";
import LogIn from "./pages/SignIn/LoginPage";
import FavoritePage from "./pages/Favorite/FavoritePage";
import ProfilePage from "./pages/Profile/ProfilePage";
import MainLayout from "./components/layout/MainLayout";
import AuthLayout from "./components/layout/AuthLayout";
import SellerLayout from "./components/layout/SellerLayout";
import ManagerLayout from "./components/layout/ManagerLayout";
import Dashboardview from "./pages/Manager/Dashboardview";
import Main from "./pages/Manager/Main";
import AuthRoute from "./components/auth/AuthRoute";
import RoleBaseRoute from "./components/auth/RoleBaseRoute";
import DetailGadgetPage from "./pages/DetailGadget/DetailGadgetPage";
import SpecificationKeyPage from "./pages/Manager/SpecificationKey/SpecificationKeyPage";
import CategoryPage from "./pages/Manager/Category/CategoryPage";
import BrandPage from "./pages/Manager/Brand/brand";
import SellerApplication from "./pages/Seller/SellerApplication";
import HistorySellerApplication from "./pages/Seller/HistorySellerApplication";
import SellerApplicationLayout from "./components/layout/SellerApplicationLayout";
import ManageSellerApplicationPage from "./pages/Manager/SellerApplication/ManageSellerApplication";
import ForgotPassword from "./pages/ForgotPWD/ForgotPWDPage";
import DepositHistory from "./pages/Wallet/DepositHistory";
import RefundHistory from "./pages/Wallet/RefundHistory";
import PaymentHistory from "./pages/Wallet/PaymentHistory";
import WalletLayout from "./pages/Wallet/WalletLayout";
import DepositSuccess from "./pages/Wallet/DepositSuccess";
import DepositFail from "./pages/Wallet/DepositFail";
import BrandGadgetPage from "./pages/Gadgets/Gadget";
import CategoryGadgetPage from "./pages/Gadgets/GadgetPage";
import SellerHeader from "./pages/Seller/SellerHeader";
import SellerProfilePage from "./pages/Seller/SellerProfile";
import CartPage from "./pages/Cart/cart";
import OrderHistory from "./pages/Order/Order";
import OrderHistorySeller from "./pages/Seller/Order/Order";
import SellerTransfer from "./pages/Wallet/SellerTransfer";
import Review from "./pages/Review/Review";
import ReviewPage from "./pages/Review/ReviewPage";
import NaturalLanguageSearch from "./pages/AiSearch/NaturalLanguageSearch";
import ReviewSeller from "./pages/Seller/Review/ReviewSeller";
import OrderDetail from "./pages/Order/OrderDetail";
import OrderDetailSeller from "./pages/Seller/Order/OrderDetailSeller";
import GadgetManagementPage from "./pages/Seller/Gadgets/GadgetManagementPage";
import GadgetDetailSeller from "./pages/Seller/Gadgets/GadgetDetailSeller";
import CreateGadget from "./pages/Seller/Gadgets/CreateGadget";
import UpdateGadget from "./pages/Seller/Gadgets/UpdateGadget";
import SellerPage from "./pages/SellerPage/SellerPage";
import ManageGadgetPage from "./pages/Manager/Gadget/ManageGadgetPage";
import AdminLayout from "./components/layout/AdminLayout";
import AdminPage from "./pages/Admin/AdminPage";
import SellerDashboard from "./pages/Seller/Dashboard/SellerDashboard";
import ManagerDashboard from "./pages/Manager/Dashboard/ManagerDashboard";
import AdminDashboard from "./pages/Admin/AdminDashboard";
import GadgetDetailManager from "./pages/Manager/Gadget/GadgetDetailManager";




function App() {
  return (

    <Routes>
      {/* Public Routes */}
      <Route element={<AuthLayout />}>
        <Route path='/signin' element={<LogIn />} />
        <Route path='/signup' element={<SignUp />} />
        <Route path='/verify' element={<Verify />} />
        <Route path='/forgot-pwd' element={<ForgotPassword />} />
      </Route>

      <Route element={<MainLayout />}>
        <Route path='/' element={<Home />} />
        <Route path='/gadget/detail/:name' element={<DetailGadgetPage />} />
        <Route path='/gadget/detail/:name/reviews' element={<ReviewPage />} />
        <Route path='/order/detail/:orderId' element={<OrderDetail />} />
        <Route path='/favorite' element={
          <AuthRoute>
            <RoleBaseRoute accessibleRoles={["Customer"]}>
              <FavoritePage />
            </RoleBaseRoute>
          </AuthRoute>

        } />
        <Route path='/orderHistory' element={
          <AuthRoute>
            <RoleBaseRoute accessibleRoles={["Customer"]}>
              <OrderHistory />
            </RoleBaseRoute>
          </AuthRoute>

        } />
        <Route path='/cart' element={
          <AuthRoute>
            <RoleBaseRoute accessibleRoles={["Customer"]}>
              <CartPage />
            </RoleBaseRoute>
          </AuthRoute>

        } />
        {/* <Route path="/gadgets/:category/:categoryId/:brand/:brandId" element={<BrandGadgetPage />} /> */}



        <Route path="/gadgets/:category/:brand" element={<BrandGadgetPage />} />
        <Route path="/gadgets/:category/" element={<CategoryGadgetPage />} />
        <Route path="/seller-page/:name" element={<SellerPage />} />
        <Route path='/profile' element={
          <AuthRoute>
            <RoleBaseRoute accessibleRoles={["Customer"]}>
              <ProfilePage />
            </RoleBaseRoute>
          </AuthRoute>

        } />
        <Route path='/review-gadget' element={
          <AuthRoute>
            <RoleBaseRoute accessibleRoles={["Customer"]}>
              <Review />
            </RoleBaseRoute>
          </AuthRoute>

        } />
        <Route path='/deposit-success' element={
          <AuthRoute>
            <RoleBaseRoute accessibleRoles={["Customer"]}>
              <DepositSuccess />
            </RoleBaseRoute>
          </AuthRoute>

        } />
        <Route path='/deposit-fail' element={
          <AuthRoute>
            <RoleBaseRoute accessibleRoles={["Customer"]}>
              <DepositFail />
            </RoleBaseRoute>
          </AuthRoute>

        } />

      </Route>
      {/* Search by AI */}
      <Route path="/search-by-natural-language" element={<NaturalLanguageSearch />} />
      
      {/* Seller Route */}
      <Route element={<SellerLayout />}>
        <Route path='/seller/Order-management' element={<OrderHistorySeller />} />
      </Route>

      <Route element={<SellerLayout />}>
        <Route path='/seller/transaction-history' element={<SellerTransfer />} />
      </Route>

      <Route element={<SellerLayout />}>
        <Route path='/seller/manage-reviews-gadgets' element={<ReviewSeller />} />
      </Route>

      <Route element={<SellerLayout />}>
        <Route path='/order/detail-seller/:orderId' element={<OrderDetailSeller />} />
      </Route>
      <Route element={<SellerLayout />}>
        <Route path='/gadget/detail-seller/:name' element={<GadgetDetailSeller />} />
      </Route>
      <Route element={<SellerLayout />}>
        <Route path='/all-products' element={<GadgetManagementPage />} />
      </Route>
      <Route element={<SellerLayout />}>
        <Route path='/seller/gadgets/create' element={<CreateGadget />} />
      </Route>
      <Route element={<SellerLayout />}>
        <Route path='/seller/gadgets/update/:gadgetId' element={<UpdateGadget />} />
      </Route>
      <Route element={<SellerLayout />}>
        <Route path='/seller/dashboard' element={<SellerDashboard />} />
      </Route>

      <Route path="/sellerProfile" element={
        <AuthRoute>
          <RoleBaseRoute accessibleRoles={["Seller"]}>
            <SellerHeader />
            <SellerProfilePage />
          </RoleBaseRoute>
        </AuthRoute>

      } />




      <Route element={<SellerApplicationLayout />}>
        <Route path='/seller-application' element={<SellerApplication />} />
        <Route path='/history-seller-application' element={<HistorySellerApplication />} />
      </Route>

      {/* Wallet Route */}
      <Route element={<WalletLayout />}>
        <Route path='/deposit-history' element={<DepositHistory />} />
        <Route path='/refund-history' element={<RefundHistory />} />
        <Route path='/payment-history' element={<PaymentHistory />} />
      </Route>

      {/* Manager Route */}
      <Route element={<ManagerLayout />}>
        <Route path='/dashboard' element={
          <div className="flex overflow-scroll">
            <div className="basis-[100%] border overflow-scroll h-[100vh]">
              <Dashboardview />
              <Main />
            </div>
          </div>
        } />
        <Route path='/specification-key' element={
          <SpecificationKeyPage />
        } />
        <Route path='/category' element={
          <CategoryPage />
        } />
        <Route path='/brand' element={
          <BrandPage />
        } />
        <Route path='/manage-seller-application' element={
          <ManageSellerApplicationPage />
        } />
        <Route path='/manage-gadget' element={
          <ManageGadgetPage />
        } />
          <Route path='/gadget/detail-manager/:name' element={
          <GadgetDetailManager/>
        } />
        <Route path='/manage-dashboard' element={
          <ManagerDashboard />
        } />
      </Route>

      {/* Admin Route */}
      <Route element={<AdminLayout />}>
          <Route path='/admin/manage-users' element={
         <AdminPage/>
        } />
        <Route path='/admin/dashboard' element={
         <AdminDashboard/>
        } />
      </Route>
    </Routes>

  );
}

export default App;
