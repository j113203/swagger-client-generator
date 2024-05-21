import { ParameterObject, ReferenceObject } from 'openapi3-ts/oas30';

export class BuildAxiosParamsPayload {
  parameters: (ParameterObject | ReferenceObject)[];

  constructor(parameters: (ParameterObject | ReferenceObject)[]) {
    this.parameters = parameters;
  }
}
