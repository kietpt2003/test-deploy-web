import React from 'react';
import LottieAnimation from '~/components/Lottie/LottieAnimation';
import { useNavigate } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

const AiFeature = () => {
    const navigate = useNavigate();
    const backgroundImageUrl = "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&q=80&w=2072&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D";

    return (
        <div className="min-h-screen flex items-center justify-center bg-cover bg-center bg-no-repeat relative p-4" style={{ backgroundImage: `url(${backgroundImageUrl})` }}>
            <div className="absolute inset-0 bg-black opacity-30"></div>
            <div className="max-w-6xl w-full bg-white bg-opacity-30 backdrop-blur-sm rounded-2xl shadow-2xl overflow-hidden relative z-10">
                <div className="flex flex-col md:flex-row">
                    <div className="md:w-2/5 p-8 flex items-center justify-center bg-white bg-opacity-50">
                        <div className="w-full h-64 md:h-full">
                            <LottieAnimation />
                        </div>
                    </div>
                    <div className="md:w-3/5 p-8 relative">
                        <div className="relative z-10">
                            <h1 className="text-4xl font-bold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-blue-300 to-purple-300">
                                Khám phá tính năng tìm kiếm sản phẩm bằng ngôn ngữ tự nhiện
                            </h1>
                            <p className="text-lg text-white mb-8 leading-relaxed drop-shadow-md">
                                Tính năng tìm kiếm sản phẩm bằng ngôn ngữ tự nhiên giúp bạn dễ dàng tìm thấy sản phẩm và cửa hàng một cách nhanh chóng và chính xác. Hệ thống có
                                khả năng hiểu ý định tìm kiếm, phân tích từ khóa và gợi ý những sản phẩm, cửa hàng phù hợp nhất với nhu cầu của bạn.
                            </p>
                            <button
                                onClick={() => navigate("/search-by-natural-language")}
                                className="group inline-flex items-center px-6 py-3 text-lg font-semibold text-white bg-gradient-to-r from-blue-500 to-purple-600 rounded-full transition-all duration-300 ease-in-out hover:from-blue-600 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                            >
                                Hãy thử ngay
                                <ArrowRight className="ml-2 h-5 w-5 transition-transform duration-300 ease-in-out group-hover:translate-x-1" />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AiFeature;