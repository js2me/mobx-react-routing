import { action, computed, makeObservable } from 'mobx';

import {
  DefinePresetByType,
  QueryParamsFieldModelConfig,
  QueryParamsFieldModelPresetConfig,
} from './query-params-field.types';
import { queryParamsPresets } from './query-params-presets';

export class QueryParamsField<T> {
  name: string;

  constructor(private config: QueryParamsFieldModelConfig<T>) {
    this.name = this.config.name;

    makeObservable(this, {
      rawValue: computed,
      value: computed,
      set: action,
    });
  }

  get rawValue() {
    return this.config.queryParams.data[this.name];
  }

  get value(): T {
    return this.config.deserialize(this.rawValue) ?? this.config.defaultValue;
  }

  set = async (value: T | undefined) => {
    if (value === this.value) {
      return;
    }

    const serializedValue = this.config.serialize(value);

    await this.config.queryParams.update(
      {
        [this.name]: serializedValue,
      },
      this.config.strategy !== 'push',
    );
  };

  createUrl = (value?: T) => {
    const serializedValue = this.config.serialize(value ?? this.value);

    return this.config.queryParams.buildUrl({
      [this.name]: serializedValue,
    });
  };

  /**
   * Создание get\set значения, которое синхронизируется с квери параметром
   * Создание по пресету
   */
  static createWithPreset<T>(
    config: QueryParamsFieldModelPresetConfig<DefinePresetByType<T>, T>,
  ): QueryParamsField<T> {
    const { serialize, deserialize } = queryParamsPresets[config.preset]!;

    return new QueryParamsField<any>({
      ...config,
      serialize,
      deserialize,
    });
  }

  /**
   * Создание get\set значения, которое синхронизируется с квери параметром
   * Ручная обработка квери параметра
   */
  static create<T>(
    config: QueryParamsFieldModelConfig<T>,
  ): QueryParamsField<T> {
    return new QueryParamsField<any>(config);
  }
}
