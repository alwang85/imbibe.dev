import dateFormat from 'dateformat'
import { History } from 'history'
import update from 'immutability-helper'
import * as uuid from 'uuid';
import * as React from 'react'
import {
  Accordion,
  Card,
  Button,
  Icon,
  Form,
  Input,
  TextArea,
  CardContent,
  AccordionPanel
} from 'semantic-ui-react'

import { createItem, deleteItem, getItems, patchItem } from '../api/items-api'
import { UserWrapper } from '../context/userContext'
import Auth from '../auth/Auth'
import { User } from '../types/User'
import { Item } from '../types/Item'
import { SubItem } from '../types/SubItem'

interface ToggleItemFunc {
  (): void;
}

interface ViewItemProps {
  crud: boolean
  auth?: Auth
  item: Item
  user: User
  toggleEditItem?: ToggleItemFunc
}

interface ViewItemState {
  view: string,
  subItemsTabOpen: boolean,
  expandedSubItem: string,
  activeIndexs: number[]
}
const initialViewItemState = {
  view: 'viewItem',
  subItemsTabOpen: false,
  expandedSubItem: '',
  activeIndexs: [0]
}

export class ViewItem extends React.PureComponent<ViewItemProps, ViewItemState> {
  state: ViewItemState = {
    ...initialViewItemState
  }

  toggleSubItemsTab = () => {
    console.log('toggle sub items called', this.state.subItemsTabOpen)
    this.setState({ subItemsTabOpen: !this.state.subItemsTabOpen })
  }

  toggleSubItem = (subItemId: string) => {
    this.setState({ expandedSubItem: subItemId })
  }

  toggleAccordion = (event: React.MouseEvent<HTMLDivElement, MouseEvent>, titleProps: any) => {
    const { index } = titleProps;
    const { activeIndexs } = this.state;
    const newIndex = activeIndexs;

    const currentIndexPosition = activeIndexs.indexOf(index);
    if (currentIndexPosition > -1) {
      newIndex.splice(currentIndexPosition, 1);
    } else {
      newIndex.push(index);
    }

    this.setState({ activeIndexs: newIndex });
  };

  onItemDelete = async (itemId: string) => {
    try {
      if(this.props.auth) await deleteItem(this.props.auth.getIdToken(), itemId)
    } catch {
      alert('Item deletion failed')
    }
  }

  render() {
    return (
      <div>
        {this.renderItem()}
      </div>
    )
  }

  renderItem() {
    const { auth, item, crud } = this.props;
    const { title, description, id, subItems = [] } = item;
    const currentlyLoggedInUser = auth && auth.getUserId();

    const canEditItem = item.userId === currentlyLoggedInUser;

    const subItemPanels = subItems.map(subItem => ({
      key: subItem.id,
      title: subItem.title,
      content: subItem.description
    }));

    const hasSubItems = subItems.length > 0;
    
    const Level1Content = (
      <div>
        <Accordion.Accordion panels={subItemPanels} />
      </div>
    )
    
    const rootPanels = [
      { key: 'panel-1', title: 'Subitems', content: { content: Level1Content } },
    ]
    
    const NestedSubitems = () => (
      <Accordion fluid panels={rootPanels} styled />
    )

    return (
      <Card fluid style={{ margin: '10px 0' }}>
        <Card.Content>
          <Card.Header>{title}</Card.Header>
          <Card.Description>
            {description}
          </Card.Description>
        </Card.Content>
        { hasSubItems && <NestedSubitems /> }
        {
          crud && canEditItem &&
            <Card.Content>
              <Button 
                icon
                onClick={this.props.toggleEditItem}
              >
                <Icon name='pencil' />
              </Button>
              <Button 
                icon
                onClick={() => this.onItemDelete(id)}
              >
                <Icon name='trash' />
              </Button>
            </Card.Content>
        }
      </Card>
    )
  }
}

export const WrappedViewItem = UserWrapper(ViewItem);