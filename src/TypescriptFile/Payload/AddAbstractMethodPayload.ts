export class AddAbstractMethodPayload {
  name: string;
  returnType: string;
  parameters: Record<string, string>;
  getter?: boolean;

  constructor(
    name: string,
    returnType: string,
    parameters: Record<string, string>
  ) {
    this.name = name;
    this.returnType = returnType;
    this.parameters = parameters;
  }
}
