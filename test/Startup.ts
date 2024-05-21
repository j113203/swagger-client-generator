import { SwaggerGenerator } from "../src/index"

(async () => {
  const petstore = new SwaggerGenerator();
    await petstore
      .setOpenApiSpecificationUrl(
        "https://generator3.swagger.io/openapi.json"
      )
      .setName("PetStoreApi")
      .buildAsync();
    console.log("Swagger file generated successfully.");
})();
