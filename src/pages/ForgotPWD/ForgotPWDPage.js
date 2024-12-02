import React, { useState } from 'react';
import signupp from '~/assets/signupp.jpg';
import { useNavigate } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import axios from 'axios';
import { ArrowLeft } from 'lucide-react';

function ForgotPassword() {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSendCode = async (e) => {
    e.preventDefault();
    if (!email) {
      toast.error('Vui lòng nhập email!');
      return;
    }
    setLoading(true);
    try {
      const response = await axios.post(
        process.env.NODE_ENV === "development" 
          ? (process.env.REACT_APP_DEV_API + "/api/auth/resend") 
          : (process.env.REACT_APP_PRO_API + "/api/auth/resend"), 
        { email }
      );
        if (response.status >= 200 && response.status < 300) {
        toast.success('Đã gửi mã xác thực!');
        setStep(2); 
      }
    } catch (error) {
      if (error.response && error.response.data) {
        const { title, reasons } = error.response.data;
        const errorMessage = reasons && reasons.length > 0 ? reasons[0].message : title;
        toast.error(errorMessage); 
      } else {
        toast.error('Đã có lỗi xảy ra. Hãy thử lại!');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (!newPassword || !confirmPassword || !code) {
      toast.error('Vui lòng điền đầy đủ thông tin!');
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error('Mật khẩu không khớp!');
      return;
    }
    setLoading(true);
    try {
      const response = await axios.post(
        process.env.NODE_ENV === "development" 
          ? (process.env.REACT_APP_DEV_API + "/api/auth/forgot-password") 
          : (process.env.REACT_APP_PRO_API + "/api/auth/forgot-password"), 
        {
          email,
          newPassword,
          code,
        }
      );
      if (response.status >= 200 && response.status < 300) {
        toast.success('Thay đổi mật khẩu thành công!');
        setTimeout(() => {
          navigate('/signin'); 
        }, 2000);
      }
    } catch (error) {
      if (error.response && error.response.data) {
        const { title, reasons } = error.response.data;
        const errorMessage = reasons && reasons.length > 0 ? reasons[0].message : title;
        toast.error(errorMessage); 
      } else {
        toast.error('Đã có lỗi xảy ra. Hãy thử lại!');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <ToastContainer />
      <div className="relative flex flex-col m-6 space-y-8 bg-white shadow-2xl rounded-2xl md:flex-row md:space-y-0">
        <div className="flex flex-col justify-center p-8 md:p-14">
          <button
            className="absolute top-4 left-4 p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-gray-300"
            onClick={() => navigate(-1)}
          >
            <ArrowLeft className="h-8 w-8" />
            <span className="sr-only">Quay lại</span>
          </button>
          {step === 1 && (
            <>
              <span className="mb-3 text-4xl font-bold">Quên mật khẩu</span>
              <span className="font-light text-gray-400 mb-8">Nhập email của bạn để nhận mã xác thực</span>
              <div className="py-4">
                <span className="text-base font-semibold text-gray-600">Email</span>
                <input
                  type="email"
                  className="w-full p-2 border border-gray-300 rounded-md placeholder:font-light placeholder:text-gray-500"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <button
                onClick={handleSendCode}
                className="w-full p-2 mb-6 bg-black text-white border border-transparent rounded-lg shadow-sm text-base font-medium hover:bg-orange-600"
                disabled={loading}
              >
                {loading ? 'Đang gửi...' : 'Gửi mã xác thực'}
              </button>
            </>
          )}
          {step === 2 && (
            <>
              <span className="mb-3 text-4xl font-bold">Đặt lại mật khẩu</span>
              <div className="py-4">
                <span className="text-base font-semibold text-gray-600">Mật khẩu mới</span>
                <input
                  type="password"
                  className="w-full p-2 border border-gray-300 rounded-md placeholder:font-light placeholder:text-gray-500"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                />
              </div>
              <div className="py-4">
                <span className="text-base font-semibold text-gray-600">Xác nhận mật khẩu</span>
                <input
                  type="password"
                  className="w-full p-2 border border-gray-300 rounded-md placeholder:font-light placeholder:text-gray-500"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
              </div>
              <div className="py-4">
                <span className="text-base font-semibold text-gray-600">Mã xác thực</span>
                <input
                  type="text"
                  className="w-full p-2 border border-gray-300 rounded-md placeholder:font-light placeholder:text-gray-500"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  required
                />
              </div>
              <button
                onClick={handleResetPassword}
                className="w-full p-2 mb-6 bg-black text-white border border-transparent rounded-lg shadow-sm text-base font-medium hover:bg-orange-600"
                disabled={loading}
              >
                {loading ? 'Đang đặt lại...' : 'Đặt lại mật khẩu'}
              </button>
            </>
          )}
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

export default ForgotPassword;
