import { ReferenceObject, RequestBodyObject } from 'openapi3-ts/oas30';
import TypescriptFile from 'src/TypescriptFile/TypescriptFile';

export class ParseRequestBodyObjectOrReferenceObjectPayload {
  tag: string;
  object: RequestBodyObject | ReferenceObject;
  targetFile: TypescriptFile;

  constructor(
    tag: string,
    object: RequestBodyObject | ReferenceObject,
    targetFile: TypescriptFile,
  ) {
    this.tag = tag;
    this.object = object;
    this.targetFile = targetFile;
  }
}
