##build phase
FROM node:18-alpine as builder
WORKDIR '/app'
COPY package.json .
RUN npm install
COPY . .
RUN npm run build

#run phase
## src is in /app/build/
## nginx specific target is /usr/share/nginx/html ##checkout the docs on docker hub 
FROM nginx
EXPOSE 80
COPY --from=builder /app/build /usr/share/nginx/html
##default start command is contained in nginx


