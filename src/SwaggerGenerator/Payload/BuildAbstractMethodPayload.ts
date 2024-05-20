import { OperationObject } from "openapi3-ts/oas30";
import TypescriptFile from "../../TypescriptFile/TypescriptFile";

export class BuildAbstractMethodPayload {
  file: TypescriptFile;
  tag: string;
  operation: OperationObject;

  constructor(
    file: TypescriptFile,
    tag: string,
    operation: OperationObject
  ) {
    this.file = file;
    this.tag = tag;
    this.operation = operation;
  }
}
