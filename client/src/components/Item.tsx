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
import { Item } from '../types/Item'

interface ItemsProps {
  auth: Auth
  history: History
}

interface ItemsState {
  newItemTitle: string
  newItemDescription: string
  newItemUrl: string
  newItemCategory: string
  loadingItems: boolean
}
const initialItemsState = {
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

  handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const target = event.target;
    const value = target.value;
    const name = target.name;

    this.setState({
      ...this.state,
      [name]: value
    });
  }

  onEditButtonClick = (itemId: string) => {
    this.props.history.push(`/items/${itemId}/edit`)
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
      })
    } catch {
      alert('Item creation failed')
    }
  }

  onItemDelete = async (itemId: string) => {
    try {
      await deleteItem(this.props.auth.getIdToken(), itemId)
    } catch {
      alert('Item deletion failed')
    }
  }

  render() {
    return (
      <div>
        <Header as="h1">TODOs</Header>

        {this.renderCreateItemInput()}

        {this.renderItem()}
      </div>
    )
  }

  createInputForm(inputName: string) {
    return (
      <Input
        name={inputName}
        action={{
          color: 'teal',
          labelPosition: 'left',
          icon: 'add',
          content: 'New task',
          onClick: this.onItemCreate
        }}
        fluid
        actionPosition="left"
        placeholder={inputName}
        onChange={this.handleInputChange}
      />
    )
  }

  renderCreateItemInput() {
    return [
      'newItemTitle',
      'newItemDescription',
      'newItemCategory',
      'newItemUrl'
    ].map((fieldName) => (
      <Grid.Row>
        <Grid.Column width={16}>
          {this.createInputForm(fieldName)}
        </Grid.Column>
      </Grid.Row>
    )
  )}

  renderLoading() {
    return (
      <Grid.Row>
        <Loader indeterminate active inline="centered">
          Loading TODOs
        </Loader>
      </Grid.Row>
    )
  }

  renderItem() {
    return (
      <div/>
    )
  }

  calculateDueDate(): string {
    const date = new Date()
    date.setDate(date.getDate() + 7)

    return dateFormat(date, 'yyyy-mm-dd') as string
  }
}
