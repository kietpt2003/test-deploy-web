import React, { useState, useEffect } from 'react';
import { FaPencilAlt, FaSave, FaKey } from 'react-icons/fa';
import { CgSpinner } from 'react-icons/cg';
import AxiosInterceptor from '~/components/api/AxiosInterceptor';
import ChangePassword from '~/pages/Profile/ChangePassword';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import {
    BankOutlined,
    ShopOutlined,
    HomeOutlined,
    PhoneOutlined,
    MailOutlined,
    BuildOutlined,
    FileTextOutlined,
    TagsOutlined
} from '@ant-design/icons';
import { ArrowBack } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

const labels = {
    companyName: { text: 'Tên Công Ty', icon: <BankOutlined /> },
    shopName: { text: 'Tên Cửa Hàng', icon: <ShopOutlined /> },
    shopAddress: { text: 'Địa chỉ cửa hàng', icon: <HomeOutlined /> },
    phoneNumber: { text: 'Số điện thoại', icon: <PhoneOutlined /> },
    email: { text: 'Email', icon: <MailOutlined /> },
    businessModel: { text: 'Loại hình kinh doanh', icon: <BuildOutlined /> },
    billingMails: { text: 'Billing Mails', icon: <FileTextOutlined /> },
    taxCode: { text: 'Mã số thuế', icon: <TagsOutlined /> }
};

const SellerProfilePage = () => {
    const [isEditing, setIsEditing] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [profile, setProfile] = useState({
        companyName: '',
        shopName: '',
        shopAddress: '',
        phoneNumber: '',
        email: '',
        businessModel: '',
        billingMails: [],
        taxCode: '',
    });
    const [originalProfile, setOriginalProfile] = useState({});
    const [hasChanges, setHasChanges] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        const getCurrentUser = async () => {
            try {
                const response = await AxiosInterceptor.get('/api/seller/current');
                const userData = response.data;

                const loadedProfile = {
                    companyName: userData.companyName || '',
                    shopName: userData.shopName || '',
                    shopAddress: userData.shopAddress || '',
                    phoneNumber: userData.phoneNumber || '',
                    email: userData.user.email || '',
                    businessModel: userData.businessModel || '',
                    billingMails: userData.billingMails || [],
                    taxCode: userData.taxCode || '',
                };

                setProfile(loadedProfile);
                setOriginalProfile(loadedProfile);
            } catch (error) {
                console.error('Error fetching seller profile:', error);
            }
        };

        getCurrentUser();
    }, []);

    useEffect(() => {
        const hasChanged = Object.keys(profile).some(key => 
            JSON.stringify(profile[key]) !== JSON.stringify(originalProfile[key])
        );
        setHasChanges(hasChanged);
    }, [profile, originalProfile]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setProfile({ ...profile, [name]: value });
    };

    const handleSave = async () => {
        if (!hasChanges) {
            toast.info('Không có thay đổi nào để lưu.');
            return;
        }

        setIsSaving(true);
        try {
            const formData = new FormData();

            ['companyName', 'shopName', 'shopAddress', 'phoneNumber'].forEach(key => {
                if (profile[key] !== originalProfile[key]) {
                    formData.append(key.charAt(0).toUpperCase() + key.slice(1), profile[key]);
                }
            });

            const response = await AxiosInterceptor.patch('/api/seller', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            if (response.status >= 200 && response.status < 300) {
                setIsEditing(false);
                setOriginalProfile(profile);
                toast.success('Cập nhật thông tin thành công!');
            } else {
                const errorMessage = response.data.reasons?.[0]?.message || 'Vui lòng thử lại.';
                toast.error(`${errorMessage}`);
            }
        } catch (error) {
            const errorMessage = error.response?.data?.reasons?.[0]?.message || 'Đã xảy ra lỗi. Vui lòng thử lại.';
            toast.error(`${errorMessage}`);
        } finally {
            setIsSaving(false);
        }
    };

    const openModal = () => setIsModalOpen(true);
    const closeModal = () => setIsModalOpen(false);
    const navigate = useNavigate();

    return (
        <div className="flex justify-center items-center min-h-screen bg-gradient-to-r from-primary/40 to-secondary/40">
            <ToastContainer />
            <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-4xl">              
                <div>
                    <button
                       onClick={() => navigate(-1)}
                        className="text-black cursor-pointer"
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
                    <button onClick={openModal} className="text-gray-500 hover:text-gray-700 text-xl">
                        <FaKey />
                    </button>
                </div>
                <div className="grid grid-cols-2 gap-8">
                    {/* Editable Fields */}
                    <div>
                        {profile.businessModel !== 'Personal' && (
                            <div className="mb-4">
                                <label className="flex items-center text-gray-700">
                                    {labels.companyName.icon}
                                    <span className="ml-2">{labels.companyName.text}</span>
                                </label>
                                {isEditing ? (
                                    <input
                                        type="text"
                                        name="companyName"
                                        value={profile.companyName}
                                        onChange={handleChange}
                                        className="mt-2 p-2 border rounded w-full h-10"
                                    />
                                ) : (
                                    <p className="mt-2 p-2 border rounded w-full bg-gray-100 h-10 truncate">
                                        {profile.companyName || 'N/A'}
                                    </p>
                                )}
                            </div>
                        )}

                        {['shopName', 'shopAddress', 'phoneNumber'].map((key) => (
                            <div key={key} className="mb-4">
                                <label className="flex items-center text-gray-700">
                                    {labels[key].icon}
                                    <span className="ml-2">{labels[key].text}</span>
                                </label>
                                {isEditing ? (
                                    <input
                                        type="text"
                                        name={key}
                                        value={profile[key]}
                                        onChange={handleChange}
                                        className="mt-2 p-2 border rounded w-full h-10"
                                    />
                                ) : (
                                    <p className="mt-2 p-2 border rounded w-full bg-gray-100 h-10 truncate">
                                        {profile[key] || 'N/A'}
                                    </p>
                                )}
                            </div>
                        ))}
                    </div>

                    {/* Non-editable Fields */}
                    <div>
                        {['email', 'businessModel', 'taxCode', 'billingMails'].map((key) => (
                            <div key={key} className="mb-4">
                                <label className="flex items-center text-gray-700">
                                    {labels[key].icon}
                                    <span className="ml-2">{labels[key].text}</span>
                                </label>
                                {key === 'billingMails' ? (
                                    <div className="mt-2 p-2 border rounded bg-gray-100">
                                        {profile.billingMails.length > 0 ? (
                                            profile.billingMails.map((mailObject, index) => (
                                                <div key={index} className="h-10">
                                                    {mailObject.mail}
                                                </div>
                                            ))
                                        ) : (
                                            <p className="h-10">No billing mails</p>
                                        )}
                                    </div>
                                ) : (
                                    <p className="mt-2 p-2 border rounded w-full bg-gray-100 h-10 truncate">
                                        {profile[key] || 'N/A'}
                                    </p>
                                )}
                            </div>
                        ))}
                    </div>
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

            {isModalOpen && (
                <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
                    <ChangePassword closeModal={closeModal} />
                </div>
            )}
        </div>
    );
};

export default SellerProfilePage;