import React, { useState, useEffect } from 'react';
import { FaPencilAlt, FaSave, FaKey } from 'react-icons/fa';
import { CgSpinner } from 'react-icons/cg';
import AxiosInterceptor from '~/components/api/AxiosInterceptor';
import ChangePassword from './ChangePassword';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import DefaultAvatar from '~/assets/R.png';
import { ArrowBack } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

const labels = {
  name: 'Tên',
  address: 'Địa chỉ',
  cccd: 'CCCD',
  gender: 'Giới tính',
  dateOfBirth: 'Ngày sinh',
  phoneNumber: 'Số điện thoại',
  email: 'Email',
  avatar: 'Ảnh đại diện'
};

const formatDateToDisplay = (dateString) => {
  if (!dateString) {
    return '';
  }

  const date = new Date(dateString);
  if (isNaN(date.getTime())) {
    return '';
  }

  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
};

const translateGender = (gender) => {
  switch (gender) {
    case 'Male':
      return 'Nam';
    case 'Female':
      return 'Nữ';
    default:
      return gender;
  }
};

const reverseTranslateGender = (gender) => {
  switch (gender) {
    case 'Nam':
      return 'Male';
    case 'Nữ':
      return 'Female';
    default:
      return gender;
  }
};

const ProfilePage = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [profile, setProfile] = useState({
    name: '',
    address: '',
    cccd: '',
    gender: 'Male',
    dateOfBirth: 'DD/MM/YYYY',
    phoneNumber: '',
    email: '',
    avatar: ''
  });
  const [originalProfile, setOriginalProfile] = useState({});
  const [previewImage, setPreviewImage] = useState(null);
  const [hasChanges, setHasChanges] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const getCurrentUser = async () => {
      try {
        const response = await AxiosInterceptor.get('/api/users/current');
        const userData = response.data.customer;

        const newProfile = {
          name: userData.fullName,
          address: userData.address || '',
          cccd: userData.cccd || '',
          gender: translateGender(userData.gender) || '',
          dateOfBirth: formatDateToDisplay(userData.dateOfBirth),
          phoneNumber: userData.phoneNumber || '',
          email: response.data.email,
          avatar: userData.avatarUrl || ''
        };

        setProfile(newProfile);
        setOriginalProfile(newProfile);
      } catch (error) {
        console.error('Error fetching user profile:', error);
      }
    };

    getCurrentUser();
  }, []);

  useEffect(() => {
    const hasChanged = Object.keys(profile).some(key => profile[key] !== originalProfile[key]);
    setHasChanges(hasChanged || previewImage !== null);
  }, [profile, originalProfile, previewImage]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfile({ ...profile, [name]: value });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfile({ ...profile, avatar: file });
      setPreviewImage(URL.createObjectURL(file));
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const formData = new FormData();

      if (profile.name) formData.append('FullName', profile.name);
      if (profile.address) formData.append('Address', profile.address);
      if (profile.cccd) formData.append('CCCD', profile.cccd);
      if (profile.gender) formData.append('Gender', reverseTranslateGender(profile.gender));

      const [day, month, year] = profile.dateOfBirth.split('/');
      const formattedDate = `${year}/${month}/${day}`;
      formData.append('DateOfBirth', formattedDate);

      if (profile.phoneNumber) formData.append('PhoneNumber', profile.phoneNumber);

      if (profile.avatar instanceof File) {
        formData.append('Avatar', profile.avatar);
      }

      const response = await AxiosInterceptor.patch('/api/customer', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      if (response.status >= 200 && response.status < 300) {
        // Cập nhật avatar URL từ response nếu có
        const updatedProfile = { ...profile };
        if (response.data && response.data.avatarUrl) {
          updatedProfile.avatar = response.data.avatarUrl;
        }
        
        setProfile(updatedProfile);
        setOriginalProfile(updatedProfile);
        setIsEditing(false);
        toast.success('Cập nhật thông tin thành công!');
      } else if (response.status >= 400 && response.status < 500) {
        const errorMessage = response.data.reasons?.[0]?.message || 'Vui lòng thử lại.';
        toast.error(`${errorMessage}`);
      } else {
        toast.error('Đã xảy ra lỗi không mong muốn. Vui lòng thử lại.');
      }
    } catch (error) {
      const errorMessage = error.response?.data?.reasons?.[0]?.message || 'Đã xảy ra lỗi. Vui lòng thử lại.';
      toast.error(`${errorMessage}`);
    } finally {
      setIsSaving(false);
    }
  };

  // Mở và đóng modal
  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);
  const navigate = useNavigate()

  return (
    <div className="flex justify-center items-center min-h-screen bg-gradient-to-r from-primary/40 to-secondary/40">
      <ToastContainer />
      <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-4xl">
        <div>
          <button
            onClick={() => navigate('/')}
            className="text-black  cursor-pointer"
          >
            <ArrowBack />
          </button>
        </div>
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-2">
            <h1 className="text-2xl font-bold">Thông tin cá nhân</h1>
            <button onClick={() => setIsEditing(!isEditing)} className="text-gray-500 hover:text-gray-700 text-xl">
              <FaPencilAlt />
            </button>
          </div>
          <button
            onClick={openModal}
            className="text-gray-500 hover:text-gray-700 text-xl"
          >
            <FaKey />
          </button>
        </div>
        <div className="flex">
          <div className="w-1/3 flex flex-col items-center">
          <img
              src={previewImage || profile.avatar || DefaultAvatar}
              alt="User Avatar"
              className="rounded-full w-40 h-40 mb-4 bg-gray-100 object-cover"
            />

            {isEditing ? (
              <input
                type="text"
                name="name"
                value={profile.name}
                onChange={handleChange}
                className="mt-2 p-2 border rounded w-full h-10"
              />
            ) : (
              <h2 className="text-xl font-bold truncate">{profile.name}</h2>
            )}
            {isEditing && (
              <div className="mt-1 flex items-center">
                <input
                  id="avatar"
                  type="file"
                  accept=".jpeg,.jpg,.png"
                  className="hidden"
                  onChange={handleFileChange}
                />
                <label
                  htmlFor="avatar"
                  className="cursor-pointer bg-white py-2 px-4 border border-gray-200 rounded-md shadow-sm text-sm leading-4 font-medium text-gray-700 hover:bg-gray-50"
                >
                  <FaPencilAlt className="h-5 w-5 inline-block mr-2" />
                  Tải Lên Ảnh
                </label>
              </div>
            )}
          </div>
          <div className="w-2/3 ml-8">
            <div className="grid grid-cols-2 gap-4">
              {Object.keys(profile).map((key) =>
                key !== 'avatar' && key !== 'name' ? (
                  <div key={key} className="mb-4">
                    <label className="block text-gray-700">{labels[key]}</label>
                    {isEditing ? (
                      key === 'gender' ? (
                        <select
                          name="gender"
                          value={profile.gender}
                          onChange={handleChange}
                          className="mt-2 p-2 border rounded w-full h-10"
                        >
                          <option value="Nam">Nam</option>
                          <option value="Nữ">Nữ</option>
                        </select>
                      ) : key === 'dateOfBirth' ? (
                        <input
                          type="text"
                          name="dateOfBirth"
                          value={profile.dateOfBirth}
                          onChange={handleChange}
                          placeholder="DD/MM/YYYY"
                          className="mt-2 p-2 border rounded w-full h-10"
                        />
                      ) : (
                        <input
                          type="text"
                          name={key}
                          value={profile[key]}
                          onChange={handleChange}
                          className="mt-2 p-2 border rounded w-full h-10"
                        />
                      )
                    ) : (
                      <p className="mt-2 p-2 border rounded w-full bg-gray-100 h-10 truncate">
                        {key === 'dateOfBirth'
                          ? profile[key]
                          : profile[key]}
                      </p>
                    )}
                  </div>
                ) : null
              )}
            </div>
            {isEditing && (
              <div className="flex justify-center">
                <button
                  onClick={handleSave}
                  disabled={!hasChanges || isSaving}
                  className={`mt-4 bg-black text-white p-2 rounded flex items-center ${
                    !hasChanges || isSaving ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                >
                  {isSaving ? (
                    <CgSpinner className="animate-spin mr-2" />
                  ) : (
                    <FaSave className="mr-2" />
                  )}
                  {isSaving ? 'Đang lưu...' : 'Lưu'}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {isModalOpen && (
        <div
          className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50"
        >
          <ChangePassword closeModal={closeModal} />
        </div>
      )}
    </div>
  );
};

export default ProfilePage;