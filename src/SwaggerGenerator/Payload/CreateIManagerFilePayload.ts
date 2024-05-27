export class CreateIManagerFilePayload {
  tagPathName: string;
  operationPathName: string;
  name: string;

  constructor(tagPathName: string, operationPathName: string) {
    this.tagPathName = tagPathName;
    this.operationPathName = operationPathName;
    this.name = `${tagPathName}`;
  }
}
