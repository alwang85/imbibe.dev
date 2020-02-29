import dateFormat from 'dateformat'
import { History } from 'history'
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
import Auth from '../auth/Auth'
import { CreateItem } from './CreateItem'
import { ViewItem } from './ViewItem'
import { Item } from '../types/Item'

interface ItemsProps {
  auth: Auth
  history: History
}

interface ItemsState {
  items: Item[]
  newItemTitle: string
  newItemDescription: string
  newItemUrl: string
  newItemCategory: string
  loadingItems: boolean
}
const initialItemsState = {
  items: [],
  newItemTitle: '',
  newItemDescription: '',
  newItemUrl: '',
  newItemCategory: '',
  loadingItems: true,
}

export class Items extends React.PureComponent<ItemsProps, ItemsState> {
  state: ItemsState = {
    ...initialItemsState
  }

  onItemCreate = async (event: React.ChangeEvent<HTMLButtonElement>) => {
    try {
      const newItem = await createItem(this.props.auth.getIdToken(), {
        title: this.state.newItemTitle,
        description: this.state.newItemDescription,
        category: this.state.newItemCategory,
        url: this.state.newItemUrl,
      })
      this.setState({
        ...initialItemsState,
        items: [...this.state.items, newItem],
      })
    } catch {
      alert('Item creation failed')
    }
  }

  onItemDelete = async (itemId: string) => {
    try {
      await deleteItem(this.props.auth.getIdToken(), itemId)
      this.setState({
        items: this.state.items.filter(item => item.id != itemId)
      })
    } catch {
      alert('Item deletion failed')
    }
  }

  async componentDidMount() {
    try {
      const items = await getItems(this.props.auth.getIdToken())
      this.setState({
        items,
        loadingItems: false
      })
    } catch (e) {
      alert(`Failed to fetch items: ${e.message}`)
    }
  }

  render() {
    const { auth } = this.props;
    const { items } = this.state;

    return (
      <div>
        <Header as="h1">TODOs</Header>
        {<CreateItem auth={auth} position="top"/>}
        {
          items && items.length && items.map(item => (
            <ViewItem 
              auth={this.props.auth}
              item={item}
            />
          ))
        }
        {<CreateItem auth={auth} position="bottom"/>}
      </div>
    )
  }

  renderItems() {
    if (this.state.loadingItems) {
      return this.renderLoading()
    }

    return this.renderItemsList()
  }

  renderLoading() {
    return (
      <Grid.Row>
        <Loader indeterminate active inline="centered">
          Loading TODOs
        </Loader>
      </Grid.Row>
    )
  }

  renderItemsList() {
    return (
      <Grid padded>
        {this.state.items.map((item, pos) => {
          return (
            <Grid.Row key={item.id}>
              {/* <Grid.Column width={1} verticalAlign="middle">
                <Checkbox
                  onChange={() => this.onItemCheck(pos)}
                  checked={item.done}
                />
              </Grid.Column> */}
              <Grid.Column width={10} verticalAlign="middle">
                {item.title}
              </Grid.Column>
              <Grid.Column width={3} floated="right">
                {item.description}
              </Grid.Column>
              <Grid.Column width={1} floated="right">
                <Button
                  icon
                  color="red"
                  onClick={() => this.onItemDelete(item.id)}
                >
                  <Icon name="delete" />
                </Button>
              </Grid.Column>
              <Grid.Column width={16}>
                <Divider />
              </Grid.Column>
            </Grid.Row>
          )
        })}
      </Grid>
    )
  }
}
