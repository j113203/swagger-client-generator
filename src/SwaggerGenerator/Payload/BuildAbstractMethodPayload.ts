import { OperationObject } from 'openapi3-ts/oas30';
import TypescriptFile from 'src/TypescriptFile/TypescriptFile';

export class BuildAbstractMethodPayload {
  tag: string;
  operation: OperationObject;
  indexFile: TypescriptFile;

  constructor(
    tag: string,
    operation: OperationObject,
    indexFile: TypescriptFile,
  ) {
    this.tag = tag;
    this.operation = operation;
    this.indexFile = indexFile;
  }
}
