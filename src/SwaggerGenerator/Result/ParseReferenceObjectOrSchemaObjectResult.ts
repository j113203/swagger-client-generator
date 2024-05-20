import TypescriptFile from "../../TypescriptFile/TypescriptFile";

export class ParseReferenceObjectOrSchemaObjectResult {
  files: TypescriptFile[];

  typeName: string;
  typeImportName: string;
  typeFile?: TypescriptFile;

  constructor(files: TypescriptFile[], typeName: string, typeImportName: string) {
    this.files = files;
    this.typeName = typeName;
    this.typeImportName = typeImportName;
  }
}
