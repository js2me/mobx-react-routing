import {
  CreateViewModelFactoryFn,
  ViewModelCreateConfig,
  withViewModel,
} from 'mobx-view-model';
import { ComponentType } from 'react';
import { RouteObject } from 'react-router-dom';
import { loadable } from 'react-simple-loadable';

import { withRouteBlocker } from './hoc/index.js';
import { VMPayloadTransferHOC } from './hoc/vm-payload-transfer.js';
import { PageViewModel } from './page-view-model/index.js';
import { RouteDeclaration, RouterStore } from './router/index.js';

declare const process: { env: { NODE_ENV?: string } };

const NoopComponent = () => null;

export interface CreateRouteFunctionParams {
  declaration: RouteDeclaration;
  router: RouterStore;
  factory?: CreateRouteViewModelFactory;
  createChildRoute?: DefaultCreateRouteFunction;
  /**
   * Индексовое представление роута
   * @example [0, 0, 0]
   */
  parentPath: number[];
  index: number;
}

export type DefaultCreateRouteFunction = (
  params: CreateRouteFunctionParams,
) => RouteObject;

export type CreateRouteViewModelFactory = (
  config: ViewModelCreateConfig<PageViewModel<any, any>>,
  declaration: RouteDeclaration,
) => PageViewModel<any, any>;

export const createRoute: DefaultCreateRouteFunction = ({
  declaration,
  router,
  factory,
  createChildRoute = createRoute,
  parentPath,
  index,
}): RouteObject => {
  const {
    Model,
    Component,
    path,
    id: origId,
    loader,
    fallback = router?.fallbackComponent,
    children,
    errorBoundary = router?.errorBoundaryComponent,
    index: isIndexRoute,
    element,
  } = declaration;

  const treePath = [...parentPath, index];

  const factoryFn: undefined | CreateViewModelFactoryFn<any> = factory
    ? (config) => factory(config, config.ctx!.routeDeclaration)
    : undefined;

  const id =
    origId ??
    (process.env.NODE_ENV === 'production'
      ? `route-${treePath.join('-')}`
      : `route-${treePath.join('-')}(path:${path ?? '-'})`);

  declaration.id = id;

  if (!Model && !loader) {
    return {
      id,
      children: children?.map((declaration, index) =>
        createChildRoute({
          declaration,
          router,
          factory,
          createChildRoute,
          parentPath: treePath,
          index,
        }),
      ),
      Component: VMPayloadTransferHOC(Component),
      path,
      index: isIndexRoute as false,
      element,
      ErrorBoundary: errorBoundary,
    };
  }

  let WrappedComponent: ComponentType<any>;

  if (loader) {
    WrappedComponent = withRouteBlocker(
      router,
      loadable(async () => {
        const { Model, Component } = await loader();

        const UsageComponent = Component || NoopComponent;

        return Model
          ? withViewModel(Model, {
              id,
              fallback,
              ctx: {
                routeDeclaration: declaration,
                ...declaration.ctx,
              },
              factory: factoryFn,
            })(UsageComponent)
          : UsageComponent;
      }, fallback),
      fallback,
    );
  } else {
    const UsageComponent = Component || NoopComponent;

    WrappedComponent = withRouteBlocker(
      router,
      Model
        ? withViewModel(Model, {
            id,
            fallback,
            ctx: {
              routeDeclaration: declaration,
              ...declaration.ctx,
            },
            factory: factoryFn,
          })(UsageComponent)
        : UsageComponent,
      fallback,
    );
  }

  return {
    id,
    children: children?.map((route, index) =>
      createChildRoute({
        declaration: route,
        router,
        factory,
        createChildRoute,
        parentPath: treePath,
        index,
      }),
    ),
    Component: VMPayloadTransferHOC(WrappedComponent),
    path,
    index: isIndexRoute as false,

    element,
    ErrorBoundary: errorBoundary,
  };
};
