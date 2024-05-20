import { ReferenceObject, SchemaObject } from "openapi3-ts/oas30";
import TypescriptFile from "../../TypescriptFile/TypescriptFile";

export class ParseReferenceObjectOrSchemaObjectPayload {
  files: TypescriptFile[];
  targetFile?: TypescriptFile;
  importPrefix?: string;
  object: SchemaObject | ReferenceObject;
  tag: string;
  fieldName?: string;

  constructor(
    files: TypescriptFile[],
    object: SchemaObject | ReferenceObject,
    tag: string,
  ) {
    this.files = files;
    this.object = object;
    this.tag = tag;
  }
}
