import TypescriptFile from "src/TypescriptFile/TypescriptFile";

export class CreateAbstractClientFilePayload {
  tagPathName: string;
  indexFile: TypescriptFile;

  constructor(tagPathName: string, indexFile: TypescriptFile) {
    this.tagPathName = tagPathName;
    this.indexFile = indexFile;
  }
}
