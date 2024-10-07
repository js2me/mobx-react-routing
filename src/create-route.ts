import { ViewModelHocConfig, withViewModel } from 'mobx-vm-entities';
import { ComponentType } from 'react';
import { RouteObject } from 'react-router-dom';
import { NoopComponent } from 'react-shared-utils/components/noop-component';
import { loadable } from 'react-shared-utils/loadable';

import { withRouteBlocker } from './hoc';
import { RouteDeclaration, RouterStore } from './router';

declare const process: { env: { NODE_ENV?: string } };

export interface CreateRouteFunctionParams {
  declaration: RouteDeclaration;
  router: RouterStore;
  factory: Exclude<ViewModelHocConfig<any>['factory'], undefined>;
  createChildRoute: DefaultCreateRouteFunction;
  /**
   * Индексовое представление роута
   */
  parentPath: number[];
  index: number;
}

export type DefaultCreateRouteFunction = (
  params: CreateRouteFunctionParams,
) => RouteObject;

export const createRoute: DefaultCreateRouteFunction = ({
  declaration,
  router,
  factory,
  createChildRoute,
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

  const id =
    origId ??
    (process.env.NODE_ENV === 'production'
      ? `route-${treePath.join('-')}`
      : `route-${treePath.join('-')}(path:${path ?? '-'})`);

  declaration.id = id;

  if (!Model && !loader) {
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
      Component,
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
              factory,
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
            factory,
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
    Component: WrappedComponent,
    path,
    index: isIndexRoute as false,

    element,
    ErrorBoundary: errorBoundary,
  };
};
