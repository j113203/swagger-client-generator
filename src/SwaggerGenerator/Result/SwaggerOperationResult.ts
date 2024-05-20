import { OperationObject } from "openapi3-ts/oas30";

export class SwaggerOperationResult {
  path: string;
  method: string;
  object: OperationObject;

  constructor(path: string, method: string, object: OperationObject) {
    this.path = path;
    this.method = method;
    this.object = object;
  }
}
