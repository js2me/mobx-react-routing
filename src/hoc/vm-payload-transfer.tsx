import type { ComponentType } from 'react';
import { useParams } from 'react-router-dom';
import type { Maybe } from 'yummies/types';

export const VMPayloadTransferHOC = (Component: Maybe<ComponentType<any>>) => {
  if (!Component) return Component;

  return (props: any) => {
    // eslint-disable-next-line sonarjs/rules-of-hooks
    const params = useParams();

    return <Component {...props} payload={props?.payload ?? params} />;
  };
};
