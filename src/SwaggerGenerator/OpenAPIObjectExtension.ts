import { SchemaObjectType } from 'openapi3-ts/oas30';

export function isSchemaObjectType(value: any): value is SchemaObjectType {
  return typeof value === 'string' && value !== null;
}

export function upperCaseFirstLetter(value: string): string {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

export function lowerCaseFirstLetter(value: string): string {
  return value.charAt(0).toLowerCase() + value.slice(1);
}

export function getOperationId(operationId: string | undefined): string {
  let result = operationId;
  if (result != undefined) {
    let methodName = result;
    if (methodName.includes('_')) {
      methodName = methodName.split('_')[1];
    }
    if (methodName.endsWith('Async')) {
      return methodName.slice(0, -5);
    } else {
      return `${methodName}`;
    }
  }
  return '';
}
