FROM node:24-alpine
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --silent
COPY . ./

EXPOSE 3000
# --host binds to 0.0.0.0 so the dev server is reachable from outside the container
CMD ["npm", "start", "--", "--host"]

# build : 'docker build -t <user>/<repo> .'
# run : 'docker run -d -p 80:3000 <user>/<repo>'
