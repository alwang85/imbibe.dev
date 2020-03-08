import * as React from 'react'
import {
  Button,
  Card,
  Checkbox,
  Form,
  Input,
} from 'semantic-ui-react'

import { getUser, patchUser, getDisplayNameAvailability } from '../api/users-api'
import { AuthWrapper } from '../context/auth0-context';
import { UserWrapper } from '../context/userContext'
import { User } from '../types/User'
import { Category } from '../types/Category'

interface ItemsProps {
  // the following comes from UserWrapper HoC
  setUser: (user: User, forceUpdate: boolean) => void,
  user: User,
  // the following comes from AuthWrapper HoC
  idToken: string,
  userId: string,
}

interface ItemsState {
  isProfilePublic: boolean,
  displayName?: string | null,
  categories?: Category[],
  currentlyEditedCategoryName: string,
  currentlyEditedCategoryOrder: number,
  currentlyEditedCategoryPublic: boolean,
  isDisplayNameAvailable: boolean,
}
const initialItemsState = {
  isProfilePublic: false,
  displayName: null,
  categories: [],
  currentlyEditedCategoryName: '',
  currentlyEditedCategoryOrder: 100,
  currentlyEditedCategoryPublic: false,
  isDisplayNameAvailable: true,
}

export class Profile extends React.PureComponent<ItemsProps, ItemsState> {
  state: ItemsState = {
    ...initialItemsState
  }

  async componentDidMount() {
    const { idToken, userId } = this.props;

    try {
      const {
        isProfilePublic, displayName, categories
      } = await getUser(idToken, userId)
      this.setState({
        isProfilePublic, displayName, categories
      })
    } catch (e) {
      alert(`Failed to fetch user: ${e.message}`)
    }
  }

  handleDisplayNameChange = async (event: React.ChangeEvent<HTMLInputElement>, data: any) => {
    const currentSavedUser = this.props.user.displayName;
    try {
      const value = data.value;
      const name = data.name;

      this.setState({ 
        ...this.state,
        [name] : value
      });

      if (data.value && data.value !== currentSavedUser) {
        const { displayNameAvailable = false } = await getDisplayNameAvailability(
          this.props.idToken,
          data.value
        );

        this.setState({
          isDisplayNameAvailable: displayNameAvailable,
        });
        
      }
    } catch(e) {
      this.setState({
        isDisplayNameAvailable: false,
      })
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
        this.props.idToken,
        this.props.userId,
        {
          userId: this.props.userId,
          isProfilePublic: this.state.isProfilePublic,
          displayName: this.state.displayName || null,
          categories: this.state.categories
        }
      )
      
      console.log('item update success', newUser)
      this.props.setUser(newUser, true);

    } catch {
      alert('Item creation failed')
    }
  }

  render() {
    const { isProfilePublic, displayName, categories } = this.state;

    return (
      <Card fluid><Card.Content>
        <Form>
          <Card fluid>
            <Card.Content>
              <Card.Header>Profile</Card.Header>
            </Card.Content>
            <Card.Content>
              <Form.Field 
                control={Input}
                name='displayName'
                label='display name for public profile, i.e. imbibe.dev/public/:displayName'
                placeholder='display name for public profile, i.e. imbibe.dev/public/:displayName'
                value={this.state.displayName}
                onChange={this.handleDisplayNameChange}
                error={ this.state.isDisplayNameAvailable ? null : {
                  content: `display name ${this.state.displayName} is not available`,
                  pointing: 'below',
                }}
              />
              <Form.Field 
                control={Checkbox}
                name='isProfilePublic'
                label='is Profile Public'
                checked={this.state.isProfilePublic}
                placeholder={false}
                onChange={this.handleInputChange}
              />
            </Card.Content>
          </Card>
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
                        <Card>
                          <Card.Content>
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
                          </Card.Content>
                        </Card>
                      ) : ( 
                        <React.Fragment>
                          <Card fluid>
                            <Card.Content>
                              <Card.Header>{category.name}</Card.Header>
                              <Card.Description>order: {category.order}</Card.Description>
                              <Card.Description>isCategoryPublic: {(category.public).toString()}</Card.Description>
                            </Card.Content>
                            <Card.Content>
                              <Button onClick={()=> this.setCurrentlyEditedCategory(category.name)}>Edit</Button>
                              <Button onClick={()=> this.deleteCategoryFromState(category.name)}>Delete</Button>
                            </Card.Content>
                          </Card>
                        </React.Fragment>
                      )
                    }
                    
                  </Card.Content>
                ))
              }
            </Card.Content>
            <Card.Content>
              <Card.Header>Add new Category:</Card.Header>
            </Card.Content>
            <Card.Content>
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
                label='category display priority, from left to right'
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
      </Card.Content></Card>
    )
  }

}

export const WrappedProfile = UserWrapper(AuthWrapper(Profile));