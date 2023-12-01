export type FieldType = {
  name: string;
  validator: Function;
  default?: null | string | number | boolean | [];
  required?: boolean;
};

const normalizeModel = (
  request: any,
  fields: FieldType[],
  updating = false,
  ignoreFields: string[] = [],
) => {
  const validatedBody = {};
  const createHandler = (field: FieldType) => {
    // while creating, validate all fields
    if (request[field.name] === undefined) {
      if (field.required) throw new Error(`Missing ${field.name} field`);
    } else if (!field.validator(request[field.name])) {
      throw new Error(
        `Invalid ${field.name} field, should be ${field.validator.name
          .substring(2)
          .toLowerCase()}`,
      );
    }
    validatedBody[field.name] = request[field.name]
      ? request[field.name]
      : field.default;
  };
  const updateHandler = (field: FieldType) => {
    // if updating, validate only fields that are present in request
    // for each field in request, check if it is present in FIELDS given
    // in controller
    if (request[field.name] !== undefined) {
      if (field.validator(request[field.name])) {
        validatedBody[field.name] = request[field.name];
      } else {
        throw new Error(
          `Invalid ${field.name} field, should be ${field.validator.name
            .substring(2)
            .toLowerCase()}`,
        );
      }
    }
  };

  const chooseHandler = updating ? updateHandler : createHandler;
  fields.forEach(chooseHandler);
  // check if there are any invalid fields in request that are not present in FIELDS
  const unsupportedProperties = Object.keys(request).filter(
    (field) =>
      request[field] !== undefined && // if exists in request body
      validatedBody[field] === undefined && // but not in FIELDS
      !ignoreFields.includes(field), // and not marked in ignoreFields
  );
  if (unsupportedProperties.length > 0) {
    throw new Error(`Unsupported properties: ${unsupportedProperties}`);
  }
  return validatedBody;
};

export default normalizeModel;
