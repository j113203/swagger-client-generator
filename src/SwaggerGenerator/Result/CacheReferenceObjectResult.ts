import TypescriptFile from "../../TypescriptFile/TypescriptFile";

export class CacheReferenceObjectResult {
  typeName: string;
  typeImportName: string;
  typeFile?: TypescriptFile;

  constructor(typeName: string, typeImportName: string) {
    this.typeName = typeName;
    this.typeImportName = typeImportName;
  }
}
