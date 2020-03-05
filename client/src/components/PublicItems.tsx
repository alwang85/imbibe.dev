import dateFormat from 'dateformat'
import update from 'immutability-helper'
import * as React from 'react'
import get from 'lodash/get'
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

import { getPublicLayoutByDisplayName } from '../api/layout-api'
import Auth from '../auth/Auth'
import UserContext from '../context/userContext';
import { WrappedCreateItem } from './CreateItem'
import { CategoryColumn } from '../components/CategoryColumn'
import { ItemSlot } from './ItemSlot'
import { Item } from '../types/Item'

interface PublicItemsProps {
  auth: Auth
  history: any
  match: any
}

interface layoutItem {
  items: Item[],
  category: string
}

interface PublicItemsState {
  publicLayout: layoutItem[]
  loadingPublicItems: boolean
}
const initialPublicItemsState = {
  publicLayout: [],
  loadingPublicItems: true,
}

export class PublicItems extends React.PureComponent<PublicItemsProps, PublicItemsState> {
  state: PublicItemsState = {
    ...initialPublicItemsState
  }

  async componentDidMount() {
    const { match: { params = {}} } = this.props;
    const { displayName } = params;

    if(!displayName || displayName === 'none') {
      alert(`Invalid display name`)
    };

    try {
      const publicLayout = await getPublicLayoutByDisplayName(displayName)
      console.log('layout', {
        displayName,
        publicLayout
      })
      this.setState({
        publicLayout,
        loadingPublicItems: false
      })
    } catch (e) {
      alert(`Failed to fetch PublicItems: ${e.message}`)
    }
  }

  render() {
    const { publicLayout } = this.state;

    if (this.state.loadingPublicItems) {
      return this.renderLoading()
    }

    return (
      <div>
        <Header as="h1"></Header>
        <Grid columns={3} divided stackable>
          <Grid.Row>
            {
              publicLayout && publicLayout.length && publicLayout.map(categoryItem => (
                <CategoryColumn 
                  items={categoryItem.items}
                  categoryName={categoryItem.category}
                  crud={false}
                  auth={this.props.auth}
                />
              ))
            }
          </Grid.Row>
        </Grid>
      </div>
    )
  }
  renderLoading() {
    // TODO consider better loading experience, given lambda cold time
    return (
      <Grid.Row>
        <br />
        <br />
        <Loader indeterminate active inline="centered">
          Loading Items
        </Loader>
      </Grid.Row>
    )
  }
}
