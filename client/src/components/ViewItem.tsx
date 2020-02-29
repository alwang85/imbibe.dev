import dateFormat from 'dateformat'
import { History } from 'history'
import update from 'immutability-helper'
import * as uuid from 'uuid';
import * as React from 'react'
import {
  Accordion,
  Card,
  Button,
  Form,
  Input,
  TextArea,
  CardContent,
  AccordionPanel
} from 'semantic-ui-react'

import { createItem, deleteItem, getItems, patchItem } from '../api/items-api'
import Auth from '../auth/Auth'
import { Item } from '../types/Item'
import { SubItem } from '../types/SubItem'

interface ViewItemProps {
  auth: Auth
  item: Item
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

  // onEditButtonClick = (itemId: string) => {
  //   this.props.history.push(`/items/${itemId}/edit`)
  // }

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
      await deleteItem(this.props.auth.getIdToken(), itemId)
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
    const { title, description, subItems = [] } = this.props.item;
    const { subItemsTabOpen, expandedSubItem, activeIndexs } = this.state;
    console.log('subItemsTabOpen in render', subItemsTabOpen)

    const subItemPanels = subItems.map(subItem => ({
      key: subItem.id,
      title: subItem.title,
      content: subItem.description
    }));
    
    const Level1Content = (
      <div>
        <Accordion.Accordion panels={subItemPanels} />
      </div>
    )
    
    const rootPanels = [
      { key: 'panel-1', title: 'Subitems', content: { content: Level1Content } },
    ]
    
    const AccordionExampleNested = () => (
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
        <AccordionExampleNested />
      </Card>
    )
  }
}
