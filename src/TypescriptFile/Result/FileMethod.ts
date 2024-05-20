export class FileMethod {
  name: string;
  returnType: string;
  parameters: Record<string, string>;
  abstract: boolean;
  sourceCode?: string;
  getter: boolean;

  constructor(
    name: string,
    returnType: string,
    parameters: Record<string, string>,
    abstract: boolean,
    getter: boolean
  ) {
    this.name = name;
    this.returnType = returnType;
    this.parameters = parameters;
    this.abstract = abstract;
    this.getter = getter;
  }
}
