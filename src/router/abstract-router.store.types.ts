import { ComponentType } from 'react';

import { RouteDeclaration } from './router.types';

export interface AbstractRouterStoreParams {
  routes: RouteDeclaration[];
  fallbackComponent?: ComponentType;
  errorBoundaryComponent?: ComponentType;
}
