import axios from 'axios';
import { jwtDecode } from 'jwt-decode';
import React, { createContext, useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import AxiosInterceptor from '../../components/api/AxiosInterceptor';
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { googleLogout } from '@react-oauth/google';

const AuthContext = createContext({
	isAuthenticated: false,
	isLoading: true,
	setIsLoading: () => { },
	user: null,
	token: null,
	login: () => { },
	logout: () => { },
	signup: () => { },
	verify: () => { },
	googleLogin: () => { },
	error: null,
});

const AuthProvider = ({ children }) => {
	const [user, setUser] = useState(null);
	const [token, setToken] = useState(null);
	const [isAuthenticated, setAuthenticated] = useState(false);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState(null);
	const navigate = useNavigate();
	const location = useLocation();

	useEffect(() => {
		const fetchUser = async () => {
			setIsLoading(true);
			const token = localStorage.getItem('token');
			if (token) {
				try {
					const res = await AxiosInterceptor.get("/api/users/current");

					if (res.status === 200) {
						setUser(res.data);
						setAuthenticated(true);
						setError(null);

						// Check for deposit-related URL parameters
						const queryParams = new URLSearchParams(location.search);
						const isSuccess = queryParams.get('isSuccess');
						const status = queryParams.get('status');

						if (isSuccess === 'True' || status === 'PAID') {
							navigate('/deposit-success', { replace: true });
							return;
						} else if (queryParams.has('isSuccess') || queryParams.has('status')) {
							navigate('/deposit-fail', { replace: true });
							return;
						}

						// Navigate based on role
						switch (res.data.role) {
							case "Admin":
								navigate("/admin/dashboard");
								break;
							case "Manager":
								navigate("/manage-dashboard");
								break;
							case "Seller":
								if (res.data.seller === null) {
									navigate("/seller-application");
								} else {
									navigate("/seller/dashboard");
								}
								break;
							case "Customer":
								navigate("/");
								break;
							default:
								navigate("/");
						}
					}
				} catch (error) {
					setUser(null);
					setAuthenticated(false);
					setError({
						title: "Token Error",
						message: "Phiên đăng nhập của bạn đã hết hạn, hãy đăng nhập lại."
					});

					return;
				}
			}
			setIsLoading(false);
		};
		fetchUser();
	}, []);

	const login = async (userAccount) => {
		setIsLoading(true);
		let res;
		try {
			res = await axios.post(process.env.NODE_ENV === "development" ? (process.env.REACT_APP_DEV_API + "/api/auth/login") : (process.env.REACT_APP_PRO_API + "/api/auth/login"), {
				email: userAccount.email,
				password: userAccount.password,
				deviceToken: userAccount.deviceToken
			}
			);
		} catch (error) { //res.status !== 200
			setAuthenticated(false);
			setError(error?.response?.data?.reasons[0]);
			setIsLoading(false);
			return;

		}
		if (res.status === 200) {
			setToken(res.data.token);
			const decode = jwtDecode(res.data.token);
			const userInfo = JSON.parse(decode.UserInfo || '{}');
			const clientRole = userInfo.Role; // Lấy vai trò từ UserInfo

			if (clientRole === "Customer" || clientRole === "Seller" || clientRole === "Admin" || clientRole === "Manager") {
				localStorage.setItem('token', res.data.token);
				localStorage.setItem('refreshToken', res.data.refreshToken);
				let resData;


				try {
					resData = await axios.get(process.env.NODE_ENV === "development" ? (process.env.REACT_APP_DEV_API + "/api/users/current") : (process.env.REACT_APP_PRO_API + "/api/users/current"), {
						headers: {
							Authorization: `Bearer ${res.data.token}`
						}
					}
					);

				} catch (error) {
					await logout();
					setIsLoading(false);
					setError({
						title: "Token Error",
						message: "Lỗi xác thực, hãy thử lại."
					});

					return;
				}
				if (resData.status === 200) {
					if (resData.data.status === "Active") {
						setUser(resData.data);
						setAuthenticated(true);
						setError(null);
						if (clientRole === "Admin") {
							navigate("/admin/dashboard");
						} else if (clientRole === "Manager") {
							navigate("/manage-dashboard");
						} else if (clientRole === "Seller") {
							if (resData.data.seller === null) {
								navigate("/seller-application");
							} else {
								navigate("/seller/dashboard");
							}
						} else {
							navigate("/");
						}

					} else {
						await logout();
						setError({
							title: "Account Banned",
							message: "Tài khoản của bạn đã bị khóa, hãy thử lại."
						});
					}

				}
			} else {
				setAuthenticated(false);
				setError({
					title: "Access Denied",
					message: "Truy cập của bạn bị từ chối, hãy thử lại."
				});

			}
		}
		setIsLoading(false);
	};



	const googleLogin = async (googleToken, deviceToken) => {
		setIsLoading(true);
		let res;
		try {
			res = await axios.post(
				process.env.NODE_ENV === "development"
					? `${process.env.REACT_APP_DEV_API}/api/auth/google/${googleToken}`
					: `${process.env.REACT_APP_PRO_API}/api/auth/google/${googleToken}`,
				{
					deviceToken: deviceToken
				}
			);

			if (res.status === 200) {
				const { token, refreshToken } = res.data;
				setToken(token);
				localStorage.setItem('token', token);
				localStorage.setItem('refreshToken', refreshToken);

				const decode = jwtDecode(token);
				const userInfo = JSON.parse(decode.UserInfo || '{}');
				const clientRole = userInfo.Role;

				if (clientRole === "Customer" || clientRole === "Seller") {
					let resData;
					try {
						resData = await axios.get(process.env.NODE_ENV === "development" ? (process.env.REACT_APP_DEV_API + "/api/users/current") : (process.env.REACT_APP_PRO_API + "/api/users/current"), {
							headers: {
								Authorization: `Bearer ${token}`
							}
						});
					} catch (error) {
						await logout();
						setError({
							title: "Token Error",
							message: "Lỗi xác thực, hãy thử lại."
						});

						return;
					}

					if (resData.status === 200) {
						setUser(resData.data);
						setAuthenticated(true);
						setError(null);
						navigate("/");
					}
				} else {
					setAuthenticated(false);
					setError({
						title: "Access Denied",
						message: "Your Email needs to verify, please Sign Up."
					});

				}
			} else {
				setError({
					title: "Google Login Failed",
					message: "Đăng nhập Google không thành công, vui lòng thử lại."
				});

			}
		} catch (error) {

			const backendError = error?.response?.data;
			if (backendError) {
				setError({
					title: "Lỗi Đăng Nhập",
					message: (backendError.reasons?.[0]?.message)
				});
			} else {
				setError({
					title: "Lỗi Đăng Nhập",
					message: "Đăng nhập Google không thành công, vui lòng thử lại."
				});
			}
		} finally {
			setIsLoading(false);
		}
	};


	const logout = async () => {
		googleLogout();
		setUser(null);
		setToken(null);
		setAuthenticated(false);
		setError(null);
		localStorage.removeItem('token');
		localStorage.removeItem('refreshToken');
		navigate('/signin');
	};




	const signup = async (userDetails) => {
		setIsLoading(true);
		let registerRes;
		try {
			registerRes = await axios.post(process.env.NODE_ENV === "development" ? (process.env.REACT_APP_DEV_API + "/api/auth/signup") : (process.env.REACT_APP_PRO_API + "/api/auth/signup"), {
				fullName: userDetails.fullName,
				password: userDetails.password,
				email: userDetails.email,
				role: userDetails.role,
				deviceToken: userDetails.deviceToken,
			}
			);

			if (registerRes.status === 204) {
				// Redirect to verify page
				navigate('/verify');
			}
		} catch (error) {
			console.log(error);

			setError({

				title: "Registration Error",
				message: error?.response?.data?.reasons[0] || "Đăng kí thất bại, vui lòng thử lại sau",
			});
		} finally {
			setIsLoading(false);
		}
	};

	const verify = async (verificationData) => {
		setIsLoading(true);
		let verifyRes;
		try {
			verifyRes = await axios.post(process.env.NODE_ENV === "development" ? (process.env.REACT_APP_DEV_API + "/api/auth/verify") : (process.env.REACT_APP_PRO_API + "/api/auth/verify"), {
				code: verificationData.code,
				email: verificationData.email,
			});

			if (verifyRes.status === 200) {
				const { token, refreshToken } = verifyRes.data;
				setToken(token);
				localStorage.setItem('token', token);
				localStorage.setItem('refreshToken', refreshToken);

				const decode = jwtDecode(token);
				const userInfo = JSON.parse(decode.UserInfo || '{}');
				const clientRole = userInfo.Role; // Lấy vai trò từ UserInfo

				if (clientRole === "Seller") {
					let resData;
					try {
						// Gọi API để lấy thông tin người dùng hiện tại
						resData = await axios.get(process.env.NODE_ENV === "development" ? (process.env.REACT_APP_DEV_API + "/api/users/current") : (process.env.REACT_APP_PRO_API + "/api/users/current"), {
							headers: {
								Authorization: `Bearer ${token}`
							}
						});

						if (resData.status === 200) {
							// Kiểm tra seller có null hay không
							if (resData.data.seller === null) {
								navigate("/seller-application"); // Điều hướng đến trang đăng ký seller
							} else {
								setUser(resData.data); // Lưu thông tin người dùng
								setAuthenticated(true);
								setError(null);
								navigate("/seller"); // Điều hướng đến trang seller
							}
						}
					} catch (error) {
						await logout();
						setError({
							title: "Token Error",
							message: "Lỗi xác thực, hãy thử lại."
						});

						return;
					}
				} else if (clientRole === "Customer") {
					let resData;
					try {
						// Gọi API để lấy thông tin người dùng hiện tại
						resData = await axios.get(process.env.NODE_ENV === "development" ? (process.env.REACT_APP_DEV_API + "/api/users/current") : (process.env.REACT_APP_PRO_API + "/api/users/current"), {
							headers: {
								Authorization: `Bearer ${token}`
							}
						});

						if (resData.status === 200) {
							setUser(resData.data); // Lưu thông tin người dùng
							setAuthenticated(true);
							setError(null);
							navigate("/"); // Điều hướng đến trang chính nếu là Customer
						}
					} catch (error) {
						await logout();
						setError({
							title: "Token Error",
							message: "Lỗi xác thực, hãy thử lại."
						});
						return;
					}
				} else {
					setAuthenticated(false);
					setError({
						title: "Access Denied",
						message: "Truy cập của bạn bị từ chối, hãy thử lại."
					});

				}
			} else {
				setError({
					title: "Verification Failed",
					message: "Mã xác thực không hợp lệ, hãy thử lại."
				});

			}
		} catch (error) {
			// Check if the error is a 400 Bad Request
			if (error.response && error.response.status === 400) {
				setError({
					title: "Bad Request",
					message: error.response.data.message || "Dữ liệu yêu cầu không hợp lệ. Vui lòng kiểm tra lại."
				});
			} else {
				// General error handling
				setError({
					title: "Verification Error",
					message: error.response?.data?.message || "Lỗi trong quá trình xác thực, hãy thử lại."
				});
			}
			console.error("Verification error details:", error.response); // Log error details
		} finally {
			setIsLoading(false);
		}
	};

	const resend = async (email) => {
		setIsLoading(true);
		let resendRes;
		try {
			resendRes = await axios.post(process.env.NODE_ENV === "development" ? (process.env.REACT_APP_DEV_API + "/api/auth/resend") : (process.env.REACT_APP_PRO_API + "/api/auth/resend"), {
				email: email,
			}
			);

			if (resendRes.status === 204) {
				toast.success("Gửi mã thành công, vui nhập mã")
			} else {
				setError({
					title: "Resend Failed",
					message: "Gửi thất bại, vui lòng thử lại ",
				});

			}
		} catch (error) {
			// Handle specific error cases
			if (error.response && error.response.status === 400) {
				setError({
					title: "Bad Request",
					message: error.response.data.message || "Thất bại, vui lòng kiểm tra lại ",
				});
			} else {
				// General error handling
				setError({
					title: "Resend Error",
					message: error.response?.data?.message || "Gửi lại mã thất bại, vui lòng thử lại",
				});
			}
			console.error("Resend error details:", error.response); // Log error details
		} finally {
			setIsLoading(false);
		}
	};

	useEffect(() => {
		if (error) {
			toast.error(`${error.message}`);
		}
	}, [error]);

	return (
		<AuthContext.Provider
			value={{
				user,
				token,
				isAuthenticated,
				isLoading,
				setIsLoading,
				login,
				logout,
				signup,
				verify,
				resend,
				googleLogin,
				error,
			}}
		>
			{children}
		</AuthContext.Provider>
	);
};

export { AuthContext, AuthProvider };
