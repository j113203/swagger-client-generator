import { ParameterObject, ReferenceObject } from 'openapi3-ts/oas30';
import TypescriptFile from '../../TypescriptFile/TypescriptFile';

export class ParseParameterObjectOrReferenceObjectPayload {
  tag: string;
  object: ParameterObject | ReferenceObject;
  targetFile: TypescriptFile;

  constructor(
    tag: string,
    object: ParameterObject | ReferenceObject,
    targetFile: TypescriptFile,
  ) {
    this.tag = tag;
    this.object = object;
    this.targetFile = targetFile;
  }
}
