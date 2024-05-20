import { AddAbstractMethodPayload } from "./AddAbstractMethodPayload";

export class AddMethodPayload extends AddAbstractMethodPayload {
  sourceCode: string;

  constructor(
    name: string,
    returnType: string,
    parameters: Record<string, string>,
    sourceCode: string
  ) {
    super(name, returnType, parameters);
    this.sourceCode = sourceCode;
  }
}
