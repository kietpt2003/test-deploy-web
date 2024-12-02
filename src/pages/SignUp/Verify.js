import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuth from '~/context/auth/useAuth';
import signupp from '~/assets/signupp.jpg';
import { ToastContainer, toast } from "react-toastify";
function Verify() {
  const { verify, resend, error } = useAuth();
  const [verificationData, setVerificationData] = useState({
    code: "",
    email: "",
  });
  const [resendLoading, setResendLoading] = useState(false);
  const [loading, setLoading] = useState(false);
  const handleChangeValue = (fieldName, value) => {
    setVerificationData((prev) => ({
      ...prev,
      [fieldName]: value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!verificationData.code && !verificationData.email) {
      toast.error('Yêu cầu nhập mã và email');
      return;
    }
    if (!verificationData.code) {
      toast.error('Yêu cầu nhập mã');
      return;
    }
    if (!verificationData.email) {
      toast.error('Yêu cầu nhập email');
      return;
    }
    setLoading(true);
    try {
      await verify(verificationData);
    } catch (err) {
      console.error("verify error:", err);
    }
    finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setResendLoading(true);
    try {
      await resend(verificationData.email);
    } catch (error) {
      console.error("Resend error details:", error);
    } finally {
      setResendLoading(false);
    }
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
          <span className="mb-3 text-4xl font-bold">Nhập mã xác nhận</span>
          <span className="font-light text-gray-400 mb-8">
            Nhập mã xác nhận đã được gửi tới mail của bạn
          </span>
          <div className="py-1">
            <span className="text-base font-semibold text-gray-600">Email</span>
            <input
              type="email"
              className="w-full p-2 border border-gray-300 rounded-md placeholder:font-light placeholder:text-gray-500"
              name="email"
              value={verificationData.email}
              onChange={(e) => handleChangeValue("email", e.target.value)}
              required
            />
          </div>
          <div className="py-1 pb-5">
            <span className="text-base font-semibold text-gray-600">Mã xác nhận</span>
            <input
              type="text"
              name="code"
              className="w-full p-2 border border-gray-300 rounded-md placeholder:font-light placeholder:text-gray-500"
              value={verificationData.code}
              onChange={(e) => handleChangeValue("code", e.target.value)}
              required
            />
          </div>
          <button
            onClick={handleSubmit}
            className="w-full p-2 mb-6 bg-black text-white border border-transparent rounded-lg shadow-sm text-base font-medium hover:bg-orange-600"
          >
            Xác thực
          </button>

          <button
            onClick={handleResend}
            disabled={resendLoading}
            className="w-full p-2 bg-gray-300 text-black border border-transparent rounded-lg shadow-sm text-base font-medium hover:bg-gray-400"
          >
            {resendLoading ? "Đang gửi..." : "Gửi lại mã xác thực"}
          </button>
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

export default Verify;
