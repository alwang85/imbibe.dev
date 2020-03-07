import * as React from 'react'
import { Button, Dropdown, Label } from 'semantic-ui-react'

import { ItemsWrapper } from '../context/itemsContext';
import { Item } from '../types/Item'
import { SubItem } from '../types/SubItem'

interface MoveItemProps {
  item: Item,
  subItem: SubItem,
  hasUnsavedChanges: boolean,
  // the following comes from ItemsWrapper HoC
  items: Item[]
  moveSubItem: (movedSubItem: SubItem, originalItem: Item, targetItem: Item) => void
}

interface MoveItemState {
  view: string,
  currentTargetItemId: string,
}
const initialMoveItemState = {
  view: 'button',
  currentTargetItemId: '',
}

export class MoveItem extends React.PureComponent<MoveItemProps, MoveItemState> {
  state: MoveItemState = {
    ...initialMoveItemState
  }

  toggleEditItem = () => {
    this.setState({ view: this.state.view === 'button' ? 'move' : 'button' })
  }

  onDropdownChange = (event: React.SyntheticEvent<HTMLElement, Event>, data: any) => {
    this.setState({ currentTargetItemId: data.value })
  }

  onMoveSubItem = () => {
    const { subItem, item, items } = this.props;
    const targetItem = items.find(item => item.id === this.state.currentTargetItemId);
    if (!targetItem) return;
    this.props.moveSubItem(subItem, item, targetItem);
  }

  render() {
    const { view: currentView } = this.state;


    const dropdownOptions = this.props.items.map(item => ({
      key: item.id,
      text: item.title,
      value: item.id,
    }))

    const DropdownSearch = () => (
      <Dropdown placeholder='Target Item title' options={dropdownOptions} onChange={this.onDropdownChange} search selection value={this.state.currentTargetItemId}/>
    )

    return (
      <React.Fragment>
        {
          currentView === 'button' ? 
            <Button icon onClick={this.toggleEditItem}>Move to another Item</Button> :
            // @ts-ignore
            <div>
              <DropdownSearch />
              {
                this.props.hasUnsavedChanges && <Label basic color='red' pointing='below'>
                  Unsaved fields- Please save the Item first.
                </Label>
              }
              <Button onClick={this.onMoveSubItem}>Move SubItem</Button>
              
            </div>
        }
      </React.Fragment>
    )
  }
}

export const WrappedMoveItem = ItemsWrapper(MoveItem);