import { QueryParamsBase } from './query-params.base.js';

export * from './query-params.base.js';
export * from './query-params.types.js';
export * from './query-params.js';

/**
 * @deprecated Will be removed in 6.0.0 release. Please use {@link QueryParamsBase} instead
 */
export const QueryParamsImpl = QueryParamsBase;
