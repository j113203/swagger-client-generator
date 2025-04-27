import {
  OpenAPIObject,
  OperationObject,
  ReferenceObject,
  ResponseObject,
  isReferenceObject,
  isSchemaObject,
} from 'openapi3-ts/oas30';
import TypescriptFile from '../TypescriptFile/TypescriptFile';
import { TypescriptFileType } from '../TypescriptFile/TypescriptFileType';
import { ParseReferenceObjectOrSchemaObjectPayload } from './Payload/ParseReferenceObjectOrSchemaObjectPayload';
import { ParseReferenceObjectOrSchemaObjectResult } from './Result/ParseReferenceObjectOrSchemaObjectResult';
import { ParseParameterObjectOrReferenceObjectPayload } from './Payload/ParseParameterObjectOrReferenceObjectPayload';
import { ParseParameterObjectOrReferenceObjectResult } from './Result/ParseParameterObjectOrReferenceObjectResult';
import {
  getClassNameByOperationId,
  getPathByTag,
  getOperationId,
  getPathByOperationId,
  lowerCaseFirstLetter,
  upperCaseFirstLetter,
} from './OpenAPIObjectExtension';
import { ParseResponseObjectOrReferenceObjectPayload } from './Payload/ParseResponseObjectOrReferenceObjectPayload';
import { ParseResponseObjectOrReferenceObjectResult } from './Result/ParseResponseObjectOrReferenceObjectResult';
import { BuildAbstractMethodPayload } from './Payload/BuildAbstractMethodPayload';
import { BuildAbstractMethodResult } from './Result/BuildAbstractMethodResult';
import { BuildAxiosMethodPayload } from './Payload/BuildAxiosMethodPayload';
import { BuildAxiosMethodResult } from './Result/BuildAxiosMethodResult';
import { ImportType } from '../TypescriptFile/Payload/ImportType';
import { SwaggerOperationResult } from './Result/SwaggerOperationResult';
import { CacheReferenceObjectResult } from './Result/CacheReferenceObjectResult';
import { BuildAxiosParamsPayload } from './Payload/BuildAxiosParamsPayload';
import { BuildAxiosParamsResult } from './Result/BuildAxiosParamsResult';
import { CreateIManagerFilePayload } from './Payload/CreateIManagerFilePayload';
import { CreateManagerFilePayload } from './Payload/CreateManagerFilePayload';
import { CreateIndexFilePayload } from './Payload/CreateIndexFilePayload';
import { CreateClientFilePayload } from './Payload/CreateClientFilePayload';
import { CreateAbstractClientFilePayload } from './Payload/CreateAbstractClientFilePayload';
import { ParseRequestBodyObjectOrReferenceObjectPayload } from './Payload/ParseRequestBodyObjectOrReferenceObjectPayload';
import { ParseRequestBodyObjectOrReferenceObjectResult } from './Result/ParseRequestBodyObjectOrReferenceObjectResult';

export class SwaggerFileGenerator {
  private readonly _name: string;
  private readonly _baseUrl: string;
  private readonly _openAPiObject: OpenAPIObject;
  private readonly _prefixDirectory: string;

  constructor(
    name: string,
    baseUrl: string,
    prefixDirectory: string,
    openAPiObject: OpenAPIObject,
  ) {
    this._name = name;
    this._baseUrl = baseUrl;
    this._openAPiObject = openAPiObject;
    this._prefixDirectory = prefixDirectory;
  }

  public async buildAsync(): Promise<TypescriptFile[]> {
    const files: TypescriptFile[] = [];

    const tags: Record<string, SwaggerOperationResult[]> = {};

    for (const path in this._openAPiObject.paths) {
      const pathObject = this._openAPiObject.paths[path];
      const methodKeys = Object.keys(pathObject);
      for (let i = 0; i < methodKeys.length; i++) {
        const methodKey = methodKeys[i];
        switch (methodKey) {
          case 'get':
          case 'post':
          case 'put':
          case 'delete':
            const operationObject: OperationObject | undefined =
              pathObject[methodKey];
            if (operationObject != undefined) {
              const objectTags = operationObject.tags;
              if (objectTags != undefined) {
                for (let i = 0; i < objectTags.length; i++) {
                  const tag = objectTags[i];
                  if (tags[tag] == undefined) {
                    tags[tag] = [
                      {
                        path: path,
                        object: operationObject,
                        method: methodKey,
                      },
                    ];
                  } else {
                    tags[tag].push({
                      path: path,
                      object: operationObject,
                      method: methodKey,
                    });
                  }
                }
              }
            }
            break;
        }
      }
    }

    const apiFile = new TypescriptFile(TypescriptFileType.Class)
      .setName(`${this._name}Client`)
      .setPath(`${this._prefixDirectory}/${this._name}Client.ts`)
      .addField({
        name: '_instance',
        type: 'AxiosInstance',
        required: true,
        privateField: true,
      })
      .addImport({
        name: 'AxiosInstance',
        path: 'axios',
        type: ImportType.NamedImport,
      })
      .addConstructor({
        parameters: {},
        sourceCode:
          `this._instance = axios.create({\n` +
          `\t\t\tbaseURL: "${this.getBaseUrl()}",\n` +
          `\t\t});`,
      })
      .addImport({
        name: 'axios',
        path: 'axios',
        type: ImportType.DefaultImport,
      })
      .addMethod({
        name: 'axios',
        returnType: 'AxiosInstance',
        sourceCode: 'return this._instance;',
        getter: true,
        parameters: {},
      });

    const imanagerIndexFile = new TypescriptFile(
      TypescriptFileType.Index,
    ).setPath(`${this._prefixDirectory}/IManager/index.ts`);

    const managerIndexFile = new TypescriptFile(
      TypescriptFileType.Index,
    ).setPath(`${this._prefixDirectory}/Manager/index.ts`);

    for (const tag of Object.keys(tags)) {
      const operations = tags[tag];

      for (const operation of operations) {
        const abstractMethod = await this.buildAbstractMethodAsync({
          tag: tag,
          operation: operation.object,
          indexFile: imanagerIndexFile,
        });
        this.addFiles(files, abstractMethod.files);
        const axiosMethod = await this.buildAxiosMethodAsync({
          tag: tag,
          operation: operation.object,
          path: operation.path,
          method: operation.method,
          apiFile: apiFile,
          indexFile: managerIndexFile,
        });
        this.addFiles(files, axiosMethod.files);
      }
    }

    for (const indexFile of Object.values(this._indexFiles)) {
      this.addFile(files, indexFile);
    }
    for (const clientFile of Object.values(this._clientFiles)) {
      this.addFile(files, clientFile);
    }

    this.addFile(files, imanagerIndexFile);
    this.addFile(files, managerIndexFile);

    const globalIndexFile = new TypescriptFile(TypescriptFileType.Index)
      .setPath(`${this._prefixDirectory}/index.ts`)
      .addExport({
        name: '*',
        path: './IManager',
        type: ImportType.DefaultImport,
      })
      .addExport({
        name: '*',
        path: './Manager',
        type: ImportType.DefaultImport,
      })
      .addExport({
        name: `${this._name}Client`,
        path: `./${this._name}Client`,
        type: ImportType.NamedImport,
      });

    this.addFile(files, globalIndexFile);

    this.addFile(files, apiFile);

    return files;
  }

  private getBaseUrl(): string {
    const servers = this._openAPiObject.servers;
    if (servers != undefined && servers.length > 0) {
      const server = servers[0];
      const url = server.url;
      if (url.startsWith('/')) {
        return this._baseUrl + url;
      }
      return server.url;
    }
    return this._baseUrl;
  }

  private async buildAbstractMethodAsync(
    payload: BuildAbstractMethodPayload,
  ): Promise<BuildAbstractMethodResult> {
    const files: TypescriptFile[] = [];

    const tagPathName = getPathByTag(payload.tag);
    const operationPathName = getPathByOperationId(
      payload.operation.operationId,
    );
    const operationClassName = getClassNameByOperationId(
      payload.operation.operationId,
    );

    const imanagerFile = this.createIManagerFile({
      tagPathName: tagPathName,
      operationPathName: operationPathName,
      name: operationClassName,
    });
    files.push(imanagerFile);

    payload.indexFile.addExport({
      name: `*`,
      path: `./${tagPathName}`,
      type: ImportType.DefaultImport,
    });

    const operationId = getOperationId(payload.operation.operationId);
    const payloadFile = new TypescriptFile(TypescriptFileType.Interface);
    payloadFile.setName(
      `${operationClassName}${upperCaseFirstLetter(
        getOperationId(operationId),
      )}Payload`,
    );
    payloadFile.setPath(
      `${
        this._prefixDirectory
      }/IManager/${tagPathName}/${operationPathName}/Payload/${operationClassName}${upperCaseFirstLetter(
        getOperationId(operationId),
      )}Payload.ts`,
    );
    payloadFile.addField({
      name: 'where',
      type: `${operationClassName}${upperCaseFirstLetter(
        getOperationId(operationId),
      )}WherePayload`,
      required: true,
    });
    payloadFile.addImport({
      name: `${operationClassName}${upperCaseFirstLetter(
        getOperationId(operationId),
      )}WherePayload`,
      path: `./${operationClassName}${upperCaseFirstLetter(
        getOperationId(operationId),
      )}WherePayload`,
      type: ImportType.NamedImport,
    });
    const payloadWhereFile = new TypescriptFile(TypescriptFileType.Interface);
    payloadWhereFile.setName(
      `${operationClassName}${upperCaseFirstLetter(
        getOperationId(operationId),
      )}WherePayload`,
    );
    payloadWhereFile.setPath(
      `${
        this._prefixDirectory
      }/IManager/${tagPathName}/${operationPathName}/Payload/${operationClassName}${upperCaseFirstLetter(
        getOperationId(operationId),
      )}WherePayload.ts`,
    );
    const parameters = payload.operation.parameters;
    if (parameters != undefined) {
      for (const parameter of parameters) {
        const property = this.parseParameterObjectOrReferenceObject({
          tag: payload.tag,
          object: parameter,
          targetFile: payloadWhereFile,
        });
        payloadWhereFile.addField({
          name: property.name,
          type: property.type,
          required: property.required,
        });
        for (let i = 0; i < property.files.length; i++) {
          const propertyFile = property.files[i];
          propertyFile.setPath(
            `${
              this._prefixDirectory
            }/IManager/${tagPathName}/${operationPathName}/Payload/${propertyFile.getName()}.ts`,
          );
          // console.log(
          //   `${this._prefixDirectory}/IManager/${tagPathName}/${operationPathName}/Payload/${propertyFile.getName()}.ts`,
          // );
          this.addFile(files, propertyFile);
        }
      }
    }
    const requestBody = payload.operation.requestBody;
    if (requestBody != undefined) {
      const dataType = this.parseRequestBodyObjectOrReferenceObject({
        tag: payload.tag,
        object: requestBody,
        targetFile: payloadFile,
      });
      payloadFile.addField({
        name: 'data',
        type: dataType.type,
        required: true,
      });
      const dataFiles = dataType.files;
      for (let i = 0; i < dataFiles.length; i++) {
        const dtoFile = dataFiles[i];
        const dtoTypeName = dtoFile.getName();
        if (dtoTypeName != undefined) {
          dtoFile.setPath(
            `${this._prefixDirectory}/IManager/${tagPathName}/${operationPathName}/Payload/${dtoTypeName}.ts`,
          );
          this.addFile(files, dtoFile);
        }
      }
    }

    payloadFile.addImport({
      name: 'CancelTokenSource',
      path: 'axios',
      type: ImportType.NamedImport,
    });
    payloadFile.addField({
      name: 'cancelToken',
      type: 'CancelTokenSource',
      required: false,
    });

    this.addFile(files, payloadFile);
    this.addFile(files, payloadWhereFile);
    //this.addFile(files, payloadDataFile);

    const response = payload.operation.responses['200'] as
      | ResponseObject
      | ReferenceObject
      | any;

    const responseType = this.parseResponseObjectOrReferenceObject({
      tag: payload.tag,
      object: response,
      targetFile: imanagerFile,
    });

    const responseFiles = responseType.files;
    for (let i = 0; i < responseFiles.length; i++) {
      const resultFile = responseFiles[i];
      const resultTypeName = resultFile.getName();
      if (resultTypeName != undefined) {
        resultFile.setPath(
          `${this._prefixDirectory}/Result/${resultTypeName}.ts`,
        );
        this.addFile(files, resultFile);
      }
    }

    imanagerFile.addImport({
      name: `${operationClassName}${upperCaseFirstLetter(
        getOperationId(operationId),
      )}Payload`,
      path: `./Payload/${operationClassName}${upperCaseFirstLetter(
        getOperationId(operationId),
      )}Payload`,
      type: ImportType.NamedImport,
    });
    imanagerFile.addAbstractMethod({
      name: `${operationId}Async`,
      returnType: `Promise<${responseType.type}>`,
      parameters: {
        payload: `${operationClassName}${upperCaseFirstLetter(
          getOperationId(operationId),
        )}Payload`,
      },
    });

    return {
      files: files,
    };
  }

  private async buildAxiosMethodAsync(
    payload: BuildAxiosMethodPayload,
  ): Promise<BuildAxiosMethodResult> {
    const files: TypescriptFile[] = [];

    const tagPathName = getPathByTag(payload.tag);
    const operationPathName = getPathByOperationId(
      payload.operation.operationId,
    );
    const operationClassName = getClassNameByOperationId(
      payload.operation.operationId,
    );
    const managerFile = this.createManagerFile({
      tagPathName: tagPathName,
      operationPathName: operationPathName,
      name: operationClassName,
    });

    payload.indexFile.addExport({
      name: `*`,
      path: `./${tagPathName}`,
      type: ImportType.DefaultImport,
    });
    payload.apiFile.addMethod({
      name: `${lowerCaseFirstLetter(tagPathName)}`,
      returnType: `I${tagPathName}Client`,
      parameters: {},
      sourceCode: `return new ${tagPathName}Client(this._instance);`,
      getter: true,
    });
    payload.apiFile.addImport({
      name: `I${tagPathName}Client`,
      path: './index',
      type: ImportType.NamedImport,
    });
    payload.apiFile.addImport({
      name: `${tagPathName}Client`,
      path: './index',
      type: ImportType.NamedImport,
    });

    files.push(managerFile);

    const response = payload.operation.responses['200'] as
      | ResponseObject
      | ReferenceObject
      | any;

    const responseType = this.parseResponseObjectOrReferenceObject({
      tag: payload.tag,
      object: response,
      targetFile: managerFile,
    });

    const responseFiles = responseType.files;
    for (let i = 0; i < responseFiles.length; i++) {
      const resultFile = responseFiles[i];
      const resultTypeName = resultFile.getName();
      if (resultTypeName != undefined) {
        resultFile.setPath(
          `${this._prefixDirectory}/Result/${resultTypeName}.ts`,
        );
        this.addFile(files, resultFile);
      }
    }

    const operationId = getOperationId(payload.operation.operationId);
    managerFile.addImport({
      name: `${operationClassName}${upperCaseFirstLetter(
        getOperationId(operationId),
      )}Payload`,
      path: `../../../IManager/${tagPathName}/${operationPathName}/Payload/${operationClassName}${upperCaseFirstLetter(
        getOperationId(operationId),
      )}Payload`,
      type: ImportType.NamedImport,
    });

    let axiosParams: BuildAxiosParamsResult = {
      path: {},
      params: {},
    };
    const parameter = payload.operation.parameters;
    if (parameter != undefined && parameter.length > 0) {
      axiosParams = this.buildAxiosParams({
        parameters: parameter,
      });
    }
    const requestBody = payload.operation.requestBody;

    let path = payload.path;
    for (const key in axiosParams.path) {
      path = path.replace(`{${key}}`, `\${${axiosParams.path[key]}}`);
    }

    let sourceCode = `const response = await this._instance.${payload.method}<${responseType.type}>(\`${path}\`, `;

    if (payload.method === 'get' || payload.method === 'delete') {
      sourceCode += '{\n\t\t\tparams : {\n';
      for (const key in axiosParams.params) {
        const value = axiosParams.params[key];
        sourceCode += `\t\t\t\t${key} : ${value},\n`;
      }
      sourceCode += `\t\t\t},\n`;

      if (requestBody != undefined) {
        sourceCode += '\t\t\tdata : payload.data,\n';
      }
    } else {
      if (requestBody != undefined) {
        sourceCode += '\n\t\t\tpayload.data,\n';
      } else {
        sourceCode += '\n\t\t\tnull,\n';
      }
      sourceCode += '\t\t\t{';
      sourceCode += '\n\t\t\t\tparams : {\n';
      for (const key in axiosParams.params) {
        const value = axiosParams.params[key];
        sourceCode += `\t\t\t\t${key} : ${value},\n`;
      }
      sourceCode += `\t\t\t},\n`;
    }

    sourceCode += `\t\t\tcancelToken : payload.cancelToken != undefined ? payload.cancelToken.token : undefined\n`;
    sourceCode += `\t\t});\n` + '\t\treturn response.data;';

    managerFile.addMethod({
      name: `${operationId}Async`,
      returnType: `Promise<${responseType.type}>`,
      parameters: {
        payload: `${operationClassName}${upperCaseFirstLetter(
          getOperationId(operationId),
        )}Payload`,
      },
      sourceCode: sourceCode,
    });

    return {
      files: files,
    };
  }

  private buildAxiosParams(
    payload: BuildAxiosParamsPayload,
  ): BuildAxiosParamsResult {
    const reuslt: BuildAxiosParamsResult = {
      path: {},
      params: {},
    };
    for (const parameter of payload.parameters) {
      if (isReferenceObject(parameter)) {
        console.log('ReferenceObject');
      } else {
        if (parameter.in == 'query') {
          reuslt.params[parameter.name] = `payload.where.${parameter.name}`;
        } else if (parameter.in == 'path') {
          reuslt.path[parameter.name] = `payload.where.${parameter.name}`;
        } else {
          console.log(parameter.in);
        }
      }
    }
    return reuslt;
  }

  private addFiles(result: TypescriptFile[], files: TypescriptFile[]) {
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      this.addFile(result, file);
    }
  }

  private addFile(result: TypescriptFile[], file: TypescriptFile) {
    for (let i = 0; i < result.length; i++) {
      const item = result[i];
      if (item.getPath() == file.getPath()) {
        return;
      }
    }
    result.push(file);
  }

  private parseParameterObjectOrReferenceObject(
    payload: ParseParameterObjectOrReferenceObjectPayload,
  ): ParseParameterObjectOrReferenceObjectResult {
    if (isReferenceObject(payload.object)) {
      const referenceObject = payload.object;
      const referenceName = referenceObject.$ref.slice(21);
      console.log(`Reference To ${referenceName}`);
    } else {
      const parameterObject = payload.object;
      const schemaObject = parameterObject.schema;
      let required = false;
      if (parameterObject.required != undefined) {
        required = parameterObject.required;
      }
      if (schemaObject != undefined) {
        const reuslt = this.parseReferenceObjectOrSchemaObject({
          tag: payload.tag,
          fieldName: parameterObject.name,
          files: [],
          targetFile: payload.targetFile,
          object: schemaObject,
          importPrefix: './',
        });
        return {
          name: parameterObject.name,
          type: reuslt.typeName,
          required: required,
          files: reuslt.files,
        };
      }
    }

    return {
      name: '',
      type: 'void',
      required: true,
      files: [],
    };
  }

  private parseRequestBodyObjectOrReferenceObject(
    payload: ParseRequestBodyObjectOrReferenceObjectPayload,
  ): ParseRequestBodyObjectOrReferenceObjectResult {
    const files: TypescriptFile[] = [];

    if (isReferenceObject(payload.object)) {
      const referenceObject = payload.object;
      const referenceName = referenceObject.$ref.slice(21);
      console.log(`Reference To ${referenceName}`);
    } else {
      const responseObject = payload.object;
      let required = false;
      if (responseObject.required != undefined) {
        required = responseObject.required;
      }
      const contentObject = responseObject.content;
      if (contentObject != undefined) {
        const jsonSchema = contentObject['application/json'];
        if (jsonSchema != undefined) {
          const schemaObject = jsonSchema.schema;
          if (schemaObject != undefined) {
            const result = this.parseReferenceObjectOrSchemaObject({
              tag: payload.tag,
              fieldName: 'data',
              files: files,
              targetFile: payload.targetFile,
              object: schemaObject,
              importPrefix: './',
            });
            return {
              files: result.files,
              type: result.typeName,
            };
          }
        }
      }
    }

    return {
      files: files,
      type: 'void',
    };
  }

  private parseResponseObjectOrReferenceObject(
    payload: ParseResponseObjectOrReferenceObjectPayload,
  ): ParseResponseObjectOrReferenceObjectResult {
    const files: TypescriptFile[] = [];

    if (isReferenceObject(payload.object)) {
      const referenceObject = payload.object;
      const referenceName = referenceObject.$ref.slice(21);
      console.log(`Reference To ${referenceName}`);
    } else {
      const responseObject = payload.object;
      const contentObject = responseObject.content;
      if (contentObject != undefined) {
        const jsonSchema = contentObject['application/json'];
        if (jsonSchema != undefined) {
          const responseSchema = jsonSchema.schema;
          if (responseSchema != undefined) {
            const result = this.parseReferenceObjectOrSchemaObject({
              tag: payload.tag,
              files: files,
              object: responseSchema,
              targetFile: payload.targetFile,
              importPrefix: '../../../Result/',
            });
            return {
              files: files,
              type: result.typeName,
            };
          }
        }
      }
    }

    return {
      files: files,
      type: 'void',
    };
  }

  private readonly _referenceObjects: Record<
    string,
    CacheReferenceObjectResult
  > = {};

  private parseReferenceObjectOrSchemaObject(
    payload: ParseReferenceObjectOrSchemaObjectPayload,
  ): ParseReferenceObjectOrSchemaObjectResult {
    const files: TypescriptFile[] = payload.files;
    if (payload.importPrefix == undefined) {
      payload.importPrefix = './';
    }
    if (isReferenceObject(payload.object)) {
      const referenceObject = payload.object;
      const referenceName = referenceObject.$ref.slice(21);
      const cache = this._referenceObjects[referenceName];
      if (cache != undefined) {
        const targetFile = payload.targetFile;
        if (targetFile != undefined) {
          targetFile.addImport({
            name: cache.typeName,
            path: `${payload.importPrefix}${cache.typeImportName}`,
            type: ImportType.NamedImport,
          });
        }
        return {
          files: files,
          typeName: cache.typeName,
          typeImportName: cache.typeImportName,
          typeFile: cache.typeFile,
        };
      } else {
        const components = this._openAPiObject.components;
        if (components != undefined) {
          const schemas = components.schemas;
          if (schemas != undefined) {
            const schema = schemas[referenceName];
            const targetFile = payload.targetFile;
            if (targetFile != undefined) {
              targetFile.addImport({
                name: referenceName,
                path: `${payload.importPrefix}${referenceName}`,
                type: ImportType.NamedImport,
              });
            }
            const newTargetFile = new TypescriptFile(
              TypescriptFileType.Interface,
            ).setName(referenceName);
            files.push(newTargetFile);
            const reuslt = this.parseReferenceObjectOrSchemaObject({
              tag: payload.tag,
              fieldName: payload.fieldName,
              files: files,
              object: schema,
              targetFile: newTargetFile,
            });
            this._referenceObjects[referenceName] = {
              typeName: reuslt.typeName,
              typeImportName: reuslt.typeImportName,
              typeFile: reuslt.typeFile,
            };
            return reuslt;
          }
        }
      }
    } else if (isSchemaObject(payload.object)) {
      const schemaObject = payload.object;
      const genericTypeObjects = schemaObject.allOf;
      if (genericTypeObjects != undefined) {
        if (genericTypeObjects.length == 2) {
          const type = this.parseReferenceObjectOrSchemaObject({
            tag: payload.tag,
            fieldName: payload.fieldName,
            files: files,
            object: genericTypeObjects[0],
            targetFile: payload.targetFile,
            importPrefix: payload.importPrefix,
          });
          const genericTypeObject = genericTypeObjects[1];
          if (isSchemaObject(genericTypeObject)) {
            const objectType = genericTypeObject.type;
            if (objectType == 'object') {
              const properties = genericTypeObject.properties;
              if (properties != undefined) {
                const propertieKeys = Object.keys(properties);
                if (propertieKeys.length == 1) {
                  const propertieKey = propertieKeys[0];
                  const propertieValue = properties[propertieKey];
                  const genericType = this.parseReferenceObjectOrSchemaObject({
                    tag: payload.tag,
                    fieldName: propertieKey,
                    files: files,
                    object: propertieValue,
                    targetFile: payload.targetFile,
                    importPrefix: payload.importPrefix,
                  });
                  if (type.typeFile != undefined) {
                    type.typeFile.addGenericType('T');
                    type.typeFile.addField({
                      name: propertieKey,
                      type: 'T',
                      required:
                        genericTypeObject.nullable != undefined
                          ? !genericTypeObject.nullable
                          : true,
                    });
                  }
                  return {
                    files: files,
                    typeImportName: type.typeName,
                    typeName: `${type.typeName}<${genericType.typeName}>`,
                  };
                }
              }
            }
          }
        }
        console.log('unhandle GenericTypeObject', genericTypeObjects);
      } else {
        const type = schemaObject.type;
        switch (type) {
          case 'string':
            const enums = schemaObject.enum;
            if (enums != undefined) {
              const fieldName = payload.fieldName;
              if (fieldName != undefined) {
                const enumClassName = `${payload.tag}${upperCaseFirstLetter(
                  fieldName,
                )}`;
                const enumClass = new TypescriptFile(TypescriptFileType.Enum);
                enumClass.setName(enumClassName);
                for (let i = 0; i < enums.length; i++) {
                  const enumValue = enums[i];
                  enumClass.addEnumValue(enumValue, enumValue);
                }
                files.push(enumClass);
                const targetFile = payload.targetFile;
                if (targetFile != undefined) {
                  targetFile.addImport({
                    name: enumClassName,
                    path: `./${enumClassName}`,
                    type: ImportType.NamedImport,
                  });
                }

                return {
                  files: files,
                  typeImportName: enumClassName,
                  typeName: enumClassName,
                };
              }
            } else {
              if (schemaObject.format!=undefined) {
                switch (schemaObject.format) {
                  case 'date-time':
                    return {
                      files: files,
                      typeImportName: "Date",
                      typeName: "Date",
                    };
                }
              }
              return {
                files: files,
                typeImportName: type,
                typeName: type,
              };
            }
            break;
          case 'number':
          case 'boolean':
            return {
              files: files,
              typeImportName: type,
              typeName: type,
            };
          case 'object':
            const objectFile = payload.targetFile;
            if (objectFile != undefined) {
              const properties = schemaObject.properties;
              const additionalProperties = schemaObject.additionalProperties;
              if (properties != undefined) {
                const requiredList = schemaObject.required;
                const propertieKeys = Object.keys(properties);
                for (let i = 0; i < propertieKeys.length; i++) {
                  const propertieKey = propertieKeys[i];
                  const propertieValue = properties[propertieKey];
                  const field = this.parseReferenceObjectOrSchemaObject({
                    tag: payload.tag,
                    fieldName: propertieKey,
                    files: files,
                    object: propertieValue,
                    targetFile: objectFile,
                  });
                  let isRequired = false;
                  if (requiredList != undefined) {
                    isRequired = requiredList.includes(propertieKey);
                  }
                  // console.log('propertieKey', propertieKey);
                  // console.log('field', field.typeName);
                  objectFile.addField({
                    name: propertieKey,
                    type: field.typeName,
                    required: isRequired,
                  });
                }
              } else if (additionalProperties != undefined) {
                if (typeof additionalProperties != 'boolean') {
                  const additionalPropertiesType =
                    this.parseReferenceObjectOrSchemaObject({
                      tag: payload.tag,
                      fieldName: '',
                      files: files,
                      object: additionalProperties,
                    });
                  return {
                    files: files,
                    typeImportName: `Record<string, ${additionalPropertiesType.typeName}>`,
                    typeName: `Record<string, ${additionalPropertiesType.typeName}>`,
                  };
                }
                return {
                  files: files,
                  typeImportName: 'Record<string, string>',
                  typeName: 'Record<string, string>',
                };
              }
              const fileName = objectFile.getName();
              if (fileName != undefined) {
                return {
                  files: files,
                  typeImportName: fileName,
                  typeName: fileName,
                  typeFile: objectFile,
                };
              }
            } else {
              console.log(schemaObject);
              console.log('targetfile is missing');
            }
            break;
          case 'array':
            const arrayItems = schemaObject.items;
            if (arrayItems != undefined) {
              const arrayItemType = this.parseReferenceObjectOrSchemaObject({
                tag: payload.tag,
                fieldName: payload.fieldName,
                files: files,
                object: arrayItems,
                targetFile: payload.targetFile,
                importPrefix: payload.importPrefix,
              });
              return {
                files: files,
                typeImportName: arrayItemType.typeName,
                typeName: `${arrayItemType.typeName}[]`,
              };
            }
            break;
        }
      }
    }

    return {
      files: files,
      typeImportName: 'void',
      typeName: 'void',
    };
  }

  private _indexFiles: Record<string, TypescriptFile> = {};

  private createIndexFile(payload: CreateIndexFilePayload): TypescriptFile {
    const path = `${this._prefixDirectory}/${payload.type}/${payload.tagPathName}/index.ts`;
    const result = this._indexFiles[path];
    if (result == undefined) {
      const indexFile = new TypescriptFile(TypescriptFileType.Index).setPath(
        path,
      );
      this._indexFiles[path] = indexFile;
      return indexFile;
    }
    return result;
  }

  private _clientFiles: Record<string, TypescriptFile> = {};

  private createAbstractClientFile(
    payload: CreateAbstractClientFilePayload,
  ): TypescriptFile {
    const path = `${this._prefixDirectory}/IManager/${payload.tagPathName}/I${payload.tagPathName}Client.ts`;
    const result = this._clientFiles[path];
    if (result == undefined) {
      const clientFile = new TypescriptFile(TypescriptFileType.AbstractClass)
        .setName(`I${payload.tagPathName}Client`)
        .setPath(path);

      payload.indexFile.addExport({
        name: `I${payload.tagPathName}Client`,
        path: `./I${payload.tagPathName}Client.ts`,
        type: ImportType.NamedImport,
      });

      this._clientFiles[path] = clientFile;
      return clientFile;
    }
    return result;
  }

  private createClientFile(payload: CreateClientFilePayload): TypescriptFile {
    const path = `${this._prefixDirectory}/Manager/${payload.tagPathName}/${payload.tagPathName}Client.ts`;
    const result = this._clientFiles[path];
    if (result == undefined) {
      const clientFile = new TypescriptFile(TypescriptFileType.Class)
        .setName(`${payload.tagPathName}Client`)
        .setPath(path)
        .addField({
          name: '_instance',
          type: 'AxiosInstance',
          required: true,
          privateField: true,
        })
        .addImport({
          name: 'AxiosInstance',
          path: 'axios',
          type: ImportType.NamedImport,
        })
        .addConstructor({
          parameters: {
            instance: 'AxiosInstance',
          },
          sourceCode: 'this._instance = instance',
        });

      payload.indexFile.addExport({
        name: `${payload.tagPathName}Client`,
        path: `./${payload.tagPathName}Client.ts`,
        type: ImportType.NamedImport,
      });

      this._clientFiles[path] = clientFile;
      return clientFile;
    }
    return result;
  }

  private _imanagerFiles: Record<string, TypescriptFile> = {};

  private createIManagerFile(
    payload: CreateIManagerFilePayload,
  ): TypescriptFile {
    const path = `${this._prefixDirectory}/IManager/${payload.tagPathName}/${payload.operationPathName}/I${payload.name}Manager.ts`;
    let result = this._imanagerFiles[path];

    const indexFile = this.createIndexFile({
      type: 'IManager',
      tagPathName: payload.tagPathName,
    });

    if (result == undefined) {
      const imanagerFile = new TypescriptFile(TypescriptFileType.AbstractClass)
        .setPath(path)
        .setName(`I${payload.name}Manager`);
      this._imanagerFiles[path] = imanagerFile;

      indexFile.addExport({
        name: `I${payload.name}Manager`,
        path: `./${payload.operationPathName}/I${payload.name}Manager.ts`,
        type: ImportType.NamedImport,
      });

      result = imanagerFile;
    }

    const clientFile = this.createAbstractClientFile({
      tagPathName: payload.tagPathName,
      indexFile: indexFile,
    });
    clientFile.addAbstractMethod({
      name: `${lowerCaseFirstLetter(payload.name)}`,
      returnType: `I${payload.name}Manager`,
      parameters: {},
      getter: true,
    });
    clientFile.addImport({
      name: `I${payload.name}Manager`,
      path: `../../index`,
      type: ImportType.NamedImport,
    });

    return result;
  }

  private _managerFiles: Record<string, TypescriptFile> = {};
  private createManagerFile(payload: CreateManagerFilePayload): TypescriptFile {
    const path = `${this._prefixDirectory}/Manager/${payload.tagPathName}/${payload.operationPathName}/${payload.name}Manager.ts`;
    let result = this._managerFiles[path];

    const indexFile = this.createIndexFile({
      type: 'Manager',
      tagPathName: payload.tagPathName,
    });

    if (result == undefined) {
      const managerFile = new TypescriptFile(TypescriptFileType.Class)
        .setPath(path)
        .addImplement(`I${payload.name}Manager`)
        .addImport({
          name: `I${payload.name}Manager`,
          path: `../../../IManager/${payload.tagPathName}/${payload.operationPathName}/I${payload.name}Manager`,
          type: ImportType.NamedImport,
        })
        .addField({
          name: '_instance',
          type: 'AxiosInstance',
          required: true,
          privateField: true,
        })
        .addImport({
          name: 'AxiosInstance',
          path: 'axios',
          type: ImportType.NamedImport,
        })
        .addConstructor({
          parameters: {
            instance: 'AxiosInstance',
          },
          sourceCode: 'this._instance = instance',
        })
        .setName(`${payload.name}Manager`);
      this._managerFiles[path] = managerFile;
      result = managerFile;

      indexFile.addExport({
        name: `${payload.name}Manager`,
        path: `./${payload.operationPathName}/${payload.name}Manager.ts`,
        type: ImportType.NamedImport,
      });
    }

    const clientFile = this.createClientFile({
      tagPathName: payload.tagPathName,
      indexFile: indexFile,
    });
    clientFile.addMethod({
      name: `${lowerCaseFirstLetter(payload.name)}`,
      returnType: `I${payload.name}Manager`,
      parameters: {},
      sourceCode: `return new ${payload.name}Manager(this._instance);`,
      getter: true,
    });
    clientFile.addImport({
      name: `I${payload.name}Manager`,
      path: `../../index`,
      type: ImportType.NamedImport,
    });
    clientFile.addImport({
      name: `${payload.name}Manager`,
      path: `../../index`,
      type: ImportType.NamedImport,
    });

    return result;
  }
}
