import { OperationObject } from 'openapi3-ts/oas30';
import TypescriptFile from '../../TypescriptFile/TypescriptFile';

export class BuildAxiosMethodPayload {
  tag: string;
  path: string;
  method: string;
  operation: OperationObject;
  indexFile: TypescriptFile;
  apiFile: TypescriptFile;

  constructor(
    tag: string,
    path: string,
    method: string,
    operation: OperationObject,
    indexFile: TypescriptFile,
    apiFile: TypescriptFile
  ) {
    this.tag = tag;
    this.path = path;
    this.method = method;
    this.operation = operation;
    this.indexFile = indexFile;
    this.apiFile = apiFile;
  }
}
