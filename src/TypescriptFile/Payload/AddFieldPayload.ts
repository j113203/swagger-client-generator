export class AddFieldPayload {
  name: string;
  type: string;
  required: boolean;
  privateField?: boolean;

  constructor(name: string, type: string, required: boolean) {
    this.name = name;
    this.type = type;
    this.required = required;
  }
}
