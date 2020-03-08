import * as uuid from 'uuid';
import * as React from 'react'
import {
  Button,
  Card,
  Dropdown,
  Form,
  Icon,
  Input,
} from 'semantic-ui-react'
import TextareaAutosize from "react-textarea-autosize";

import { patchItem } from '../api/items-api'
import { getLayoutByUserId } from '../api/layout-api'
import { UserWrapper } from '../context/userContext'
import { LayoutWrapper } from '../context/layoutContext'
import { AuthWrapper } from '../context/auth0-context';
import { WrappedMoveItem } from './MoveItem'
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
  items: Item[]
  moveSubItem?: (movedSubItem: SubItem, originalItem: Item, targetItem: Item) => void
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
  newItemAnchorText: string
  newItemCategory: string
  newItemSubItems: SubItem[]
  newSubItemAnchorText: string
  newSubItemTitle: string
  newSubItemDescription: string
  newSubItemUrl: string
  currentlyEditedSubitem: string
  currentlyEditedSubItemAnchorText: string
  currentlyEditedSubItemTitle: string
  currentlyEditedSubItemDescription: string
  currentlyEditedSubItemUrl: string
  hasUnsavedChanges: boolean
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
  currentlyEditedSubItemAnchorText: '',
  currentlyEditedSubItemTitle: '',
  currentlyEditedSubItemDescription: '',
  currentlyEditedSubItemUrl: '',
  currentlyEditedSubitem: '',
  hasUnsavedChanges: false,
}
export class EditItem extends React.PureComponent<ItemsProps, ItemsState> {
  state: ItemsState = {
    ...initialItemsState
  }

  componentWillMount = () => {
    const { item } = this.props;
    this.setState({
      newItemAnchorText: item.anchorText || '',
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
      [name]: value,
      hasUnsavedChanges: true,
    });
  }

  handleTextBoxChange = (event: React.ChangeEvent<HTMLInputElement>, data: any) => {
    const value = event.target.value;
    const name = event.target.name;

    this.setState({
      ...this.state,
      [name]: value,
      hasUnsavedChanges: true,
    });
  }

  // subitem methods start

  setCurrentlyEditedSubItem = (subItemId: string) => {
    const currentlyEditedSubItem = this.state.newItemSubItems.find(subItem => subItem.id === subItemId); 
    const usedFields = {
      title: currentlyEditedSubItem ? currentlyEditedSubItem.title : '',
      description: currentlyEditedSubItem ? currentlyEditedSubItem.description : '',
      url: currentlyEditedSubItem ? currentlyEditedSubItem.url : '',
      anchorText: currentlyEditedSubItem ? currentlyEditedSubItem.anchorText : '',
    }
    
    //@ts-ignore-block
    this.setState({
      currentlyEditedSubitem: subItemId,
      currentlyEditedSubItemTitle: usedFields.title,
      currentlyEditedSubItemDescription: usedFields.description,
      currentlyEditedSubItemUrl: usedFields.url,
      currentlyEditedSubItemAnchorText: usedFields.anchorText,
    })
  }

  deleteSubItemFromState = (subItemId: string) => {
    const newArray = this.state.newItemSubItems.filter(subItem => {
      return subItem.id !== subItemId
    });

    this.setState({
      ...this.state,
      newItemSubItems: newArray,
      hasUnsavedChanges: true,
    })
  }

  addSubItemToState = (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    event.preventDefault();
    const addedItem = {
      id: uuid.v4(),
      title: this.state.newSubItemTitle,
      description: this.state.newSubItemDescription,
      url: this.state.newSubItemUrl,
      anchorText: this.state.newSubItemAnchorText,
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
      newSubItemAnchorText: '',
      hasUnsavedChanges: true,
    });
  }

  updateSubItemToState = (subItemId: string) => {
    const editedSubItemsArray = this.state.newItemSubItems.map(subItem => {
      if(subItem.id === subItemId) {
        return {
          ...subItem,
          title: this.state.currentlyEditedSubItemTitle,
          description: this.state.currentlyEditedSubItemDescription,
          url: this.state.currentlyEditedSubItemUrl,
          anchorText: this.state.currentlyEditedSubItemAnchorText,
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
      newSubItemAnchorText: '',
      hasUnsavedChanges: true,
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
          anchorText: this.state.newItemAnchorText,
          subItems: this.state.newItemSubItems,
        }
      )
      
      console.log('item update success', newItem)

      this.setState({
        hasUnsavedChanges: false,
      });

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
                  <Card.Content
                    key={subItem.id}
                  >
                    {
                      this.state.currentlyEditedSubitem === subItem.id ?
                      (
                        <Card><Card.Content>
                          <Form.Field 
                            control={Input}
                            name='currentlyEditedSubItemTitle'
                            label='currentlyEditedSubItemTitle'
                            value={this.state.currentlyEditedSubItemTitle}
                            placeholder='title'
                            onChange={this.handleInputChange}
                          />
                          <Form.Field 
                            control={TextareaAutosize}
                            name='currentlyEditedSubItemDescription'
                            label='currentlyEditedSubItemDescription'
                            value={this.state.currentlyEditedSubItemDescription}
                            placeholder='description'
                            onChange={this.handleTextBoxChange}
                          />
                          <Form.Field 
                            control={Input}
                            name='currentlyEditedSubItemUrl'
                            label='currentlyEditedSubItemUrl'
                            value={this.state.currentlyEditedSubItemUrl}
                            placeholder='url (optional)'
                            onChange={this.handleInputChange}
                          />
                          <Form.Field 
                            control={Input}
                            name='currentlyEditedSubItemAnchorText'
                            label='currentlyEditedSubItemAnchorText'
                            value={this.state.currentlyEditedSubItemAnchorText}
                            placeholder='anchor text for url (required if url to be shown)'
                            onChange={this.handleInputChange}
                          />
                          <div>
                            <Button icon onClick={()=> this.updateSubItemToState(subItem.id)}>Save SubItem</Button>
                            <Button icon onClick={()=> this.setCurrentlyEditedSubItem('')}>Cancel</Button>
                            <WrappedMoveItem item={this.props.item} subItem={subItem} hasUnsavedChanges={this.state.hasUnsavedChanges} />
                          </div>
                        </Card.Content></Card>
                      ) : ( 
                        <Card fluid>
                          <Card.Content>
                            <Card.Header>{subItem.title}</Card.Header>
                            <Card.Description>{subItem.description}</Card.Description>
                            {subItem.url && <Card.Content><a href={subItem.url} target="_blank">{subItem.anchorText || "no anchor text"}</a></Card.Content>}
                          </Card.Content>
                          <Card.Content>
                            <Button icon onClick={()=> this.setCurrentlyEditedSubItem(subItem.id)}>Edit</Button>
                            <Button icon onClick={()=> this.deleteSubItemFromState(subItem.id)}><Icon name='trash' /></Button>
                            <WrappedMoveItem item={this.props.item} subItem={subItem} hasUnsavedChanges={this.state.hasUnsavedChanges }/>
                          </Card.Content>
                        </Card>
                      )
                    }
                    
                  </Card.Content>

                ))
              }
                <Card><Card.Content>
                  <Card.Header>Add Subitem</Card.Header>
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
                  </Card.Content>
                  <Card.Content>
                    <Button icon onClick={this.addSubItemToState}>Add SubItem</Button>
                  </Card.Content>
                </Card.Content></Card>
              </Card.Content>
            </Card>
            <Button icon onClick={this.props.toggleEditItem}>Cancel</Button>
            <Button icon onClick={this.onItemUpdate}>Save Changes</Button>
          </Form>
        </Card.Content>
      </Card>
    )
  }
}

export const WrappedEditItem = AuthWrapper(LayoutWrapper(UserWrapper(EditItem)));