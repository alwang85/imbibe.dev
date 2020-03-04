import * as React from 'react'
import { WrappedViewItem } from '../components/ViewItem';
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

import { Item } from '../types/Item'

interface CategoryColumnProps {
  categoryName: string
  items: Item[]
}

interface CategoryColumnState {
}

export class CategoryColumn extends React.PureComponent<CategoryColumnProps, CategoryColumnState> {
  render() {
    const { items, categoryName } = this.props;
    return (
      <Grid.Column>
        <h1>{categoryName}</h1>
        {
          items.length && items.map(item => (
            <WrappedViewItem item={item} crud={false}/>
          ))
        }
      </Grid.Column>
    )
  }
}
