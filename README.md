# SwaggerGenerator


### Generate

create a file generate.ts

    import { SwaggerGenerator } from "@wajunworks/swagger-client";
    
    (async () => {
      const resourceHub = new SwaggerGenerator();
      await resourceHub
        .setOpenApiSpecificationUrl(
          "https://generator3.swagger.io/openapi.json"
        )
        .setName("PetStoreMobileV2Api")
        .buildAsync();
    })();
    

### Usage
     new PetStoreMobileV2ApiClient().serviceConnection.listAsync({});
