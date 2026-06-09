FROM eclipse-temurin:17-jdk-alpine AS backend-build
WORKDIR /app
COPY backend/pom.xml .
COPY backend/src ./src
RUN apk add --no-cache maven && mvn clean package -DskipTests

FROM node:20-alpine AS frontend-build
WORKDIR /app
COPY frontend/package.json frontend/package-lock.json ./
RUN npm ci
COPY frontend/ .
RUN npm run build

FROM eclipse-temurin:17-jre-alpine
WORKDIR /app
COPY --from=backend-build /app/target/nursing-platform-1.0.0.jar app.jar
COPY --from=frontend-build /app/dist /app/static
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]
