import TypescriptFile from "../../TypescriptFile/TypescriptFile";

export class BuildAxiosMethodResult {
  files: TypescriptFile[];

  constructor(files: TypescriptFile[]) {
    this.files = files;
  }
}
