export class AddConstructorPayload {
  parameters: Record<string, string>;
  sourceCode: string;

  constructor(parameters: Record<string, string>, sourceCode: string) {
    this.parameters = parameters;
    this.sourceCode = sourceCode;
  }
}
