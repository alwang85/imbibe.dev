import React from 'react';
import { Item } from '../types/Item';
import { SubItem } from '../types/SubItem';

const ItemsContext = React.createContext({
  items: [] as Item[],
  moveSubItem: (movedSubItem: SubItem, originalItem: Item, targetItem: Item) => {}
});

export default ItemsContext;

export const ItemsWrapper = (WrappedComponent: any) => {
  return (props: any) => (
    <ItemsContext.Consumer>
      {(contextProps) => (
        <WrappedComponent {...props} {...contextProps} />
      )}
    </ItemsContext.Consumer>
  )
}