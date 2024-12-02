import React, { useState } from 'react';
import AxiosInterceptor from '~/components/api/AxiosInterceptor';
import { toast } from 'react-toastify'; // Import toast if you're using react-toastify
import 'react-toastify/dist/ReactToastify.css'; // Import styles for toast

const ChangePassword = ({ closeModal }) => { // Accept closeModal as prop
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleChangePassword = async () => {
    if (newPassword !== confirmPassword) {
      toast.error('Mật khẩu xác nhận không khớp!');
      return;
    }

    try {
      // Send request to change password API
     const response =  await AxiosInterceptor.put('/api/user/change-password', {
        oldPassword,
        newPassword
      });
      if (response.status >= 200 && response.status < 300) {
        toast.success('Mật khẩu đã được thay đổi thành công!'); 
        setTimeout(() => {
        }, 5000);
        setOldPassword('');
        setNewPassword('');
        setConfirmPassword('');
        closeModal(); 
           
      } 
      else if (response.status >= 400 && response.status < 500) {
        const errorMessage = response.data.reasons?.[0]?.message || 'Vui lòng thử lại.'; 
        toast.error(`${errorMessage}`); 
      } 
      else {
        toast.error('Đã xảy ra lỗi không mong muốn. Vui lòng thử lại.'); 
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      const errorMessage = error.response?.data?.reasons?.[0]?.message || 'Đã xảy ra lỗi. Vui lòng thử lại.';
      toast.error(`${errorMessage}`); 
    }
  };

  return (
    <>
      <div
        className="fixed inset-0 flex items-center justify-center bg-black/50 z-50"
        onClick={(e) => {
          if (e.target === e.currentTarget) closeModal(); // Close modal if clicking outside of it
        }}
      >
        <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md relative">
         
          <h1 className="text-2xl font-bold mb-6 text-center">Đổi mật khẩu</h1>

          <div className="mb-4">
            <label className="block text-gray-700">Mật khẩu hiện tại</label>
            <input
              type="password"
              value={oldPassword}
              onChange={(e) => setOldPassword(e.target.value)}
              className="mt-2 p-2 border rounded w-full h-10"
            />
          </div>

          <div className="mb-4">
            <label className="block text-gray-700">Mật khẩu mới</label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="mt-2 p-2 border rounded w-full h-10"
            />
          </div>

          <div className="mb-4">
            <label className="block text-gray-700">Xác nhận mật khẩu mới</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="mt-2 p-2 border rounded w-full h-10"
            />
          </div>

          <button
            onClick={handleChangePassword}
            className="mt-4 bg-black text-white p-2 rounded w-full"
          >
            Đổi mật khẩu
          </button>
        </div>
      </div>
    </>
  );
};

export default ChangePassword;
