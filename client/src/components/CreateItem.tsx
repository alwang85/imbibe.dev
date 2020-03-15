import * as React from 'react';
import * as uuid from 'uuid';

import {
  Button,
  Card,
  Dropdown,
  Form,
  Input,
} from 'semantic-ui-react'
import TextareaAutosize from "react-textarea-autosize";

import { createItem } from '../api/items-api'
import { getLayoutByUserId } from '../api/layout-api'
import { ItemsWrapper } from '../context/itemsContext';
import { UserWrapper } from '../context/userContext'
import { LayoutWrapper } from '../context/layoutContext'
import { AuthWrapper } from '../context/auth0-context';
import { User } from '../types/User'
import { Item } from '../types/Item'
import { SubItem } from '../types/SubItem'

interface layoutItem {
  items: Item[],
  category: string
}

interface ItemsProps {
  position: any
  user: User
  setLayout: (layout: layoutItem[]) => void
  categoryName: string
  // below comes from ItemsWrapper HoC
  fetchLayoutAndItems: () => {}, // updates the layout and items list
  // below comes from AuthWrapper HoC
  idToken: string,
  userId: string,
}

interface ItemsState {
  showForm: boolean,
  newItemAnchorText: string
  newItemTitle: string
  newItemDescription: string
  newItemUrl: string
  newItemCategory: string
  newItemSubItems: SubItem[]
  newSubItemAnchorText: string
  newSubItemTitle: string
  newSubItemDescription: string
  newSubItemUrl: string
}
const initialItemsState = {
  showForm: false,
  newItemTitle: '',
  newItemDescription: '',
  newItemUrl: '',
  newItemAnchorText: '',
  newItemCategory: '',
  newItemSubItems: [],
  newSubItemTitle: '',
  newSubItemDescription: '',
  newSubItemUrl: '',
  newSubItemAnchorText: '',
}
export class CreateItem extends React.PureComponent<ItemsProps, ItemsState> {
  state: ItemsState = {
    ...initialItemsState
  }

  componentWillMount = () => {
    const { categoryName } = this.props;
    if(categoryName) this.setState({ newItemCategory : categoryName });
  }

  toggleForm = () => {
    this.setState({
      showForm: !this.state.showForm,
    })
  }

  handleInputChange = (event: React.ChangeEvent<HTMLInputElement>, data: any) => {
    const value = data.type === 'checkbox' ? data.checked : data.value;
    const name = data.name;

    this.setState({
      ...this.state,
      [name]: value
    });
  }

  handleTextBoxChange = (event: React.ChangeEvent<HTMLInputElement>, data: any) => {
    const value = event.target.value;
    const name = event.target.name;

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
      url: this.state.newSubItemUrl,
      anchorText: this.state.newSubItemAnchorText,
    } as SubItem;

    this.setState({
      newItemSubItems: [
        ...this.state.newItemSubItems,
        addedItem
      ],
      newSubItemTitle: '',
      newSubItemDescription: '',
      newSubItemUrl: '',
      newItemAnchorText: '',
      newSubItemAnchorText: '',
    });
  }


  onItemCreate = async (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    event.preventDefault();
    try {
      console.log('this.state in onItemCreate', this.state);
      const newItem = await createItem(this.props.idToken, {
        title: this.state.newItemTitle,
        description: this.state.newItemDescription,
        category: this.state.newItemCategory,
        url: this.state.newItemUrl,
        anchorText: this.state.newItemAnchorText,
        subItems: this.state.newItemSubItems,
      });

      await this.props.fetchLayoutAndItems();
      
      // tell parent to add item if successful
      console.log('new item creation success', newItem)

      this.setState({
        ...initialItemsState,
      });
      
    } catch {
      alert('Item creation failed')
    }
  }

  render() {
    const categories = this.props.user.categories || [];
    const categoryOptions = categories.map(category => ({
      key: category.name,
      text: category.name,
      value: category.name,
    }));

    return (
      <div>
        {
          this.state.showForm ? 
          this.renderCreateItemInput(categoryOptions) :
          <Button 
            attached={this.props.position}
            onClick={this.toggleForm}
          >
            Add Item ({this.props.categoryName})
          </Button>
        }
      </div>
    )
  }

  renderCreateItemInput(categoryOptions: any) {
    return (
      <Card fluid>
        <Card.Content><Form>
          <Form.Field 
            control={Input}
            name='newItemTitle'
            label='title'
            placeholder='title'
            value={this.state.newItemTitle}
            onChange={this.handleInputChange}
          />
          <Form.Field 
            control={TextareaAutosize}
            name='newItemDescription'
            label='description'
            placeholder='description'
            value={this.state.newItemDescription}
            onChange={this.handleTextBoxChange}
          />
          <Form.Field
            control={Dropdown}
            placeholder='Select Category'
            name='newItemCategory'
            label='category'
            options={categoryOptions}
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
          <Form.Field 
            control={Input}
            name='newItemAnchorText'
            label='anchorText'
            placeholder='anchor text for url (required if url to be shown)'
            value={this.state.newItemAnchorText}
            onChange={this.handleInputChange}
          />
          <Card fluid>
            <Card.Content>
              <Card.Header>Subitems (optional)</Card.Header>
            </Card.Content>
            <Card.Content>
              {
                this.state.newItemSubItems.map(subItem => (
                  <React.Fragment>
                    <br />
                    <Card.Content key={subItem.id}>
                      <Card.Header>{subItem.title}</Card.Header>
                      <Card.Description>{subItem.description}</Card.Description>
                      {subItem.url && <Card.Content><a href={subItem.url} target="_blank">{subItem.anchorText || "no anchor text"}</a></Card.Content>}
                    </Card.Content>
                  </React.Fragment>
                ))
              }
            </Card.Content>
            {
              <Card.Content>
                <Card.Header>Add Subitem</Card.Header>
                <Form.Field 
                  control={Input}
                  name='newSubItemTitle'
                  label='newSubItemTitle'
                  value={this.state.newSubItemTitle}
                  placeholder='title'
                  onChange={this.handleInputChange}
                />
                <Form.Field 
                  control={TextareaAutosize}
                  name='newSubItemDescription'
                  label='newSubItemDescription'
                  value={this.state.newSubItemDescription}
                  placeholder='description'
                  onChange={this.handleTextBoxChange}
                />
                <Form.Field 
                  control={Input}
                  name='newSubItemUrl'
                  label='newSubItemUrl'
                  value={this.state.newSubItemUrl}
                  placeholder='url (optional)'
                  onChange={this.handleInputChange}
                />
                <Form.Field 
                  control={Input}
                  name='newSubItemAnchorText'
                  label='newSubItemAnchorText'
                  value={this.state.newSubItemAnchorText}
                  placeholder='anchor text for url (required if url to be shown)'
                  onChange={this.handleInputChange}
                />
                <Button onClick={this.addSubitemToState}>Add SubItem</Button>
              </Card.Content>
            }

          </Card>
          <Button onClick={this.toggleForm}>Cancel</Button>
          <Button onClick={this.onItemCreate}>Submit</Button>
        </Form></Card.Content>
      </Card>
    )
  }
}

export const WrappedCreateItem = ItemsWrapper(AuthWrapper(LayoutWrapper(UserWrapper(CreateItem))));