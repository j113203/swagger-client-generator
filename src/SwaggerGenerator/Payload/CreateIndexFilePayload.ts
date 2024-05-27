export class CreateIndexFilePayload {
  type: string;
  tagPathName: string;

  constructor(type: string, tagPathName: string) {
    this.type = type;
    this.tagPathName = tagPathName;
  }
}
