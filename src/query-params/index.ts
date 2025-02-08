import { QueryParamsBase } from './query-params.base';

export * from './query-params.base';
export * from './query-params.types';
export * from './query-params';

/**
 * @deprecated Will be removed in 6.0.0 release. Please use {@link QueryParamsBase} instead
 */
export const QueryParamsImpl = QueryParamsBase;
