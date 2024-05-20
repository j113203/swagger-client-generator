import { ImportType } from "../Payload/ImportType";

export class FileImport {
  name: string;
  type: ImportType;

  constructor(name: string, type: ImportType) {
    this.name = name;
    this.type = type;
  }
}
