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

import { getLayoutByUserId } from '../api/layout-api'
import { createItem, deleteItem, getItems, patchItem } from '../api/items-api'
import Auth from '../auth/Auth'
import { WrappedCreateItem } from './CreateItem'
import { CategoryColumn } from '../components/CategoryColumn'
import { ItemSlot } from './ItemSlot'
import { Item } from '../types/Item'

interface layoutItem {
  items: Item[],
  category: string
}

interface ItemsProps {
  auth: Auth
}

interface ItemsState {
  layout: layoutItem[]
  items: Item[]
  loadingItems: boolean
}
const initialItemsState = {
  layout: [],
  items: [],
  loadingItems: true,
}

export class Items extends React.PureComponent<ItemsProps, ItemsState> {
  state: ItemsState = {
    ...initialItemsState
  }

  async componentDidMount() {
    try {
      const layout = await getLayoutByUserId(
        this.props.auth.getIdToken(),
        this.props.auth.getUserId(),
      )
      this.setState({
        layout,
        loadingItems: false
      })
    } catch (e) {
      alert(`Failed to fetch items: ${e.message}`)
    }
  }

  render() {
    const { auth } = this.props;
    const { layout } = this.state;

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
                  auth={this.props.auth}
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
