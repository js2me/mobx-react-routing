import { LinkedAbortController } from 'linked-abort-controller';
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
  createHashRouter,
  createMemoryRouter,
  matchPath,
  PathPattern,
  RouteObject,
} from 'react-router-dom';
import { generateId } from 'yummies/id';
import { AnyObject } from 'yummies/utils/types';

import { createRoute } from '../create-route.js';
import { PageViewModelBase } from '../page-view-model/index.js';
import { QueryParams, QueryParamsBase } from '../query-params/index.js';

import { RouterStore } from './router.store.js';
import {
  LocationData,
  ReactRouterInstance,
  RouteDeclaration,
  RouteMatch,
  RouterPath,
  RouterStoreParams,
  RouterToConfig,
} from './router.types.js';

export class RouterStoreBase implements RouterStore {
  protected abortController: AbortController;

  queryParams: QueryParams;

  matches: RouteMatch[];

  location: LocationData;

  private blockers = new Set<string>();

  private router: ReactRouterInstance;

  fallbackComponent?: ComponentType;

  errorBoundaryComponent?: ComponentType;

  get lastMatch(): RouteMatch | null {
    return this.matches.at(-1) ?? null;
  }

  createRoute(
    declaration: RouteDeclaration,
    index: number,
    parentPath: number[],
  ): RouteObject {
    return createRoute({
      declaration,
      router: this,
      index,
      parentPath,
      factory: (config, declaration) => {
        const VM = config.VM as unknown as typeof PageViewModelBase;
        return new VM(declaration, this, config);
      },
    });
  }

  constructor({
    routes,
    fallbackComponent,
    errorBoundaryComponent,
    abortSignal,
    type = 'browser',
    ...libRouterParams
  }: RouterStoreParams) {
    this.abortController = new LinkedAbortController(abortSignal);
    this.fallbackComponent = fallbackComponent;
    this.errorBoundaryComponent = errorBoundaryComponent;

    let createRouterFn;

    switch (type) {
      case 'browser': {
        createRouterFn = createBrowserRouter;
        break;
      }
      case 'hash': {
        createRouterFn = createHashRouter;
        break;
      }
      case 'memory': {
        createRouterFn = createMemoryRouter;
        break;
      }
    }

    this.router = createRouterFn(
      routes.map((route, index) => this.createRoute(route, index, [])),
      libRouterParams,
    );

    this.queryParams = new QueryParamsBase(this.router);
    this.matches = this.collectRouteMatches(this.router.state.matches);
    this.location = { ...this.router.state.location };

    observable(this, 'matches');
    observable(this, 'location');
    observable(this, 'blockers');
    computed(this, 'blocked');
    computed(this, 'lastMatch');
    action.bound(this, 'navigate');
    action.bound(this, 'blockRouting');
    action.bound(this, 'unblockRouting');
    action.bound(this, 'back');

    makeObservable(this);

    const subscription = this.router.subscribe((state) => {
      runInAction(() => {
        this.matches = this.collectRouteMatches(state.matches);
        this.location = { ...state.location };
      });
    });

    this.abortController.signal.addEventListener('abort', () => {
      subscription();
    });
  }

  collectRouteMatches(matches: ReactRouterInstance['state']['matches']) {
    return matches.map((match): RouteMatch => {
      return {
        id: match.route.id!,
        params: match.params,
        path: match.route.path,
        pathname: match.pathname,
      };
    });
  }

  createPath(to: RouterToConfig): RouterPath {
    if (typeof to === 'string') {
      const [pathname, search] = to.split('?', 2);

      return {
        pathname,
        search: search ? `?${search}` : '',
        hash: '',
      };
    } else {
      return {
        pathname: to.pathname,
        search: this.queryParams.buildSearchString(to.search || {}),
        hash: '',
      };
    }
  }

  get currentUrl() {
    return (
      this.location.pathname +
      (this.location.search ? `?${this.location.search}` : '')
    );
  }

  createUrl(to: RouterToConfig): string {
    const path = this.createPath(to);

    return `${path.pathname}${path.search}${path.hash}`;
  }

  async navigate(
    to: RouterToConfig,
    options?: { replace?: boolean },
  ): Promise<void> {
    await this.router.navigate(this.createUrl(to), options);
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

  getInstance(): ReactRouterInstance {
    return this.router;
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

  clean(): void {
    this.blockers.clear();
    this.abortController.abort();
  }
}
