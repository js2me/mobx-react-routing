import { ViewModelParams } from 'mobx-view-model';
import { ComponentType, ReactNode } from 'react';
import { createBrowserRouter, RouterProviderProps } from 'react-router-dom';
import { AnyObject, Class } from 'yummies/utils/types';

import { PageViewModel } from '../page-view-model/index.js';

interface RouteComponentAndModel {
  Component: ComponentType<any>;
  Model: Class<PageViewModel<any, any>>;
}

export type ReactRouterInstance = RouterProviderProps['router'];

export interface RouteMatch {
  /**
   * PATH parameters of the route
   */
  params: AnyObject;

  /**
   * Full path of the route
   * /url/user-id-1
   */
  pathname: string;

  /**
   * Identifier of the route (set in react-router-dom routes or in the route function)
   */
  id: string;

  /**
   * Path pattern of the route
   * /url/:userId
   */
  path?: string;
}

export interface LocationData {
  /**
   * A URL pathname, beginning with a /.
   */
  pathname: string;

  /**
   * A URL search string, beginning with a ?.
   */
  search: string;

  /**
   * A URL fragment identifier, beginning with a #.
   */
  hash: string;
}

export interface RouteDeclaration
  extends Partial<RouteComponentAndModel>,
    Pick<ViewModelParams, 'ctx'> {
  /**
   * Root route from the parent path or not
   */
  index?: boolean;
  /**
   * Path
   */
  path?: string;
  /**
   * Identifier
   */
  id?: string;
  /**
   * Element to be rendered (Component/Model will be ignored)
   */
  element?: ReactNode;
  /**
   * Lazy loader for the component and model
   */
  loader?: () => Promise<Partial<RouteComponentAndModel>>;
  /**
   * Default component to be displayed during the loading stages of the component/model or when routing is blocked
   */
  fallback?: ComponentType;
  /**
   * Error handler
   */
  errorBoundary?: ComponentType;
  /**
   * Child routes
   */
  children?: RouteDeclaration[];
}

/**
 * Interface that describes the path to navigate to
 */
export interface RouterPath {
  pathname: string;
  search: string;
  hash: string;
}

/**
 * Description of the configuration for navigation
 */
export type RouterToConfig = string | { pathname: string; search?: AnyObject };

type CreateLibRouterParams = Exclude<
  Parameters<typeof createBrowserRouter>[1],
  undefined | null
>;

export interface RouterStoreParams extends Partial<CreateLibRouterParams> {
  type?: 'hash' | 'browser' | 'memory';
  routes: RouteDeclaration[];
  fallbackComponent?: ComponentType;
  errorBoundaryComponent?: ComponentType;
  abortSignal?: AbortSignal;
}
