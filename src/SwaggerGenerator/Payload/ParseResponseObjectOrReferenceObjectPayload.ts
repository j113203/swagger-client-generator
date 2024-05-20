import { ReferenceObject, ResponseObject } from "openapi3-ts/oas30";
import TypescriptFile from "../../TypescriptFile/TypescriptFile";

export class ParseResponseObjectOrReferenceObjectPayload {
  tag: string;
  object: ResponseObject | ReferenceObject;
  targetFile: TypescriptFile;

  constructor(
    tag: string,
    object: ResponseObject | ReferenceObject,
    targetFile: TypescriptFile
  ) {
    this.tag = tag;
    this.object = object;
    this.targetFile = targetFile;
  }
}
