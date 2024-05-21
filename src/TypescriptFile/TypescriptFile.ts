import { FileMethod } from './Result/FileMethod';
import { TypescriptFileType } from './TypescriptFileType';
import { FileField } from './Result/FileField';
import { FileEnum } from './Result/FileEnum';
import * as path from 'path';
import * as fs from 'fs';
import { AddMethodPayload } from './Payload/AddMethodPayload';
import { AddAbstractMethodPayload } from './Payload/AddAbstractMethodPayload';
import { AddImportPayload } from './Payload/AddImportPayload';
import { FileImport } from './Result/FileImport';
import { ImportType } from './Payload/ImportType';
import { AddFieldPayload } from './Payload/AddFieldPayload';
import { AddConstructorPayload } from './Payload/AddConstructorPayload';
import { FileConstructor } from './Result/FileConstructor';

export default class TypescriptFile {
  constructor(type: TypescriptFileType) {
    this._type = type;
  }

  private _type: TypescriptFileType = TypescriptFileType.Class;
  private _name?: string;
  private _path?: string;
  private _methods: FileMethod[] = [];
  private _fields: FileField[] = [];
  private _enums: FileEnum[] = [];
  private _imports: Record<string, FileImport[]> = {};
  private _exports: Record<string, FileImport[]> = {};
  private _genericTypes: string[] = [];
  private _implements: string[] = [];
  private _constructor: FileConstructor[] = [];

  getPath(): string | undefined {
    return this._path;
  }

  getName(): string | undefined {
    return this._name;
  }

  addAbstractMethod(payload: AddAbstractMethodPayload): TypescriptFile {
    this._methods.push({
      name: payload.name,
      returnType: payload.returnType,
      parameters: payload.parameters,
      abstract: true,
      getter: false,
    });
    return this;
  }

  addMethod(payload: AddMethodPayload): TypescriptFile {
    this._methods.push({
      name: payload.name,
      returnType: payload.returnType,
      parameters: payload.parameters,
      sourceCode: payload.sourceCode,
      abstract: false,
      getter: payload.getter ?? false,
    });
    return this;
  }

  addField(payload: AddFieldPayload): TypescriptFile {
    const exist = this._fields.find((x) => x.name == payload.name);
    if (exist != undefined) {
      exist.type = payload.type;
      exist.required = payload.required;
      exist.privateField = payload.privateField ?? false;
    } else {
      this._fields.push(
        new FileField(
          payload.name,
          payload.type,
          payload.required,
          payload.privateField ?? false,
        ),
      );
    }
    return this;
  }

  addImport(payload: AddImportPayload): TypescriptFile {
    const item = this._imports[payload.path];
    if (item == undefined) {
      this._imports[payload.path] = [
        {
          name: payload.name,
          type: payload.type,
        },
      ];
    } else {
      const exist = item.some(
        (x) => x.name == payload.name && x.type == payload.type,
      );
      if (!exist) {
        item.push({
          name: payload.name,
          type: payload.type,
        });
      }
    }
    return this;
  }

  addExport(payload: AddImportPayload): TypescriptFile {
    const item = this._exports[payload.path];
    if (item == undefined) {
      this._exports[payload.path] = [
        {
          name: payload.name,
          type: payload.type,
        },
      ];
    } else {
      item.push({
        name: payload.name,
        type: payload.type,
      });
    }
    return this;
  }

  addEnumValue(name: string, value: string): TypescriptFile {
    this._enums.push(new FileEnum(name, value));
    return this;
  }

  setName(name: string): TypescriptFile {
    this._name = name;
    return this;
  }

  setPath(path: string): TypescriptFile {
    this._path = path;
    return this;
  }

  addGenericType(type: string): TypescriptFile {
    if (!this._genericTypes.includes(type)) {
      this._genericTypes.push(type);
    }
    return this;
  }

  addImplement(name: string): TypescriptFile {
    this._implements.push(name);
    return this;
  }

  addConstructor(payload: AddConstructorPayload): TypescriptFile {
    this._constructor.push({
      parameters: payload.parameters,
      sourceCode: payload.sourceCode,
    });
    return this;
  }

  async writeAsync(): Promise<boolean> {
    const filePath = this._path;

    let result = ``;

    if (filePath != undefined) {
      switch (this._type) {
        case TypescriptFileType.Class:
        case TypescriptFileType.AbstractClass:
        case TypescriptFileType.Interface:
        case TypescriptFileType.Enum:
          const name = this._name;
          if (name != undefined) {
            for (const key in this._imports) {
              const item = this._imports[key];

              result += `import `;

              const allDefaultImport = item.every(
                (x) => x.type == ImportType.DefaultImport,
              );
              if (allDefaultImport) {
                result += `${item
                  .map((x) => {
                    return `${x.name}`;
                  })
                  .join(', ')}`;
              }

              const allNamedImport = item.every(
                (x) => x.type == ImportType.NamedImport,
              );
              if (allNamedImport) {
                result += `{ ${item
                  .map((x) => {
                    return `${x.name}`;
                  })
                  .join(', ')} }`;
              }

              if (!allDefaultImport && !allNamedImport) {
                const allDefaultImportItem = item.filter(
                  (x) => x.type == ImportType.DefaultImport,
                );
                result += `${allDefaultImportItem
                  .map((x) => {
                    return `${x.name}`;
                  })
                  .join(', ')}`;

                const allNamedImportItem = item.filter(
                  (x) => x.type == ImportType.NamedImport,
                );

                if (
                  allDefaultImportItem.length > 0 &&
                  allNamedImportItem.length > 0
                ) {
                  result += ` , `;
                }

                result += `{ ${allNamedImportItem
                  .map((x) => {
                    return `${x.name}`;
                  })
                  .join(', ')} }`;
              }

              result += ` from "${key}";\n`;
            }

            if (this._genericTypes.length > 0) {
              result += `export ${this._type} ${name}<${this._genericTypes
                .map((x) => x)
                .join(',')}>`;
            } else {
              result += `export ${this._type} ${name}`;
            }

            if (this._implements.length > 0) {
              result += ` implements ${this._implements.join(',')}{\n`;
            } else {
              result += ` {\n`;
            }

            if (this._fields.length > 0) {
              for (const field of this._fields) {
                result += `\t`;
                if (field.privateField) {
                  result += 'private ';
                }
                result += `${field.name}${field.required ? '' : '?'}: ${
                  field.type
                };\n`;
              }
              result += `\n`;
            }

            for (const constructor of this._constructor) {
              result += `\tconstructor(`;
              result += Object.keys(constructor.parameters)
                .map((key) => `${key}: ${constructor.parameters[key]}`)
                .join(', ');
              result += `) {\n`;
              result += `\t\t${constructor.sourceCode}\n`;
              result += `\t}\n`;
            }

            for (const method of this._methods) {
              result += `\t`;
              if (method.abstract) {
                result += 'abstract ';
              } else {
                if (method.getter) {
                  result += `get `;
                }
                if (
                  method.returnType.startsWith('Promise<') &&
                  method.returnType.endsWith('>')
                ) {
                  result += `async `;
                }
              }
              result += `${method.name}(`;
              result += Object.keys(method.parameters)
                .map((key) => `${key}: ${method.parameters[key]}`)
                .join(', ');
              result += `): ${method.returnType}`;

              if (method.abstract) {
                result += `;\n`;
              } else {
                result += `\t{\n`;
                const sourceCode = method.sourceCode;
                if (sourceCode != undefined) {
                  result += `\t\t${sourceCode}`;
                } else {
                  result += `\t\tthrow new Error("Method not implemented.");`;
                }
                result += `\n\t}\n`;
              }

              result += `\n`;
            }

            for (const enumValue of this._enums) {
              result += `\t ${enumValue.name} = "${enumValue.value}",\n`;
            }

            result += '}';
          }
          break;
        case TypescriptFileType.Index:
          for (const key in this._exports) {
            const item = this._exports[key];

            result += `export `;

            const allDefaultImport = item.every(
              (x) => x.type == ImportType.DefaultImport,
            );
            if (allDefaultImport) {
              result += `${item
                .map((x) => {
                  return `${x.name}`;
                })
                .join(', ')}`;
            }

            const allNamedImport = item.every(
              (x) => x.type == ImportType.NamedImport,
            );
            if (allNamedImport) {
              result += `{ ${item
                .map((x) => {
                  return `${x.name}`;
                })
                .join(', ')} }`;
            }

            result += ` from "${key}";\n`;
          }
          break;
      }

      const directoryPath = path.dirname(filePath);
      if (!fs.existsSync(directoryPath)) {
        await fs.promises.mkdir(directoryPath, { recursive: true });
      }
      await fs.promises.writeFile(filePath, result);

      return true;
    }
    return false;
  }
}
