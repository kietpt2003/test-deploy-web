# Sử dụng image Node.js chính thức để build ứng dụng
FROM node:23 as build

# Định nghĩa các build argument
ARG REACT_APP_DEV_API
ARG REACT_APP_PRO_API

# Thiết lập các biến môi trường cho ứng dụng
ENV REACT_APP_DEV_API=$REACT_APP_DEV_API
ENV REACT_APP_PRO_API=$REACT_APP_PRO_API

# Thiết lập thư mục làm việc
WORKDIR /app

# Sao chép package.json và cài đặt các dependencies
COPY package*.json ./
RUN npm install

# Sao chép toàn bộ mã nguồn và build ứng dụng
COPY . .
RUN npm run build
