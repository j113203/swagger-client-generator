export class BuildAxiosParamsResult {
  path: Record<string, string>;
  params: Record<string, string>;

  constructor(path: Record<string, string>, params: Record<string, string>) {
    this.path = path;
    this.params = params;
  }
}
