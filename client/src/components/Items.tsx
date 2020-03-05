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

import { createItem, deleteItem, getItems, patchItem } from '../api/items-api'
import { getLayoutByUserId } from '../api/layout-api'
import { LayoutWrapper } from '../context/layoutContext'
import { CategoryColumn } from '../components/CategoryColumn'
import { AuthWrapper } from '../context/auth0-context';
import { Item } from '../types/Item'

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
  loadingItems: boolean
}
const initialItemsState = {
  loadingItems: true,
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

      this.props.setLayout(layout)

      this.setState({
        loadingItems: false
      })
    } catch (e) {
      alert(`Failed to fetch items: ${e.message}`)
    }
  }

  render() {
    const { layout } = this.props;

    if (this.state.loadingItems) {
      return this.renderLoading()
    }

    return (
      <div>
        <Header as="h1">Items</Header>
        <Grid columns={3} divided stackable>
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
      </div>
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