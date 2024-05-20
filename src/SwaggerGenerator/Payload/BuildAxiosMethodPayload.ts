import { OperationObject } from 'openapi3-ts/oas30';
import TypescriptFile from '../../TypescriptFile/TypescriptFile';

export class BuildAxiosMethodPayload {
  file: TypescriptFile;
  tag: string;
  path: string;
  method: string;
  operation: OperationObject;

  constructor(
    file: TypescriptFile,
    tag: string,
    path: string,
    method: string,
    operation: OperationObject,
  ) {
    this.file = file;
    this.tag = tag;
    this.path = path;
    this.method = method;
    this.operation = operation;
  }
}
