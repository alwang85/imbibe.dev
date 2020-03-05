import * as React from 'react'
import { ItemSlot } from '../components/ItemSlot';
import {
  Accordion,
  Card,
  Grid,
  Button,
  Icon,
  Form,
  Input,
  TextArea,
  CardContent,
  AccordionPanel
} from 'semantic-ui-react'

import { WrappedCreateItem } from './CreateItem'
import Auth from '../auth/Auth'
import { Item } from '../types/Item'

interface CategoryColumnProps {
  auth: Auth
  categoryName: string
  items: Item[]
  crud: boolean
}

interface CategoryColumnState {
}

export class CategoryColumn extends React.PureComponent<CategoryColumnProps, CategoryColumnState> {
  render() {
    const { items, categoryName, auth, crud } = this.props;
    return (
      <Grid.Column>
        <h1>{categoryName}</h1>
        { /* TODO this create item does not clos after creation */}
        { crud && items.length > 0 && <WrappedCreateItem auth={auth} categoryName={categoryName} position="top"/>}
        {
          items.length > 0 && items.map(item => (
            <ItemSlot item={item} crud={crud} auth={auth}/>
          ))
        }
        { crud && <WrappedCreateItem auth={auth} categoryName={categoryName} position="bottom"/>}
      </Grid.Column>
    )
  }
}
