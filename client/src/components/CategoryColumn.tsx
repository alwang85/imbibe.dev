import * as React from 'react'
import { ItemSlot } from '../components/ItemSlot';
import {
  Grid,
} from 'semantic-ui-react'

import { WrappedCreateItem } from './CreateItem'
import { Item } from '../types/Item'
interface CategoryColumnProps {
  categoryName: string
  items: Item[]
  crud: boolean
}

interface CategoryColumnState {
}

export class CategoryColumn extends React.PureComponent<CategoryColumnProps, CategoryColumnState> {
  render() {
    const { items, categoryName, crud } = this.props;
    return (
      <Grid.Column>
        <h1>{categoryName}</h1>
        { /* TODO this create item does not clos after creation */}
        { crud && items.length > 0 && <WrappedCreateItem categoryName={categoryName} position="top"/>}
        {
          items.length > 0 && items.map(item => (
            <ItemSlot key={JSON.stringify(item)} item={item} crud={crud}/>
          ))
        }
        { crud && <WrappedCreateItem categoryName={categoryName} position="bottom"/>}
      </Grid.Column>
    )
  }
}
