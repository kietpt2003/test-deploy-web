import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import signupp from '~/assets/signupp.jpg';
import google from '~/assets/google.svg';
import useAuth from '~/context/auth/useAuth';
import { useGoogleLogin } from '@react-oauth/google';
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { requestForToken } from '~/ultis/firebase';

function SignUp() {
  const { signup, googleLogin, error } = useAuth();
  const [loading, setLoading] = useState(false);
  const [deviceToken, setDeviceToken] = useState("");
  const [user, setUser] = useState({
    fullName: "",
    password: "",
    email: "",
    role: "Customer", // Default role is Customer
    deviceToken: ""
  });
  const [showPassword, setShowPassword] = useState(false);


  useEffect(() => {
    requestForToken()
    .then((token) => {
      if (token) {
        setDeviceToken(token);
        setUser((prevUser) => ({ ...prevUser, deviceToken: token }));
      }
    });
  }, []);


  const handleChangeValue = (fieldName, value) => {
    setUser((prev) => ({
      ...prev,
      [fieldName]: value,
    }));
  };

  const googleLoginHandler = useGoogleLogin({
    onSuccess: (response) => {
      googleLogin(response.access_token);
    },
    onError: (error) => {
      console.error('Google login error:', error);
      toast.error('Google login failed. Please try again.');
    },
  });

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!user.email && !user.password && !user.fullName) {
      toast.error('Yêu cầu nhập tên, mật khẩu và email');
      return;
    }
    if (!user.email) {
      toast.error('Yêu cầu nhập email');
      return;
    }
    if (!user.password) {
      toast.error('Yêu cầu nhập mật khẩu');
      return;
    }
    if (!user.fullName) {
      toast.error('Yêu cầu nhập tên');
      return;
    }
    setLoading(true);
    try {
      await signup(user);
    } catch (err) {
      console.error('Signup error:', err);
    }
    finally {
      setLoading(false);
    }
  };

  const handleClickShowPassword = () => {
    setShowPassword((prev) => !prev);
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <ToastContainer />
      {loading && (
        <div className="fixed inset-0 bg-white bg-opacity-80 flex items-center justify-center z-50">
          <div className="w-12 h-12 border-4 border-gray-300 border-t-black rounded-full animate-spin"></div>
        </div>
      )}
      <div className="relative flex flex-col m-6 space-y-8 bg-white shadow-2xl rounded-2xl md:flex-row md:space-y-0">
        <div className="flex flex-col justify-center p-8 md:p-14">
          <span className="mb-3 text-4xl font-bold">Tạo tài khoản của bạn</span>
          <span className="font-light text-gray-400 mb-8">Đăng ký để bắt đầu!</span>

          <div className="py-4">
            <span className="text-base font-semibold text-gray-600">Tên đầy đủ</span>
            <input
              type="text"
              className="w-full p-2 border border-gray-300 rounded-md placeholder:font-light placeholder:text-gray-500"
              name="fullName"
              value={user.fullName}
              onChange={(e) => handleChangeValue("fullName", e.target.value)}
              required
            />
          </div>

          <div className="py-4">
            <span className="text-base font-semibold text-gray-600">Mật khẩu</span>
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              className="w-full p-2 border border-gray-300 rounded-md placeholder:font-light placeholder:text-gray-500 [&::-ms-reveal]:hidden [&::-ms-clear]:hidden"
              value={user.password}
              onChange={(e) => handleChangeValue("password", e.target.value)}
              required
            />
          </div>

          <div className="py-4">
            <span className="text-base font-semibold text-gray-600">Email</span>
            <input
              type="email"
              className="w-full p-2 border border-gray-300 rounded-md placeholder:font-light placeholder:text-gray-500"
              name="email"
              value={user.email}
              onChange={(e) => handleChangeValue("email", e.target.value)}
              required
            />
          </div>

          {/* New role selection */}
          <div className="py-4">
            <span className="text-base font-semibold text-gray-600">Bạn là:</span>
            <div className="flex items-center space-x-4 pt-4">
              <label>
                <input
                  type="radio"
                  name="role"
                  value="Customer"
                  checked={user.role === "Customer"}
                  onChange={(e) => handleChangeValue("role", e.target.value)}
                />
                <span className="ml-2">Khách hàng</span>
              </label>
              <label>
                <input
                  type="radio"
                  name="role"
                  value="Seller"
                  checked={user.role === "Seller"}
                  onChange={(e) => handleChangeValue("role", e.target.value)}
                />
                <span className="ml-2">Người bán</span>
              </label>
            </div>
          </div>

          <div className="flex justify-between w-full py-4">
            <div className="mr-24">
              <input
                type="checkbox"
                name="ch"
                id="ch"
                className="mr-2"
                onChange={handleClickShowPassword}
              />
              <span className="text-base font-medium text-gray-400">Hiển thị mật khẩu</span>
            </div>
          </div>

          <button
            onClick={handleSubmit}
            className="w-full p-2 mb-6 bg-black text-white border border-transparent rounded-lg shadow-sm text-base font-medium hover:bg-orange-600"
          >
            Đăng ký
          </button>

          <div className="mb-2 flex justify-center">
            <button
              onClick={googleLoginHandler}
              className="w-full border border-gray-300 text-md p-2 rounded-lg mb-6 hover:bg-black hover:text-white"
            >
              <img src={google} alt="img" className="w-6 h-6 inline mr-2" />
              Đăng nhập với Google
            </button>
          </div>

          <div className="text-center text-gray-400">
            Đã có tài khoản?
            <Link to="/signin" className="font-bold text-black hover:text-orange-500"> Đăng nhập</Link>
          </div>
        </div>

        <div className="relative">
          <img
            src={signupp}
            alt="img"
            className="w-[380px] h-full hidden rounded-r-2xl md:block object-cover"
          />
        </div>
      </div>
    </div>
  );
}

export default SignUp;
