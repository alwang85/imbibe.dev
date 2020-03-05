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
import Auth from '../auth/Auth'
import { CategoryColumn } from '../components/CategoryColumn'
import { Item } from '../types/Item'

interface layoutItem {
  items: Item[],
  category: string
}

interface ItemsProps {
  auth: Auth
  layout: layoutItem[]
  setLayout: (layout: layoutItem[]) => void
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
        this.props.auth.getIdToken(),
        this.props.auth.getUserId(),
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
    const { auth, layout } = this.props;

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

export const WrappedItems = LayoutWrapper(Items)