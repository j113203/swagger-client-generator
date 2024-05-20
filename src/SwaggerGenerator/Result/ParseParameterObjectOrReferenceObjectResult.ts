import TypescriptFile from "../../TypescriptFile/TypescriptFile";

export class ParseParameterObjectOrReferenceObjectResult {
  name: string;
  type: string;
  required: boolean;
  files: TypescriptFile[];

  constructor(
    name: string,
    type: string,
    reuqired: boolean,
    file: TypescriptFile[]
  ) {
    this.name = name;
    this.type = type;
    this.required = reuqired;
    this.files = file;
  }
}
