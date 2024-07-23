import { Disposable } from 'mobx-disposer-util';

import { RawQueryParams } from './query-params.types';

export interface QueryParams extends Disposable {
  /**
   * Все распаршенные квери параметры текущей урлы
   */
  data: RawQueryParams;

  /**
   * Задать квери параметры текущему урлу
   */
  set(queryParams: AnyObject, replace?: boolean): Promise<void>;

  /**
   * Обновить квери параметры текущему урлу
   */
  update(queryParams: AnyObject, replace?: boolean): Promise<void>;

  /**
   * Собрать строку search из data
   */
  buildSearchString(queryParams: AnyObject): string;

  /**
   * Собрать строку url вместе query params
   */
  buildUrl(queryParams: AnyObject): string;

  /**
   * Получить query параметры из search строки
   */
  getSearchParamsData(search?: string): AnyObject;
}
