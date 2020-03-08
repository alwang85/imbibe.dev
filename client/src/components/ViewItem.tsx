import * as React from 'react'
import {
  Accordion,
  Button,
  Card,
  Icon,
} from 'semantic-ui-react'

import { ItemsWrapper } from '../context/itemsContext';
import { UserWrapper } from '../context/userContext'
import { AuthWrapper } from '../context/auth0-context';
import { Item } from '../types/Item'

interface ToggleItemFunc {
  (): void;
}

interface ViewItemProps {
  crud: boolean
  item: Item
  toggleEditItem?: ToggleItemFunc
  // below comes from ItemsWrapper HoC
  deleteItem: (itemId: string) => {}
  // below comes from AuthWrapper HoC
  isAuthenticated: any,
  idToken: string,
  userId: string
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

  render() {
    return (
      <div>
        {this.renderItem()}
      </div>
    )
  }

  renderItem() {
    const { item, crud, userId } = this.props;
    const { title, description, id, subItems = [] } = item;
    const currentlyLoggedInUser = userId;

    const canEditItem = item.userId === currentlyLoggedInUser;

    const subItemPanels = subItems.map(subItem => ({
      key: subItem.id,
      title: subItem.title,
      content: {
        content: (
          <React.Fragment>
          {subItem.description}
          {
            subItem.anchorText && subItem.url && (
              <span>- <a href={subItem.url} target="_blank">{subItem.anchorText}</a></span>
            )
          }
        </React.Fragment>
        )
      }
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
            { item.anchorText && item.url && (
              <span>- <a className="ui" href={item.url} target="_blank">{item.anchorText}</a></span>
            )}
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
                onClick={() => this.props.deleteItem(id)}
              >
                <Icon name='trash' />
              </Button>
            </Card.Content>
        }
      </Card>
    )
  }
}

export const WrappedViewItem = ItemsWrapper(AuthWrapper(UserWrapper(ViewItem)));