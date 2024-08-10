# Use Node.js 18 as the parent image
FROM node:18

# Set the working directory in the container
WORKDIR /usr/src/app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application code
COPY . .

# Build the React app with more verbose output
RUN npm run build -- --verbose

# Make port 5050 available to the world outside this container
EXPOSE 3000 5050

# Define environment variable
ENV NODE_ENV=production

# Run the app when the container launches
CMD ["npx", "concurrently", "\"npm run server\"", "\"npm start\""]