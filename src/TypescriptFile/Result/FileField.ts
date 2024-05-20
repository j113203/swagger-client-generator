export class FileField {
  name: string;
  type: string;
  required: boolean;
  privateField: boolean;

  constructor(name: string, type: string, required: boolean, privateField: boolean) {
    this.name = name;
    this.type = type;
    this.required = required;
    this.privateField = privateField;
  }
}
