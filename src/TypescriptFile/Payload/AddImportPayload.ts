import { ImportType } from "./ImportType";

export class AddImportPayload {
  name: string;
  path: string;
  type: ImportType;

  constructor(name: string, path: string, type: ImportType) {
    this.name = name;
    this.path = path;
    this.type = type;
  }
}
