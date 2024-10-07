import { AgnosticDataRouteMatch, Router } from '@remix-run/router';
import { Disposer } from 'disposer-util';
import {
  action,
  computed,
  makeObservable,
  observable,
  reaction,
  runInAction,
} from 'mobx';
import { ComponentType } from 'react';
import {
  createBrowserRouter,
  matchPath,
  PathPattern,
  RouteObject,
} from 'react-router-dom';
import { generateId } from 'yammies/id';

import { QueryParams, QueryParamsImpl } from '../query-params';
import { AnyObject } from '../utils/types';

import { AbstractRouterStoreParams } from './abstract-router.store.types';
import { RouterStore } from './router.store';
import { LocationData, RouteDeclaration, RouteMatch } from './router.types';

export abstract class AbstractRouterStore implements RouterStore {
  private disposer = new Disposer();

  queryParams: QueryParams;

  matches: RouteMatch[];

  location: LocationData;

  private blockers = new Set<string>();

  private router: Router;

  fallbackComponent?: ComponentType;

  errorBoundaryComponent?: ComponentType;

  get lastMatch(): RouteMatch | null {
    return this.matches.at(-1) ?? null;
  }

  abstract createRoute(
    routeDeclaration: RouteDeclaration,
    index: number,
  ): RouteObject;

  constructor({
    routes,
    fallbackComponent,
    errorBoundaryComponent,
  }: AbstractRouterStoreParams) {
    this.fallbackComponent = fallbackComponent;
    this.errorBoundaryComponent = errorBoundaryComponent;

    this.router = createBrowserRouter(
      routes.map((route, index) => this.createRoute(route, index)),
    );

    this.queryParams = new QueryParamsImpl(this.router);
    this.matches = this.collectRouteMatches(this.router.state.matches);
    this.location = { ...this.router.state.location };

    makeObservable<this, 'blockers'>(this, {
      matches: observable,
      location: observable,
      blockers: observable,
      blocked: computed,
      lastMatch: computed,
      navigate: action.bound,
      blockRouting: action.bound,
      unblockRouting: action.bound,
      back: action.bound,
    });

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

  async navigate(
    to: string | { pathname: string; search?: AnyObject },
    options?: { replace?: boolean },
  ): Promise<void> {
    if (typeof to === 'string') {
      const [pathname, search] = to.split('?', 2);

      await this.router.navigate(
        {
          pathname,
          search,
          hash: '',
        },
        options,
      );
    } else {
      await this.router.navigate(
        {
          pathname: to.pathname,
          search: this.queryParams.buildSearchString(to.search || {}),
          hash: '',
        },
        options,
      );
    }
  }

  get blocked() {
    return this.blockers.size > 0;
  }

  blockRoutingIf(expression: () => boolean, id = generateId()): VoidFunction {
    const disposeFunction = reaction(
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
      disposeFunction();
    };
  }

  blockRouting(id: string = generateId()) {
    if (!this.blockers.has(id)) {
      this.blockers.add(id);
    }
    return id;
  }

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
