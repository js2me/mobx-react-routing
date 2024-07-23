import { typeGuard } from 'yammies/type-guard';

import { QueryParamsFieldModelConfig } from './query-params-field.types';

export const queryParamsPresets = {
  'string[]': {
    deserialize: (value) => value?.split(',') ?? null,
    serialize: (value) => {
      if (!value || !value.length) return undefined;
      return value.join(',');
    },
  },
  'number[]': {
    deserialize: (value): any => {
      const str = queryParamsPresets['string[]'].deserialize(value);
      if (!str) return str;
      const result: any[] = [];
      for (const value of str) {
        if (value !== '' && typeGuard.isNumber(+value)) {
          result.push(+value);
        }
      }
      return result;
    },
    serialize: (value): any => queryParamsPresets['string[]'].serialize(value),
  },
  string: {
    deserialize: (value) => value ?? null,
    serialize: (value) => {
      if (!value) return undefined;
      return value;
    },
  },
  boolean: {
    deserialize: (value) => value === '1',
    serialize: (value) => {
      if (!value || value !== true) return undefined;
      return '1';
    },
  },
  number: {
    deserialize: (value) => {
      if (value === '' || !typeGuard.isNumber(+value)) return null;
      return +value;
    },
    serialize: (value) => {
      if (!value) return undefined;
      return value;
    },
  },
  json: {
    deserialize: (value) => {
      try {
        return JSON.parse(value || '');
      } catch (e) {
        return {};
      }
    },
    serialize: (value) => {
      if (!value || !Object.keys(value).length) return undefined;
      return JSON.stringify(value);
    },
  },
} satisfies Record<
  string,
  Pick<QueryParamsFieldModelConfig<any>, 'deserialize' | 'serialize'>
>;
