import { ComponentType, ReactNode } from 'react';

import { PageViewModel } from '../page-view-model';

interface RouteComponentAndModel {
  Component: ComponentType<any>;
  Model: Class<PageViewModel<any>>;
}

export interface RouteMatch {
  /**
   * PATH параметры роута
   */
  params: AnyObject;

  /**
   * Полный путь роута
   * /url/user-id-1
   */
  pathname: string;

  /**
   * Идентификатор роута (задается в роутах react-router-dom или в функции route)
   */
  id: string;

  /**
   * Паттерн пути роута
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

export interface RouteDeclaration extends Partial<RouteComponentAndModel> {
  /**
   * Корневой роут от родительского пути или нет
   */
  index?: boolean;
  /**
   * Путь
   */
  path?: string;
  /**
   * идентификатор
   */
  id?: string;
  /**
   * Элемент, который будет отрисован (Component/Model будут проигнорированы)
   */
  element?: ReactNode;
  /**
   * Ленивый загрузчик компонента и модели
   */
  loader?: () => Promise<Partial<RouteComponentAndModel>>;
  /**
   * Дефолтный компонент, который будет отображаться на этапах загрузки компонента\модели или когда роутинг заблокирован
   */
  fallback?: ComponentType;
  /**
   * Отлавливатель ошибок
   */
  errorBoundary?: ComponentType;
  /**
   * Дочерние роуты
   */
  children?: RouteDeclaration[];
}
