import React, { useEffect, useState, useRef } from 'react';
import AxiosInterceptor from '~/components/api/AxiosInterceptor';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { toast, ToastContainer } from "react-toastify";
import { ArrowBack } from '@mui/icons-material';


const GadgetDetailSeller = () => {
    const location = useLocation();
    const { gadgetId } = location.state || {};
    const [gadget, setGadget] = useState(null);
    const [activeTab, setActiveTab] = useState('specifications');
    const navigate = useNavigate();

    const imgRef = useRef(null);

    const fetchGadgetDetails = async () => {
        try {
            const response = await AxiosInterceptor.get(`/api/gadgets/${gadgetId}`);
            setGadget(response.data);
        } catch (error) {
            console.error("Error fetching gadget details:", error);
            toast.error("Failed to fetch gadget details");
        }
    };



    useEffect(() => {
        fetchGadgetDetails();
    }, []);

    const handleImageClick = (imageUrl) => {
        if (imgRef.current) {
            imgRef.current.src = imageUrl;
        }
    };

    if (!gadget) {
        return <div className="flex items-center justify-center min-h-screen">
            <div className="w-7 h-7 bg-gradient-to-tr from-blue-500 to-purple-500 rounded-full flex items-center justify-center animate-spin">
                <div className="h-4 w-4 bg-white rounded-full"></div>
            </div>
            <span className="ml-2 text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-purple-500">
                Loading...
            </span>
        </div>
    }


    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <ToastContainer />
            <div className="flex flex-col lg:flex-row gap-8">
                <div className="relative pt-5">
                    <button
                        onClick={() => navigate(-1)}
                        className="text-black cursor-pointer"
                    >
                        <ArrowBack />
                    </button>
                </div>
                <div className="w-full">
                    <div className="flex justify-between items-center mb-4">
                        <h1 className="text-2xl font-bold">{gadget.name}</h1>
                    </div>
                    <div className="mb-6 flex justify-center items-center">
                        <img ref={imgRef} src={gadget.thumbnailUrl} alt={gadget.name} className="w-full max-w-md h-90 object-contain rounded-lg border-none" />
                    </div>
                    <div className="flex space-x-2 mb-6 overflow-x-auto">
                        {gadget.gadgetImages.map((image, index) => (
                            <img key={index} src={image.imageUrl} alt={`${gadget.name} - Image ${index + 1}`} width={100} height={100} className="rounded-md border border-gray-200 cursor-pointer" onClick={() => handleImageClick(image.imageUrl)} />
                        ))}
                    </div>
                    <div className="border-t border-gray-200 pt-6">
                        <div className="flex justify-center space-x-4 mb-6">
                            <button className={`w-64 px-4 py-2 rounded-lg font-semibold text-base border border-blue-300 ${activeTab === 'specifications' ? 'bg-blue-100 text-blue-800 border-blue-300' : 'text-gray-600 border-gray-300'}`} onClick={() => setActiveTab('specifications')}>
                                Thông số kỹ thuật
                            </button>
                            <button className={`w-64 px-4 py-2 rounded-lg font-semibold text-base border border-blue-300 ${activeTab === 'review' ? 'bg-blue-100 text-blue-800 border-blue-300' : 'text-gray-600 border-gray-300'}`} onClick={() => setActiveTab('review')}>
                                Bài viết đánh giá
                            </button>
                        </div>
                        {activeTab === 'specifications' && (
                            <div className="space-y-4">
                                {gadget.specificationValues && (() => {
                                    // Group specifications by their keys
                                    const groupedSpecs = gadget.specificationValues.reduce((acc, spec) => {
                                        const keyName = spec.specificationKey?.name || 'N/A';
                                        if (!acc[keyName]) {
                                            acc[keyName] = [];
                                        }
                                        acc[keyName].push(spec);
                                        return acc;
                                    }, {});

                                    // Render grouped specifications
                                    return Object.entries(groupedSpecs).map(([keyName, specs]) => (
                                        <div key={keyName}
                                            className="flex items-start text-sm border-b border-gray-200 py-3 last:border-0"
                                        >
                                            <div className="w-1/3 text-gray-600">
                                                {keyName}
                                            </div>
                                            <div className="w-2/3 font-medium text-gray-900">
                                                {specs.map((spec, index) => (
                                                    <div key={spec.id}>
                                                        {spec.value || 'N/A'} {spec.specificationUnit?.name || ''}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    ));
                                })()}
                            </div>
                        )}
                        {activeTab === 'review' && (
                            <div className="space-y-4">
                                {gadget.gadgetDescriptions.sort((a, b) => a.index - b.index).map((desc) => {
                                    const isImageUrl = desc.value.startsWith("http") && (desc.value.endsWith(".jpg") || desc.value.endsWith(".jpeg") || desc.value.endsWith(".png"));
                                    return (
                                        <div key={desc.id} className={desc.type === 'BoldText' ? ' font-bold' : ' text-sx'}>
                                            {isImageUrl ? (
                                                <img src={desc.value} alt="Gadget" className="max-w-full h-auto" />
                                            ) : (
                                                <div>{desc.value}</div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default GadgetDetailSeller;