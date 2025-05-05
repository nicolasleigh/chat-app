FROM node:22-slim
WORKDIR /app
COPY ./next-build .
EXPOSE 3000
CMD ["node", "dist/standalone/server.js"]