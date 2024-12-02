import axios from "axios";

const AxiosInterceptor = axios.create({
    baseURL: process.env.NODE_ENV === "development" ? process.env.REACT_APP_DEV_API : process.env.REACT_APP_PRO_API
    
})

AxiosInterceptor.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        Promise.reject(error)
    }
);
AxiosInterceptor.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;
        // If the error status is 401 and there is no originalRequest._retry flag,
        // it means the token has expired and we need to refresh it
        if (error.response.status >= 400 && error.response.status <= 500 && !originalRequest._retry) {
            originalRequest._retry = true;
            
            try {
                console.log(error.response.data.code);
                if (error.response.data.code === "WEB_02" || " ") {
                    const refreshToken = localStorage.getItem('refreshToken');
                  
                    const response = await axios.post(process.env.NODE_ENV === "development" ? (process.env.REACT_APP_DEV_API + '/api/auth/refresh') : (process.env.REACT_APP_PRO_API + '/api/auth/refresh'), { refreshToken }); 
                    if (response.status >= 200 && response.status < 300) {
                        const { token, refreshToken } = response.data;
                        localStorage.setItem('token', token);
                        localStorage.setItem('refreshToken', refreshToken);
                        // Retry the original request with the new token
                        originalRequest.headers.Authorization = `Bearer ${token}`;
                        return axios(originalRequest);
                    } else {
                        localStorage.removeItem("token");
                        window.location.href = '/signin'
                    }
                } else {
                    localStorage.removeItem("refreshToken");
                    window.location.href = '/signin'
                }


            } catch (error) {
                localStorage.removeItem("token");
                localStorage.removeItem("refreshToken");
                window.location.href = '/signin'
            }
        }

        return Promise.reject(error);
    }
);


export default AxiosInterceptor
