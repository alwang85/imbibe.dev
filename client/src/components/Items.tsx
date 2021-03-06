import * as React from 'react'
import {
  Grid,
  Header,
  Loader
} from 'semantic-ui-react'
import isEqual from 'lodash.isequal';

import { deleteItem, patchItem } from '../api/items-api'
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
  isAuthenticated: any
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
      this.fetchLayoutAndItems();
    } catch (e) {
      alert(`Failed to fetch items: ${e.message}`)
    }
  }

  moveSubItem = async (movedSubItem: SubItem, originalItem: Item, targetItem: Item) => {
    const { idToken } = this.props
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
      
      this.fetchLayoutAndItems()

    } catch (e) {
      alert(`Failed to move items: ${e.message}`)
    }
  }

  deleteItem = async (itemId: string) => {
    const { idToken, userId } = this.props
    try {
      if(this.props.isAuthenticated) {
        await deleteItem(idToken, itemId)

        this.fetchLayoutAndItems();
      }
      
    } catch (e) {
      alert('Item deletion failed');
    }
  }

  fetchLayoutAndItems = async () => {
    const { idToken, userId } = this.props
    const newLayout = await getLayoutByUserId(idToken, userId );
    const allItems = getItemsFromLayout(newLayout);
    this.props.setLayout(newLayout)
    this.setState({
      loadingItems: false,
      items: allItems,
    });
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
        deleteItem: this.deleteItem,
        fetchLayoutAndItems: this.fetchLayoutAndItems,
      }}>
        <Header as="h1"></Header>
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
        <br />
        <br />
        <Loader indeterminate active inline="centered">
          Loading
        </Loader>
      </Grid.Row>
    )
  }
}

export const WrappedItems = AuthWrapper(LayoutWrapper(Items))