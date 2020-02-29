import dateFormat from 'dateformat'
import { History } from 'history'
import update from 'immutability-helper'
import * as uuid from 'uuid';
import * as React from 'react'
import {
  Button,
  Form,
  Input,
  TextArea,
  Card,
  CardContent
} from 'semantic-ui-react'

import { createItem, deleteItem, getItems, patchItem } from '../api/items-api'
import Auth from '../auth/Auth'
import { Item } from '../types/Item'
import { SubItem } from '../types/SubItem'

interface ItemsProps {
  auth: Auth
  position: any
}

interface ItemsState {
  showForm: boolean,
  newItemTitle: string
  newItemDescription: string
  newItemUrl: string
  newItemCategory: string
  newItemSubItems: SubItem[]
  newSubItemTitle: string
  newSubItemDescription: string
  newSubItemUrl: string
}
const initialItemsState = {
  showForm: false,
  newItemTitle: '',
  newItemDescription: '',
  newItemUrl: '',
  newItemCategory: '',
  newItemSubItems: [],
  newSubItemTitle: '',
  newSubItemDescription: '',
  newSubItemUrl: '',
}
export class CreateItem extends React.PureComponent<ItemsProps, ItemsState> {
  state: ItemsState = {
    ...initialItemsState
  }

  toggleForm = () => {
    this.setState({
      showForm: !this.state.showForm,
    })
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

  addSubitemToState = (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    event.preventDefault();
    const addedItem = {
      id: uuid.v4(),
      title: this.state.newSubItemTitle,
      description: this.state.newSubItemDescription,
      url: this.state.newSubItemUrl
    } as SubItem;

    this.setState({
      newItemSubItems: [
        ...this.state.newItemSubItems,
        addedItem
      ],
      newSubItemTitle: '',
      newSubItemDescription: '',
      newSubItemUrl: '',
    });
  }


  onItemCreate = async (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    event.preventDefault();
    try {
      console.log('this.state in onItemCreate', this.state);
      const newItem = await createItem(this.props.auth.getIdToken(), {
        title: this.state.newItemTitle,
        description: this.state.newItemDescription,
        category: this.state.newItemCategory,
        url: this.state.newItemUrl,
        subItems: this.state.newItemSubItems,
      })
      
      // tell parent to add item if successful
      console.log('new item creation success', newItem)
    } catch {
      alert('Item creation failed')
    }
  }

  render() {
    return (
      <div>
        {
          this.state.showForm ? 
          this.renderCreateItemInput() :
          <Button attached={this.props.position} onClick={this.toggleForm}>Add Item</Button>
        }
      </div>
    )
  }

  renderCreateItemInput() {
    return (
      <Form>
        <Form.Field 
          control={Input}
          name='newItemTitle'
          label='title'
          placeholder='title'
          value={this.state.newItemTitle}
          onChange={this.handleInputChange}
        />
        <Form.Field 
          control={TextArea}
          name='newItemDescription'
          label='description'
          placeholder='description'
          value={this.state.newItemDescription}
          onChange={this.handleInputChange}
        />
        <Form.Field 
          control={Input}
          name='newItemCategory'
          label='category'
          placeholder='category'
          value={this.state.newItemCategory}
          onChange={this.handleInputChange}
        />
        <Form.Field 
          control={Input}
          name='newItemUrl'
          label='url'
          placeholder='url (optional)'
          value={this.state.newItemUrl}
          onChange={this.handleInputChange}
        />
        <Card fluid>
          <Card.Content>
            <Card.Header>Subitems (optional)</Card.Header>
          </Card.Content>
          <Card.Content>
            {
              this.state.newItemSubItems.map(subItem => (
                <div key={subItem.id}>
                  <div>title: {subItem.title}</div>
                  <div>description: {subItem.description}</div>
                  <div>url: {subItem.url}</div>
                </div>
              ))
            }
          </Card.Content>
          {
            <Card.Content>
              <Form.Field 
                control={Input}
                name='newSubItemTitle'
                label='newSubItemTitle'
                value={this.state.newSubItemTitle}
                placeholder='title'
                onChange={this.handleInputChange}
              />
              <Form.Field 
                control={TextArea}
                name='newSubItemDescription'
                label='newSubItemDescription'
                value={this.state.newSubItemDescription}
                placeholder='description'
                onChange={this.handleInputChange}
              />
              <Form.Field 
                control={Input}
                name='newSubItemUrl'
                label='newSubItemUrl'
                value={this.state.newSubItemUrl}
                placeholder='url (optional)'
                onChange={this.handleInputChange}
              />
              <Button onClick={this.addSubitemToState}>Add SubItem</Button>
            </Card.Content>
          }

        </Card>
        <Button onClick={this.onItemCreate}>Submit</Button>
      </Form>
    )
  }
}
