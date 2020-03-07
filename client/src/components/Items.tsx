import dateFormat from 'dateformat'
import update from 'immutability-helper'
import * as React from 'react'
import {
  Button,
  Checkbox,
  Divider,
  Grid,
  Header,
  Icon,
  Input,
  Image,
  Loader
} from 'semantic-ui-react'
import isEqual from 'lodash.isequal';

import { createItem, deleteItem, getItems, patchItem } from '../api/items-api'
import { getLayoutByUserId } from '../api/layout-api'
import { LayoutWrapper } from '../context/layoutContext'
import { CategoryColumn } from '../components/CategoryColumn'
import { AuthWrapper } from '../context/auth0-context';
import ItemsContext from '../context/itemsContext';
import { Item } from '../types/Item'
import { SubItem } from '../types/SubItem'

interface layoutItem {
  items: Item[],
  category: string
}

interface ItemsProps {
  layout: layoutItem[]
  setLayout: (layout: layoutItem[]) => void,
  // the following comes from AuthWrapper HoC
  idToken: string,
  userId: string
}

interface ItemsState {
  items: Item[],
  loadingItems: boolean
}
const initialItemsState = {
  items: [] as Item[],
  loadingItems: true,
}

const getItemsFromLayout = (layout: layoutItem[]) => {
  let allItems = [] as Item[];
  console.log('layout in getItems', layout)
  // @ts-ignore
  layout.reduce((prev: layoutItem, curr: layoutItem) => {
    allItems = allItems.concat(curr.items)
  }, []); // if no default value is ran, prev is skipped

  return allItems;
}

export class Items extends React.PureComponent<ItemsProps, ItemsState> {
  state: ItemsState = {
    ...initialItemsState
  }

  async componentDidMount() {
    try {
      const layout = await getLayoutByUserId(
        this.props.idToken,
        this.props.userId,
      )
      
      const allItems = getItemsFromLayout(layout)

      this.props.setLayout(layout)

      this.setState({
        loadingItems: false,
        items: allItems
      })
    } catch (e) {
      alert(`Failed to fetch items: ${e.message}`)
    }
  }

  moveSubItem = async (movedSubItem: SubItem, originalItem: Item, targetItem: Item) => {
    const { idToken, userId } = this.props
    try {
      if(!movedSubItem || !originalItem.subItems || !targetItem.subItems) {
        alert(`Failed to move items`);
      }

      // @ts-ignore
      const newOriginalSubItems = originalItem.subItems.filter(subItem => {
        return !isEqual(movedSubItem, subItem);
      });
      const modifiedOriginalItem = {
        ...originalItem,
        subItems: newOriginalSubItems,
      };

      const modifiedTargetItem = {
        ...targetItem,
        // @ts-ignore
        subItems: [...targetItem.subItems, movedSubItem] as SubItem[]
      };

      await patchItem(idToken, targetItem.id, modifiedTargetItem);
      await patchItem(idToken, originalItem.id, modifiedOriginalItem);
      const newLayout = await getLayoutByUserId(idToken, userId );

      const allItems = getItemsFromLayout(newLayout);

      this.props.setLayout(newLayout)
      this.setState({
        items: allItems,
      });

    } catch (e) {
      alert(`Failed to move items: ${e.message}`)
    }
  }

  render() {
    const { layout } = this.props;

    if (this.state.loadingItems) {
      return this.renderLoading()
    }

    return (
      <ItemsContext.Provider value={{
        items: this.state.items,
        moveSubItem: this.moveSubItem,
      }}>
        <Header as="h1">Items</Header>
        <Grid columns={3} doubling stackable>
          <Grid.Row>
            {
              layout && layout.length && layout.map(categoryItem => (
                <CategoryColumn 
                  key={categoryItem.category}
                  items={categoryItem.items}
                  categoryName={categoryItem.category}
                  crud={true}
                />
              ))
            }
          </Grid.Row>
        </Grid>
      </ItemsContext.Provider>
    )
  }

  renderLoading() {
    return (
      <Grid.Row>
        <Loader indeterminate active inline="centered">
          Loading Items
        </Loader>
      </Grid.Row>
    )
  }
}

export const WrappedItems = AuthWrapper(LayoutWrapper(Items))