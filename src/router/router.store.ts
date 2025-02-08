import { Router } from '@remix-run/router';
import { PathPattern } from '@remix-run/router/utils';
import { ComponentType } from 'react';

import type { QueryParams } from '../query-params';
import { AnyObject } from '../utils/types';

import type {
  LocationData,
  RouteMatch,
  RouterPath,
  RouterToConfig,
} from './router.types';

export interface RouterStore {
  /**
   * The current URL
   */
  currentUrl: string;

  /**
   * Query parameters model
   * Attached to the router
   */
  readonly queryParams: QueryParams;

  /**
   * All route matches that the router found based on the route configuration
   *
   * @example
   * { path: '/url/:userId', component: UserIdPage }
   * /url/user-id-1
   * -> (RouteMatch)
   * {
   *     params: { userId: "user-id-1" }
   *     pathname: '/url/user-id-1',
   *     id: route-id,
   *     path: '/url/:userId'
   * }
   */
  readonly matches: RouteMatch[];

  /**
   * The last route match
   */
  readonly lastMatch: RouteMatch | null;

  /**
   * Information about the current location
   */
  readonly location: LocationData;

  /**
   * Are there any routing blockages
   */
  readonly blocked: boolean;

  /**
   * Show if routing is blocked or route view and model are lazily loaded
   */
  fallbackComponent?: ComponentType;

  errorBoundaryComponent?: ComponentType;

  /**
   * Block routing
   */
  blockRouting(id?: string): string;

  /**
   * Block routing by condition
   *
   * Creates a mobx reaction
   * Returns dispose function
   */
  blockRoutingIf(expression: () => boolean, id?: string): VoidFunction;

  /**
   * Remove routing blockage
   */
  unblockRouting(id: string): void;

  /**
   * Creates a {@link RouterPath} object based on the route configuration.
   *
   * @param to - Route configuration, including path, search parameters, and hash.
   * @returns A {@link RouterPath} object with pathname, search, and hash values.
   */
  createPath(to: RouterToConfig): RouterPath;

  /**
   * Creates a URL based on the route configuration.
   *
   * @param to - Route configuration, including path and search parameters.
   * @returns A fully formed URL string.
   */
  createUrl(to: RouterToConfig): string;

  /**
   * Navigation within the application.
   * Prefer to use this method instead of the original react-router-dom's one
   */
  navigate(
    to: string | { pathname: string; search?: AnyObject },
    options?: { replace?: boolean },
  ): Promise<void>;

  /**
   * Get the original router instance (react-router-dom)
   */
  getInstance(): Router;

  back(): Promise<void>;

  findMatch(
    pathOrPattern: PathPattern | string,
  ): { params: AnyObject; pathname: string } | null;

  isMatched(pathOrPattern: PathPattern | string): boolean;

  clean(): void;
}
