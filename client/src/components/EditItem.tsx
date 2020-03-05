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
  CardContent,
  Dropdown
} from 'semantic-ui-react'

import { createItem, deleteItem, getItems, patchItem } from '../api/items-api'
import { getLayoutByUserId } from '../api/layout-api'
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

interface ToggleItemFunc {
  (): void;
}

interface ItemsProps {
  item: Item,
  toggleEditItem: ToggleItemFunc
  // the below is from User HoC
  user: User
  // the below is from Layout HoC
  setLayout: (layout: layoutItem[]) => void
  // the below is from Auth HoC
  userId: string
  idToken: string
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
  currentlyEditedSubitem: string
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
  currentlyEditedSubitem: '',
}
export class EditItem extends React.PureComponent<ItemsProps, ItemsState> {
  state: ItemsState = {
    ...initialItemsState
  }

  componentWillMount = () => {
    const { item } = this.props;
    this.setState({
      newItemTitle: item.title,
      newItemDescription: item.description || '',
      newItemUrl: item.url || '',
      newItemCategory: item.category || '',
      newItemSubItems: item.subItems || [],
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

  // subitem methods start

  setCurrentlyEditedSubItem = (subItemId: string) => {
    const currentlyEditedSubItem = this.state.newItemSubItems.find(subItem => subItem.id === subItemId); 
    const usedFields = {
      title: currentlyEditedSubItem ? currentlyEditedSubItem.title : '',
      description: currentlyEditedSubItem ? currentlyEditedSubItem.description : '',
      url: currentlyEditedSubItem ? currentlyEditedSubItem.url : ''
    }
    
    //@ts-ignore-block
    this.setState({
      currentlyEditedSubitem: subItemId,
      newSubItemTitle: usedFields.title,
      newSubItemDescription: usedFields.description,
      newSubItemUrl: usedFields.url,
    })
  }

  deleteSubItemFromState = (subItemId: string) => {
    const newArray = this.state.newItemSubItems.filter(subItem => {
      return subItem.id !== subItemId
    });

    this.setState({
      ...this.state,
      newItemSubItems: newArray,
    })
  }

  addSubItemToState = (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    event.preventDefault();
    const addedItem = {
      id: uuid.v4(),
      title: this.state.newSubItemTitle,
      description: this.state.newSubItemDescription,
      url: this.state.newSubItemUrl,
      createdAt: new Date().toISOString(),
      modifiedAt: new Date().toISOString(),
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

  updateSubItemToState = (subItemId: string) => {
    const editedSubItemsArray = this.state.newItemSubItems.map(subItem => {
      if(subItem.id === subItemId) {
        return {
          ...subItem,
          title: this.state.newSubItemTitle,
          description: this.state.newSubItemDescription,
          url: this.state.newSubItemUrl,
          modifiedAt: new Date().toISOString(),
        }
      } else {
        return subItem
      }
    });

    this.setState({
      newItemSubItems: editedSubItemsArray,
      currentlyEditedSubitem: '',
      newSubItemTitle: '',
      newSubItemDescription: '',
      newSubItemUrl: '',
    })
  }

  // subitem methods end

  onItemUpdate = async (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    event.preventDefault();
    try {
      console.log('this.state in onItemUpdate', this.state);
      const newItem = await patchItem(
        this.props.idToken,
        this.props.item.id,
        {
          ...this.props.item,
          title: this.state.newItemTitle,
          description: this.state.newItemDescription,
          category: this.state.newItemCategory,
          url: this.state.newItemUrl,
          subItems: this.state.newItemSubItems,
        }
      )
      
      console.log('item update success', newItem)

      const updatedLayout = await getLayoutByUserId(
        this.props.idToken,
        this.props.userId
      );

      this.props.setLayout(updatedLayout)
      this.props.toggleEditItem()
      
      // tell parent to add item if successful
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
          this.renderEditItemInput(categoryOptions)
        }
      </div>
    )
  }

  renderEditItemInput(categoryOptions: any) {
    return (
      <Card fluid>
        <Card.Content>
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
            <Card fluid>
              <Card.Content>
                <Card.Header>Subitems (optional)</Card.Header>
              </Card.Content>
              <Card.Content>
              {
                this.state.newItemSubItems.map(subItem => (
                  <Card.Content
                    key={subItem.id}
                  >
                    {
                      this.state.currentlyEditedSubitem === subItem.id ?
                      (
                        <React.Fragment>
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
                          <div>
                            <Button onClick={()=> this.updateSubItemToState(subItem.id)}>Save SubItem</Button>
                            <Button onClick={()=> this.setCurrentlyEditedSubItem('')}>Cancel</Button>
                          </div>
                        </React.Fragment>
                      ) : ( 
                        <React.Fragment>
                          <Card.Content>
                            <Card.Header>{subItem.title}</Card.Header>
                            <Card.Description>{subItem.description}</Card.Description>
                          </Card.Content>
                          <Card.Content>
                            <Button onClick={()=> this.setCurrentlyEditedSubItem(subItem.id)}>Edit this SubItem</Button>
                            <Button onClick={()=> this.deleteSubItemFromState(subItem.id)}>Delete this SubItem</Button>
                          </Card.Content>
                        </React.Fragment>
                      )
                    }
                    
                  </Card.Content>

                ))
              }
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
                <Button onClick={this.addSubItemToState}>Add SubItem</Button>
              </Card.Content>
              </Card.Content>
            </Card>
            <Button onClick={this.props.toggleEditItem}>Cancel</Button>
            <Button onClick={this.onItemUpdate}>Save Changes</Button>
          </Form>
        </Card.Content>
      </Card>
    )
  }
}

export const WrappedEditItem = AuthWrapper(LayoutWrapper(UserWrapper(EditItem)));