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

export function getPathByTag(tag: string): string {
  let path = tag;
  if (path != undefined) {
    path = path.split(' ').join('');
    if (path.includes('-')) {
      return path.split('-')[0];
    }
    return path;
  }
  return '';
}

export function getPathByOperationId(operationId: string | undefined): string {
  let result = operationId;
  if (result != undefined) {
    let path = result;
    if (path.includes('_')) {
      path = path.split('_')[0];
    }
    if (path.endsWith('Controller')) {
      return path.slice(0, -10);
    } else {
      return `${path}`;
    }
  }
  return '';
}

export function getClassNameByOperationId(
  operationId: string | undefined,
): string {
  let result = operationId;
  if (result != undefined) {
    let className = result;
    if (className.includes('_')) {
      className = className.split('_')[0];
    }
    if (className.endsWith('Controller')) {
      return className.slice(0, -10);
    } else {
      return `${className}`;
    }
  }
  return '';
}

// export function getMixturePathName(
//   tagPathName: string,
//   operationPathName: string,
// ) {
//   // console.log('tagPathName', tagPathName);
//   // console.log('operationPathName', operationPathName);

//   if (tagPathName.endsWith('/' + operationPathName)) {
//     return `${tagPathName}`;
//   }

//   return `${tagPathName}/${operationPathName}`;
// }
