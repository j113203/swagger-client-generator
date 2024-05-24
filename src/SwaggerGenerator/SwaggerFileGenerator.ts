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
  getOperationId,
  getTagName,
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
      const imanagerFile = new TypescriptFile(TypescriptFileType.AbstractClass)
        .setPath(
          `${this._prefixDirectory}/IManager/${tagName}/I${tagName}Manager.ts`,
        )
        .setName(`I${tagName}Manager`);
      imanagerIndexFile.addExport({
        name: `I${tagName}Manager`,
        path: `./${tagName}/I${tagName}Manager`,
        type: ImportType.NamedImport,
      });
      const managerFile = new TypescriptFile(TypescriptFileType.Class)
        .setPath(
          `${this._prefixDirectory}/Manager/${tagName}/${tagName}Manager.ts`,
        )
        .addImplement(`I${tagName}Manager`)
        .addImport({
          name: `I${tagName}Manager`,
          path: `../../IManager/${tagName}/I${tagName}Manager`,
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
        .setName(`${tagName}Manager`);
      managerIndexFile.addExport({
        name: `${tagName}Manager`,
        path: `./${tagName}/${tagName}Manager`,
        type: ImportType.NamedImport,
      });

      const operations = tags[tag];

      for (const operation of operations) {
        const abstractMethod = await this.buildAbstractMethodAsync({
          file: imanagerFile,
          tag: tag,
          operation: operation.object,
        });
        this.addFiles(files, abstractMethod.files);
        const axiosMethod = await this.buildAxiosMethodAsync({
          file: managerFile,
          tag: tag,
          operation: operation.object,
          path: operation.path,
          method: operation.method,
        });
        this.addFiles(files, axiosMethod.files);
      }

      apiFile.addMethod({
        name: `${lowerCaseFirstLetter(tagName)}`,
        returnType: `I${tagName}Manager`,
        parameters: {},
        sourceCode: `return new ${tagName}Manager(this._instance);`,
        getter: true,
      });
      apiFile.addImport({
        name: `I${tagName}Manager`,
        path: './IManager',
        type: ImportType.NamedImport,
      });
      apiFile.addImport({
        name: `${tagName}Manager`,
        path: './Manager',
        type: ImportType.NamedImport,
      });

      this.addFile(files, imanagerFile);
      this.addFile(files, managerFile);
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

    const tagName = getTagName(payload.tag);

    const parameters = payload.operation.parameters;
    const payloadFile = new TypescriptFile(TypescriptFileType.Interface);
    payloadFile.setName(`${tagName}Payload`);
    payloadFile.setPath(
      `${this._prefixDirectory}/IManager/${tagName}/Payload/${tagName}Payload.ts`,
    );
    if (parameters != undefined) {
      for (const parameter of parameters) {
        const property = this.parseParameterObjectOrReferenceObject({
          tag: payload.tag,
          object: parameter,
          targetFile: payloadFile,
        });
        payloadFile.addField({
          name: property.name,
          type: property.type,
          required: property.required,
        });
        for (let i = 0; i < property.files.length; i++) {
          const propertyFile = property.files[i];
          propertyFile.setPath(
            `${
              this._prefixDirectory
            }/IManager/${tagName}/Payload/${propertyFile.getName()}.ts`,
          );
          this.addFile(files, propertyFile);
        }
      }
    }
    this.addFile(files, payloadFile);

    const response = payload.operation.responses['200'] as
      | ResponseObject
      | ReferenceObject
      | any;

    const responseType = this.parseResponseObjectOrReferenceObject({
      tag: payload.tag,
      object: response,
      targetFile: payload.file,
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
    payload.file.addImport({
      name: `${tagName}Payload`,
      path: `./Payload/${tagName}Payload`,
      type: ImportType.NamedImport,
    });
    payload.file.addAbstractMethod({
      name: `${operationId}Async`,
      returnType: `Promise<${responseType.type}>`,
      parameters: {
        payload: `${tagName}Payload`,
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
    const tagName = getTagName(payload.tag);

    const response = payload.operation.responses['200'] as
      | ResponseObject
      | ReferenceObject
      | any;

    const responseType = this.parseResponseObjectOrReferenceObject({
      tag: payload.tag,
      object: response,
      targetFile: payload.file,
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
    payload.file.addImport({
      name: `${tagName}Payload`,
      path: `../../IManager/${tagName}/Payload/${tagName}Payload`,
      type: ImportType.NamedImport,
    });

    let sourceCode = `const response = await this._instance.${payload.method}<${responseType.type}>("${payload.path}", {`;

    const parameter = payload.operation.parameters;
    if (parameter != undefined && parameter.length > 0) {
      sourceCode += '\n\t\t\tparams : {\n';
      const axiosParams = this.buildAxiosParams({
        parameters: parameter,
      });
      for (const key in axiosParams) {
        const value = axiosParams[key];
        sourceCode += `\t\t\t\t${key} : ${value},\n`;
      }
      sourceCode += `\t\t\t}\n`;
    } else {
      sourceCode += `\n`;
    }

    sourceCode += `\t\t});\n` + '\t\treturn response.data;';

    payload.file.addMethod({
      name: `${operationId}Async`,
      returnType: `Promise<${responseType.type}>`,
      parameters: {
        payload: `${tagName}Payload`,
      },
      sourceCode: sourceCode,
    });

    return {
      files: files,
    };
  }

  private buildAxiosParams(
    payload: BuildAxiosParamsPayload,
  ): Record<string, string> {
    const reuslt: Record<string, string> = {};
    for (const parameter of payload.parameters) {
      if (isReferenceObject(parameter)) {
        console.log('ReferenceObject');
      } else {
        reuslt[parameter.name] = `payload.${parameter.name}`;
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
              importPrefix: '../../Result/',
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
                      required: true,
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
        console.log('unhandle GenericTypeObject');
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
                  objectFile.addField({
                    name: propertieKey,
                    type: field.typeName,
                    required: isRequired,
                  });
                }
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
}
