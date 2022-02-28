FROM node:17-alpine
# Adding build tools to make yarn install work on Apple silicon / arm64 machines
RUN apk add --no-cache python2 g++ make
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm install --production --silent
RUN npm install react-scripts@5.0.0 -g --silent
COPY . ./

CMD ["npm", "start"]

# build : 'docker build -t <user>/<repo> .'
# run : 'docker run -d -p 80:3000 <user>/<repo>'
