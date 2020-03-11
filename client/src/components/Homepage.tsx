import React from 'react'
import {
  Container,
  Grid,
  Header,
  Image,
  Message,
} from 'semantic-ui-react'
import { Link } from 'react-router-dom';

export interface GetOrCreateUserProps {
}

export interface GetOrCreateUserState {
}

const Homepage = () => {

  return (
    <Container>
      <Grid centered>
        <Grid.Column textAlign="center">
          <br />
          <Grid.Row centered>
            <br />
            <Header as="h1">Welcome to imbibe.dev!</Header>
            <br />
            <Message info>
              <Message.Header>imbibe <sup>2a</sup> - to absorb or assimilate (ideas or knowledge).</Message.Header>
            </Message>
          </Grid.Row>
          <Grid.Row centered>
            <br />
            <Header as="h2">Imbibe allows you to track what you are interested in and are working on:</Header>
            <Image centered bordered src="https://imbibe-images-dev.s3.amazonaws.com/imbibe-demo.png" size="huge" />
          </Grid.Row>

          <Grid.Row centered>
            <br />
            <br />
            <Header as="h2">Imbibe allows you to create a public view with a small profile:</Header>>
            <Image centered bordered src="https://imbibe-images-dev.s3.amazonaws.com/imbibe-public-demo.png" size="huge" />
            <br />
            <Header as="h3">
              <Link to="/public/alwang85">Visit a demo profile page!</Link>
            </Header>
          </Grid.Row>

          <Grid.Row centered>
            <br />
            <br />
            <Header as="h2">Absorb and Assimiliate!</Header>
            <Header as="h3">Steps to start:</Header>
            <Header as="h4">1. Click Login/Register in the Nav</Header>
            <Header as="h4">2. Click Profile in the Nav</Header>
            <Header as="h4">3. Create additional categories, save each category, and save the profile</Header>
            <Header as="h4">4. Go to the dashboard and start creating items!</Header>
          </Grid.Row>
        </Grid.Column>
      </Grid>
    
    </Container>
  )
}

export default Homepage;