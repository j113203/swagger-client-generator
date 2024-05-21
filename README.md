# SwaggerGenerator


### Generate

create a file generate.ts

    import { SwaggerGenerator } from "@wajunworks/swagger-client";
    
    (async () => {
      const resourceHub = new SwaggerGenerator();
      await resourceHub
        .setOpenApiSpecificationUrl(
          "https://petstore.swagger.io/v2/swagger.json"
        )
        .setName("PetStoreMobileV2Api")
        .buildAsync();
    })();
    

### Usage
     new PetStoreMobileV2ApiClient().serviceConnection.listAsync({});
