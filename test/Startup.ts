import { SwaggerGenerator } from '../src/index';

(async () => {
  // const resourceHub = new SwaggerGenerator();
  // await resourceHub
  //   .setOpenApiSpecificationUrl(
  //     'http://10.10.0.110:8080/api/v1/System/Swagger/Admin/v1',
  //   )
  //   .setName('ResourceHubMobileApi')
  //   .buildAsync();

  const iotHub = new SwaggerGenerator();
  await iotHub
    .setOpenApiSpecificationUrl(
      'https://atg-homecare-dev.clinicone.me/service-iot/api/v1/System/Swagger/Mobile/v1',
    )
    .setName('IoTHubMobileApi')
    .buildAsync();
})();
