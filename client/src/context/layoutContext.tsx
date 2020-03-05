import React from 'react';
import { Item } from '../types/Item';

interface layoutItem {
  items: Item[],
  category: string
}

const LayoutContext = React.createContext({
  layout: [] as layoutItem[],
  setLayout: (layout: layoutItem[]) => {}
});

export default LayoutContext;

export const LayoutWrapper = (WrappedComponent: any) => {
  return (props: any) => (
    <LayoutContext.Consumer>
      {(contextProps) => (
        <WrappedComponent {...props} {...contextProps} />
      )}
    </LayoutContext.Consumer>
  )
}