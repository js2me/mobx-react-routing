import { AgnosticDataRouteMatch, Router } from '@remix-run/router';
import { action, computed, observable, reaction, runInAction } from 'mobx';
import { Disposer } from 'mobx-disposer-util';
import { ComponentType } from 'react';
import {
  createBrowserRouter,
  matchPath,
  PathPattern,
  RouteObject,
} from 'react-router-dom';
import { generateId } from 'yammies/id';

import { QueryParams, QueryParamsImpl } from '../query-params';

import { AbstractRouterStoreParams } from './abstract-router.store.types';
import { RouterStore } from './router.store';
import { LocationData, RouteDeclaration, RouteMatch } from './router.types';

export abstract class AbstractRouterStore implements RouterStore {
  private disposer = new Disposer();

  queryParams: QueryParams;

  @observable
  accessor matches: RouteMatch[];

  @observable
  accessor location: LocationData;

  @observable
  private accessor blockers = new Set<string>();

  private router: Router;

  fallbackComponent?: ComponentType;

  errorBoundaryComponent?: ComponentType;

  @computed
  get lastMatch(): RouteMatch | null {
    return this.matches[this.matches.length - 1] ?? null;
  }

  abstract createRoute(routeDeclaration: RouteDeclaration): RouteObject;

  constructor({
    routes,
    fallbackComponent,
    errorBoundaryComponent,
  }: AbstractRouterStoreParams) {
    this.fallbackComponent = fallbackComponent;
    this.errorBoundaryComponent = errorBoundaryComponent;
    this.router = createBrowserRouter(
      routes.map((route) => this.createRoute(route)),
    );

    this.queryParams = new QueryParamsImpl(this.router);
    this.matches = this.collectRouteMatches(this.router.state.matches);
    this.location = { ...this.router.state.location };

    this.disposer.add(
      this.router.subscribe((state) => {
        runInAction(() => {
          this.matches = this.collectRouteMatches(state.matches);
          this.location = { ...state.location };
        });
      }),
    );
  }

  collectRouteMatches(matches: AgnosticDataRouteMatch[]) {
    return matches.map((match): RouteMatch => {
      return {
        id: match.route.id!,
        params: match.params,
        path: match.route.path,
        pathname: match.pathname,
      };
    });
  }

  @action.bound
  async navigate(
    to: string | { pathname: string; search?: AnyObject },
    opts?: { replace?: boolean },
  ): Promise<void> {
    if (typeof to === 'string') {
      const [pathname, search] = to.split('?', 2);

      await this.router.navigate(
        {
          pathname,
          search,
          hash: '',
        },
        opts,
      );
    } else {
      await this.router.navigate(
        {
          pathname: to.pathname,
          search: this.queryParams.buildSearchString(to.search || {}),
          hash: '',
        },
        opts,
      );
    }
  }

  @computed
  get blocked() {
    return !!this.blockers.size;
  }

  blockRoutingIf(expression: () => boolean, id = generateId()): VoidFunction {
    const disposeFn = reaction(
      expression,
      (blocks) => {
        if (blocks) {
          this.blockRouting(id);
        } else {
          this.unblockRouting(id);
        }
      },
      { fireImmediately: true },
    );

    return () => {
      this.unblockRouting(id);
      disposeFn();
    };
  }

  @action.bound
  blockRouting(id: string = generateId()) {
    if (!this.blockers.has(id)) {
      this.blockers.add(id);
    }
    return id;
  }

  @action.bound
  unblockRouting(id: string) {
    this.blockers.delete(id);
  }

  getInstance(): Router {
    return this.router;
  }

  dispose() {
    this.disposer.dispose();
    this.blockers.clear();
  }

  @action.bound
  async back(): Promise<void> {
    await this.router.navigate(-1);
  }

  findMatch = (
    pathOrPattern: PathPattern | string,
  ): { params: AnyObject; pathname: string } | null => {
    return matchPath(pathOrPattern, this.location.pathname);
  };

  isMatched = (pathOrPattern: PathPattern | string): boolean => {
    return !!this.findMatch(pathOrPattern);
  };
}
