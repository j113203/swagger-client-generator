import TypescriptFile from 'src/TypescriptFile/TypescriptFile';

export class ParseRequestBodyObjectOrReferenceObjectResult {
  type: string;
  files: TypescriptFile[];

  constructor(type: string, files: TypescriptFile[]) {
    this.type = type;
    this.files = files;
  }
}
