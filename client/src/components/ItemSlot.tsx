import * as React from 'react'
import { WrappedViewItem } from './ViewItem';
import { WrappedEditItem } from './EditItem';
import { Item } from '../types/Item'
import { SubItem } from '../types/SubItem'

/*
  Used as a slot that toggles between editable/displayed items
*/

interface ItemSlotProps {
  item: Item
  crud: boolean
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
            <WrappedViewItem
               item={this.props.item}
               toggleEditItem={this.toggleEditItem} 
               crud={this.props.crud}
            /> :
            // @ts-ignore
            <WrappedEditItem 
              item={this.props.item}
              toggleEditItem={this.toggleEditItem}
            />
        }
      </React.Fragment>
    )
  }
}
