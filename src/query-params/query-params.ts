import type { AnyObject } from 'yummies/types';
import type { RawQueryParams } from './query-params.types.js';

export interface QueryParams {
  /**
   * All parsed query parameters of the current url
   */
  data: RawQueryParams;

  /**
   * Set query parameters to the current url
   */
  set(queryParams: AnyObject, replace?: boolean): Promise<void>;

  /**
   * Update query parameters of the current url
   */
  update(queryParams: AnyObject, replace?: boolean): Promise<void>;

  /**
   * Build search string from data
   */
  buildSearchString(queryParams: AnyObject): string;

  /**
   * Build url string with query params
   */
  buildUrl(queryParams: AnyObject): string;

  /**
   * Get query parameters from search string
   */
  getSearchParamsData(search?: string): AnyObject;

  destroy(): void;
}
