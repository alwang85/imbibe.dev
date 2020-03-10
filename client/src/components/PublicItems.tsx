import * as React from 'react'
import {
  Card,
  Grid,
  Image,
  Item as ItemComponent,
  Loader,
} from 'semantic-ui-react'
import md from 'markdown-it';

import { getPublicLayoutByDisplayName } from '../api/layout-api'
import { getUserPublicProfile } from '../api/users-api'
import { LayoutWrapper } from '../context/layoutContext'
import { CategoryColumn } from '../components/CategoryColumn'
import { Item } from '../types/Item'

const mdDisplay = md({
  html: true,
  linkify: true,
  typographer: true
});

interface PublicItemsProps {
  history: any
  match: any
  layout: layoutItem[]
  setLayout: (layout: layoutItem[]) => void
}

interface layoutItem {
  items: Item[],
  category: string
}

interface PublicItemsState {
  description?: string | null,
  profileImageUrl?: string | null,
  loadingPublicItems: boolean
}
const initialPublicItemsState = {
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
      this.props.setLayout(publicLayout)

      const { description, profileImageUrl } = await getUserPublicProfile(displayName);

      this.setState({
        loadingPublicItems: false,
        description,
        profileImageUrl,
      });
      
    } catch (e) {
      alert(`Failed to fetch PublicItems: ${e.message}`)
    }
  }

  render() {
    const { layout } = this.props;
    const { description, profileImageUrl } = this.state;

    if (this.state.loadingPublicItems) {
      return this.renderLoading()
    }

    const publicProfile = (
      description && <Card fluid>
        <Card.Content textAlign="center">
          { profileImageUrl && <Image src={profileImageUrl} wrapped ui={false} size="tiny" centered /> }
        </Card.Content>
        <Card.Content>
          <Card.Description>
            <span dangerouslySetInnerHTML={{ __html: mdDisplay.render(description)}} />
          </Card.Description>
        </Card.Content>
      </Card>
    );

    return (
      <div>
        <br />
        <Grid columns={3} stackable>
          <Grid.Row>
            {
              layout && layout.length && layout.map((categoryItem, idx) => (
                <CategoryColumn 
                  key={categoryItem.category}
                  items={categoryItem.items}
                  categoryName={categoryItem.category}
                  crud={false}
                  // @ts-ignore
                  profile={idx === (layout.length - 1) && publicProfile}
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
          Loading...
        </Loader>
      </Grid.Row>
    )
  }
}
export const WrappedPublicItems = LayoutWrapper(PublicItems)