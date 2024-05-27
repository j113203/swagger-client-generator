import { IoTHubMobileApiClient } from '../api/IoTHubMobileApi';
import { SwaggerGenerator } from '../src/index';

(async () => {
  // const petstore = new SwaggerGenerator();
  // await petstore
  //   .setOpenApiSpecificationUrl('https://generator3.swagger.io/openapi.json')
  //   .setName('PetStoreApi')
  //   .buildAsync();
  // console.log('Swagger file generated successfully.');
  const resourceHub = new SwaggerGenerator();
  await resourceHub
    .setOpenApiSpecificationUrl(
      'https://atg-homecare-dev.clinicone.me/service-resource/api/v1/System/Swagger/Mobile/v1',
    )
    .setName('ResourceHubMobileApi')
    .buildAsync();

  const iotHub = new SwaggerGenerator();
  await iotHub
    .setOpenApiSpecificationUrl(
      'https://atg-homecare-dev.clinicone.me/service-iot/api/v1/System/Swagger/Mobile/v1',
    )
    .setName('IoTHubMobileApi')
    .buildAsync();


    //new IoTHubMobileApiClient().healthRecord.bloodGlucoseRecord.listAsync({});
})();
