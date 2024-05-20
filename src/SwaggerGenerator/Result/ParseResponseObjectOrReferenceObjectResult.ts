import TypescriptFile from "../../TypescriptFile/TypescriptFile";

export class ParseResponseObjectOrReferenceObjectResult {
  type: string;
  files: TypescriptFile[];

  constructor(type: string, files: TypescriptFile[]) {
    this.type = type;
    this.files = files;
  }
}
