FROM maven:3.9.9-eclipse-temurin-21 AS build
WORKDIR /project

COPY pom.xml ./
COPY src ./src
RUN mvn -q -DskipTests package

FROM eclipse-temurin:21-jre
WORKDIR /deployments

COPY --from=build /project/target/quarkus-app/lib/ ./lib/
COPY --from=build /project/target/quarkus-app/*.jar ./
COPY --from=build /project/target/quarkus-app/app/ ./app/
COPY --from=build /project/target/quarkus-app/quarkus/ ./quarkus/

EXPOSE 8080
CMD ["java", "-jar", "quarkus-run.jar"]
