import dateFormat from 'dateformat'
import update from 'immutability-helper'
import * as React from 'react'
import {
  Button,
  Card,
  Checkbox,
  Divider,
  Form,
  Grid,
  Header,
  Icon,
  Input,
  Image,
  Loader
} from 'semantic-ui-react'

import { getUser, patchUser } from '../api/users-api'
import Auth from '../auth/Auth'
import { User } from '../types/User'
import { Category } from '../types/Category'

interface ItemsProps {
  auth: Auth
}

interface ItemsState {
  isProfilePublic: boolean,
  displayName?: string | null,
  categories?: Category[],
  currentlyEditedCategoryName: string,
  currentlyEditedCategoryOrder: number,
  currentlyEditedCategoryPublic: boolean,
}
const initialItemsState = {
  isProfilePublic: false,
  displayName: null,
  categories: [],
  currentlyEditedCategoryName: '',
  currentlyEditedCategoryOrder: 100,
  currentlyEditedCategoryPublic: false,
}

export class Profile extends React.PureComponent<ItemsProps, ItemsState> {
  state: ItemsState = {
    ...initialItemsState
  }

  async componentDidMount() {
    const { auth } = this.props;
    const userId = auth.getUserId();
    const idToken = auth.getIdToken();

    try {
      const {
        isProfilePublic, displayName, categories
      } = await getUser(idToken, userId)
      this.setState({
        // ...this.state,
        isProfilePublic, displayName, categories
      })
    } catch (e) {
      alert(`Failed to fetch user: ${e.message}`)
    }
  }

  handleInputChange = (event: React.ChangeEvent<HTMLInputElement>, data: any) => {
    const value = data.type === 'checkbox' ? data.checked : data.value;
    const name = data.name;

    this.setState({
      ...this.state,
      [name]: value
    });
  }

  updateCategoryToState = (categoryName: string) => {
    const categories = this.state.categories ? this.state.categories : [];
    const editedCategoriesArray = categories.map(category => {
      if(category.name === categoryName) {
        return {
          name: this.state.currentlyEditedCategoryName,
          order: this.state.currentlyEditedCategoryOrder,
          public: this.state.currentlyEditedCategoryPublic
        } as Category
      } else {
        return category
      }
    });

    this.setState({
      ...this.state,
      categories: editedCategoriesArray,
      currentlyEditedCategoryName: '',
      currentlyEditedCategoryOrder: 100,
      currentlyEditedCategoryPublic: false,
    })
  }

  setCurrentlyEditedCategory = (categoryName: string) => {
    const categories = this.state.categories ? this.state.categories : [];
    const currentlyEditedCategory = categories.find(category => category.name === categoryName); 
    const usedFields = {
      name: currentlyEditedCategory ? currentlyEditedCategory.name : '',
      order: currentlyEditedCategory ? currentlyEditedCategory.order : 100,
      public: currentlyEditedCategory ? currentlyEditedCategory.public : false
    }
    
    this.setState({
      currentlyEditedCategoryName: usedFields.name,
      currentlyEditedCategoryOrder: usedFields.order,
      currentlyEditedCategoryPublic: usedFields.public,
    })
  }

  deleteCategoryFromState = (categoryName: string) => {
    const categories = this.state.categories ? this.state.categories : [];
    const newArray = categories.filter(category => {
      return category.name !== categoryName
    });

    this.setState({
      ...this.state,
      categories: newArray,
    })
  }

  addCategoryToState = () => {
    const { 
      currentlyEditedCategoryName,
      currentlyEditedCategoryOrder = null, 
      currentlyEditedCategoryPublic = false
    } = this.state;
    const categories = this.state.categories ? this.state.categories : [];
    const newCategory = {
      name: currentlyEditedCategoryName,
      order: currentlyEditedCategoryOrder,
      public: currentlyEditedCategoryPublic
    } as Category;
    console.log('categories', categories)
    const newArray = [
      ...categories,
      newCategory
    ]

    this.setState({
      ...this.state,
      categories: newArray,
    })
  }

  onUserUpdate = async (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    event.preventDefault();
    try {
      console.log('this.state in onUserUpdate', this.state);
      const newUser = await patchUser(
        this.props.auth.getIdToken(),
        this.props.auth.getUserId(),
        {
          userId: this.props.auth.getUserId(),
          isProfilePublic: this.state.isProfilePublic,
          displayName: this.state.displayName || null,
          categories: this.state.categories
        }
      )
      
      console.log('item update success', newUser)

    } catch {
      alert('Item creation failed')
    }
  }

  render() {
    const { auth } = this.props;
    const { isProfilePublic, displayName, categories } = this.state;

    return (
      <Form>
        <Form.Field 
          control={Checkbox}
          name='isProfilePublic'
          label='is Profile Public'
          checked={this.state.isProfilePublic}
          placeholder={false}
          onChange={this.handleInputChange}
        />
        <Form.Field 
          control={Input}
          name='displayName'
          label='display name for public profile'
          placeholder='display name for public profile, i.e. imbibe.dev/public/:displayName'
          value={this.state.displayName}
          onChange={this.handleInputChange}
        />
        <Card fluid>
          <Card.Content>
            <Card.Header>categories</Card.Header>
          </Card.Content>
          <Card.Content>
            {
              this.state.categories && this.state.categories.map((category, idx) => (
                <Card.Content
                  key={category.name}
                >
                  {
                    this.state.currentlyEditedCategoryName === category.name ?
                    (
                      <React.Fragment>
                        <Form.Field 
                          control={Input}
                          name='currentlyEditedCategoryName'
                          label='category name'
                          value={this.state.currentlyEditedCategoryName}
                          placeholder='category name'
                          onChange={this.handleInputChange}
                        />
                        <Form.Field 
                          control={Input}
                          name='currentlyEditedCategoryOrder'
                          label='category display order'
                          value={this.state.currentlyEditedCategoryOrder}
                          placeholder={idx + 1}
                          onChange={this.handleInputChange}
                        />
                        <Form.Field 
                          control={Checkbox}
                          name='currentlyEditedCategoryPublic'
                          label='publically viewable category'
                          checked={this.state.currentlyEditedCategoryPublic}
                          placeholder={false}
                          onChange={this.handleInputChange}
                        />
                        <div>
                          <Button onClick={()=> this.updateCategoryToState(category.name)}>Save Category</Button>
                          <Button onClick={()=> this.setCurrentlyEditedCategory('')}>Cancel</Button>
                        </div>
                      </React.Fragment>
                    ) : ( 
                      <React.Fragment>
                        <Card.Content>
                          <Card.Header>name: {category.name}</Card.Header>
                          <Card.Description>order: {category.order}</Card.Description>
                          <Card.Description>isCategoryPublic: {(category.public).toString()}</Card.Description>
                        </Card.Content>
                        <Card.Content>
                          <Button onClick={()=> this.setCurrentlyEditedCategory(category.name)}>Edit this SubItem</Button>
                          <Button onClick={()=> this.deleteCategoryFromState(category.name)}>Delete this SubItem</Button>
                        </Card.Content>
                      </React.Fragment>
                    )
                  }
                  
                </Card.Content>
              ))
            }
          </Card.Content>
          <Card.Content>
            Add new Category:
            <Form.Field 
              control={Input}
              name='currentlyEditedCategoryName'
              label='category name'
              value={this.state.currentlyEditedCategoryName}
              placeholder='category name'
              onChange={this.handleInputChange}
            />
            <Form.Field 
              control={Input}
              name='currentlyEditedCategoryOrder'
              label='category display order'
              value={this.state.currentlyEditedCategoryOrder}
              placeholder={100}
              onChange={this.handleInputChange}
            />
            <Form.Field 
              control={Checkbox}
              name='currentlyEditedCategoryPublic'
              label='publically viewable category'
              checked={this.state.currentlyEditedCategoryPublic}
              placeholder={false}
              onChange={this.handleInputChange}
            />
            <div>
              <Button onClick={()=> this.addCategoryToState()}>Save Category</Button>
            </div>
          </Card.Content>
        </Card>
        <Button onClick={this.onUserUpdate}>Submit</Button>
      </Form>
    )
  }

}
