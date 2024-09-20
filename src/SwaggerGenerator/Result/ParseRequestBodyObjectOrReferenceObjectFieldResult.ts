import TypescriptFile from "src/TypescriptFile/TypescriptFile";

export class ParseRequestBodyObjectOrReferenceObjectFieldResult {
  name: string;
  type: string;
  required: boolean;
  files: TypescriptFile[];

  constructor(
    name: string,
    type: string,
    reuqired: boolean,
    file: TypescriptFile[],
  ) {
    this.name = name;
    this.type = type;
    this.required = reuqired;
    this.files = file;
  }
}
