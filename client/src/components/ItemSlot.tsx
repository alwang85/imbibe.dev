import * as React from 'react'

import { ViewItem } from './ViewItem';
import { WrappedEditItem } from './EditItem';
import Auth from '../auth/Auth'
import { Item } from '../types/Item'

interface ItemSlotProps {
  auth: Auth
  item: Item
}

interface ItemSlotState {
  view: string,
}
const initialItemSlotState = {
  view: 'viewItem',
}

export class ItemSlot extends React.PureComponent<ItemSlotProps, ItemSlotState> {
  state: ItemSlotState = {
    ...initialItemSlotState
  }

  toggleEditItem = () => {
    this.setState({ view: this.state.view === 'viewItem' ? 'editItem' : 'viewItem' })
  }

  render() {
    const { view: currentView } = this.state;
    return (
      <React.Fragment>
        {
          currentView === 'viewItem' ? 
            <ViewItem auth={this.props.auth} item={this.props.item} toggleEditItem={this.toggleEditItem} /> :
            // @ts-ignore
            <WrappedEditItem auth={this.props.auth} item={this.props.item} toggleEditItem={this.toggleEditItem} />
        }
      </React.Fragment>
    )
  }
}
