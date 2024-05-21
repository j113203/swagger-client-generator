import axios from 'axios';
import * as fs from 'fs';
import { OpenAPIObject } from 'openapi3-ts/oas30';
import { SwaggerFileGenerator } from './SwaggerFileGenerator';

export class SwaggerGenerator {
  private _openApiSpecificationUrl?: string;
  private _name?: string;
  private _outputDirectory: string = 'api';

  setOpenApiSpecificationUrl(url: string): SwaggerGenerator {
    this._openApiSpecificationUrl = url;
    return this;
  }

  setName(name: string): SwaggerGenerator {
    this._name = name;
    return this;
  }

  setOutputDirectory(directory: string): SwaggerGenerator {
    this._outputDirectory = directory;
    return this;
  }

  async buildAsync(): Promise<void> {
    const url = this._openApiSpecificationUrl;
    const name = this._name;
    if (url == undefined) {
      console.log('OpenApiSpecification is not set');
    } else if (name == undefined) {
      console.log('name is not set');
    } else {
      const instance = axios.create();
      const response = await instance.get<OpenAPIObject>(url);

      const openApiObject = response.data;

      switch (openApiObject.openapi) {
        case '3.0.0':
        case '3.0.1':
          const tagDirectory = `${this._outputDirectory}/${name}`;
          if (fs.existsSync(tagDirectory)) {
            await fs.promises.rm(tagDirectory, { recursive: true });
          }

          const baseUrl = new URL(url).origin;

          const swaggerFileGenerator = new SwaggerFileGenerator(
            name,
            baseUrl,
            tagDirectory,
            openApiObject,
          );

          const files = await swaggerFileGenerator.buildAsync();
          for (let i = 0; i < files.length; i++) {
            const file = files[i];
            await file.writeAsync();
          }
          break;
        default:
          throw new Error('Unsupported OpenApi version');
      }
    }
  }
}
