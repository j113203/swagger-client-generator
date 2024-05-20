import TypescriptFile from "../../TypescriptFile/TypescriptFile";

export class BuildAbstractMethodResult {
  files: TypescriptFile[];

  constructor(files: TypescriptFile[]) {
    this.files = files;
  }
}
