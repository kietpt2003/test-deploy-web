# Sử dụng image Node.js chính thức để build ứng dụng
FROM node:23 as build

# Định nghĩa các build argument
ARG REACT_APP_DEV_API
ARG REACT_APP_PRO_API

# Thiết lập các biến môi trường cho ứng dụng
ENV REACT_APP_DEV_API=$REACT_APP_DEV_API
ENV REACT_APP_PRO_API=$REACT_APP_PRO_API

WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# Sử dụng NGINX cho production
FROM nginx:1.21
COPY --from=build /app/build /usr/share/nginx/html

# Sao chép file cấu hình NGINX vào container
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]