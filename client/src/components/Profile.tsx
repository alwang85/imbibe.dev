import * as React from 'react'
import {
  Button,
  Card,
  Checkbox,
  Form,
  Input,
  Image
} from 'semantic-ui-react'
import MarkdownIt from 'markdown-it'
import MdEditor from 'react-markdown-editor-lite'
// import style manually
import 'react-markdown-editor-lite/lib/index.css';

import { 
  getDisplayNameAvailability,
  getUploadUrl,
  getUser,
  patchUser,
  uploadFile
} from '../api/users-api'
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

enum UploadState {
  NoUpload,
  FetchingPresignedUrl,
  UploadingFile,
}

interface ItemsState {
  isProfilePublic: boolean,
  displayName?: string | null,
  categories?: Category[],
  profileImageUrl?: string | null,
  description?: string | null,
  currentlyEditedCategoryName: string,
  currentlyEditedCategoryOrder: number,
  currentlyEditedCategoryPublic: boolean,
  isDisplayNameAvailable: boolean,
  file: any
  uploadState: UploadState
}
const initialItemsState = {
  isProfilePublic: false,
  displayName: null,
  categories: [],
  profileImageUrl: null,
  description: null,
  currentlyEditedCategoryName: '',
  currentlyEditedCategoryOrder: 100,
  currentlyEditedCategoryPublic: false,
  isDisplayNameAvailable: true,
}
const mdParser = new MarkdownIt();

class Profile extends React.PureComponent<ItemsProps, ItemsState> {
  state: ItemsState = {
    ...initialItemsState,
    file: undefined,
    uploadState: UploadState.NoUpload
  }

  async componentDidMount() {
    const { idToken, userId } = this.props;

    try {
      const {
        isProfilePublic, displayName, categories, profileImageUrl, description
      } = await getUser(idToken, userId)
      this.setState({
        isProfilePublic, displayName, categories, profileImageUrl, description
      })
    } catch (e) {
      alert(`Failed to fetch user: ${e.message}`)
    }
  }

  handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (!files) return

    this.setState({
      file: files[0]
    })
  }

  setUploadState(uploadState: UploadState) {
    this.setState({
      uploadState
    })
  }

  handleImageUpload = async (event: React.SyntheticEvent) => {
    event.preventDefault()

    try {
      if (!this.state.file) {
        alert('File should be selected')
        return
      }

      this.setUploadState(UploadState.FetchingPresignedUrl)
      const uploadUrl = await getUploadUrl(this.props.idToken, this.props.userId)

      this.setUploadState(UploadState.UploadingFile)
      await uploadFile(uploadUrl, this.state.file)
      const updatedUser = await getUser(this.props.idToken, this.props.userId);
      this.props.setUser(updatedUser, true);
      this.setState({
        profileImageUrl: uploadUrl,
      })

      alert('File was uploaded!')
    } catch (e) {
      alert('Could not upload a file: ' + e.message)
    } finally {
      this.setUploadState(UploadState.NoUpload)
    }
  }

  // @ts-ignore
  handleEditorChange = ({html, text}) => {    
    this.setState({
      description: text,
    })
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
      currentlyEditedCategoryName: initialItemsState.currentlyEditedCategoryName,
      currentlyEditedCategoryOrder: initialItemsState.currentlyEditedCategoryOrder,
      currentlyEditedCategoryPublic: initialItemsState.currentlyEditedCategoryPublic,
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
      currentlyEditedCategoryName: initialItemsState.currentlyEditedCategoryName,
      currentlyEditedCategoryOrder: initialItemsState.currentlyEditedCategoryOrder,
      currentlyEditedCategoryPublic: initialItemsState.currentlyEditedCategoryPublic,
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
          categories: this.state.categories,
          profileImageUrl: this.state.profileImageUrl,
          description: this.state.description,
        }
      )
      
      console.log('item update success', newUser)
      this.props.setUser(newUser, true);

    } catch {
      alert('Item creation failed')
    }
  }

  render() {
    return (
      <Card fluid><Card.Content>
        <Form>
          <Card fluid>
            <Card.Content>
              <Card.Header>Profile</Card.Header>
            </Card.Content>
            <Card.Content>
              <Form.Field 
                id="display-name"
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
                id="is-profile-public"
                control={Checkbox}
                name='isProfilePublic'
                label='is Profile Public'
                checked={this.state.isProfilePublic}
                placeholder={false}
                onChange={this.handleInputChange}
              />
            </Card.Content>
            { this.props.user.profileImageUrl && (
              <Card.Content>
                <Image src={this.props.user.profileImageUrl} size="small" wrapped />
              </Card.Content>
            )}
            <Card.Content>
              <Form onSubmit={this.handleImageUpload}>
                <Form.Field>
                  <label htmlFor="image-uploader">Profile Pic</label>
                  <input
                    id="image-uploader"
                    type="file"
                    accept="image/*"
                    placeholder="Image to upload"
                    onChange={this.handleFileChange}
                  />
                </Form.Field>

                <div>
                  {this.state.uploadState === UploadState.FetchingPresignedUrl && <p>Uploading image metadata</p>}
                  {this.state.uploadState === UploadState.UploadingFile && <p>Uploading file</p>}
                  <Button
                    loading={this.state.uploadState !== UploadState.NoUpload}
                    type="submit"
                  >
                    Upload
                  </Button>
                </div>
              </Form>
            </Card.Content>
            <Card.Content>
            <Card.Header>Description- shows up in the top of the last category available to public view</Card.Header>
            <MdEditor
              value={this.state.description || ""}
              renderHTML={(text) => mdParser.render(text)}
              onChange={this.handleEditorChange}
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
                              id={`currently-edited-category-name-${this.state.currentlyEditedCategoryName}`}
                              control={Input}
                              name='currentlyEditedCategoryName'
                              label='category name'
                              value={this.state.currentlyEditedCategoryName}
                              placeholder='category name'
                              onChange={this.handleInputChange}
                            />
                            <Form.Field 
                              id={`currently-edited-category-order-${this.state.currentlyEditedCategoryOrder}`}
                              control={Input}
                              name='currentlyEditedCategoryOrder'
                              label='category display order'
                              value={this.state.currentlyEditedCategoryOrder}
                              placeholder={idx + 1}
                              onChange={this.handleInputChange}
                            />
                            <Form.Field 
                              id={`currently-edited-isPublic-${this.state.currentlyEditedCategoryPublic}`}
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
                id="new-category-name"
                control={Input}
                name='currentlyEditedCategoryName'
                label='category name'
                value={this.state.currentlyEditedCategoryName}
                placeholder='category name'
                onChange={this.handleInputChange}
              />
              <Form.Field 
                id="new-category-order"
                control={Input}
                name='currentlyEditedCategoryOrder'
                label='category display priority, from left to right'
                value={this.state.currentlyEditedCategoryOrder}
                placeholder={100}
                onChange={this.handleInputChange}
              />
              <Form.Field 
                id="new-category-isPublic"
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
          <Button onClick={this.onUserUpdate}>Save Profile</Button>
        </Form>
      </Card.Content></Card>
    )
  }

}

export const WrappedProfile = UserWrapper(AuthWrapper(Profile));