import { action, computed, makeObservable } from 'mobx';

import {
  DefinePresetByType,
  QueryParamsFieldModelConfig,
  QueryParamsFieldModelPresetConfig,
} from './query-params-field.types.js';
import { queryParamsPresets } from './query-params-presets.js';

export class QueryParamsField<T> {
  name: string;

  constructor(private config: QueryParamsFieldModelConfig<T>) {
    this.name = this.config.name;

    computed(this, 'rawValue');
    computed(this, 'value');
    action(this, 'set');

    makeObservable(this);
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
   * Create get\set value, which is synchronized with the query parameter
   * Create by preset
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
   * Create get\set value, which is synchronized with the query parameter
   * Manual handling of the query parameter
   */
  static create<T>(
    config: QueryParamsFieldModelConfig<T>,
  ): QueryParamsField<T> {
    return new QueryParamsField<any>(config);
  }
}
