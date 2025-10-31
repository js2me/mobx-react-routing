import type { AnyObject } from 'yummies/types';

import type { QueryParams } from '../query-params/index.js';

import type { queryParamsPresets } from './query-params-presets.js';

export interface QueryParamsFieldModelConfig<T> {
  queryParams: QueryParams;
  /**
   * Название поля в query параметрах
   */
  name: string;
  /**
   * Дефолтное значение если ничего нет
   */
  defaultValue: T;
  /**
   * Стратегия обновления этого поля
   */
  strategy?: 'replace' | 'push';
  /**
   * Получение query param значения
   */
  serialize: (value: T | undefined) => any;
  /**
   * Получение рабочего значения
   */
  deserialize: (value: any) => T | null;
}

export type PresetName = keyof typeof queryParamsPresets;

export type DefinePresetByType<T> = T extends string[]
  ? 'string[]'
  : T extends number[]
    ? 'number[]'
    : T extends string
      ? 'string'
      : T extends boolean
        ? 'boolean'
        : T extends number
          ? 'number'
          : T extends AnyObject
            ? 'json'
            : 'string';

export interface QueryParamsFieldModelPresetConfig<Preset extends PresetName, T>
  extends Omit<QueryParamsFieldModelConfig<T>, 'serialize' | 'deserialize'> {
  preset: Preset;
}
