import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { ActivityIndicator } from 'react-native';
import api from '../../services/api';

import {
  Container,
  Header,
  Avatar,
  Name,
  Bio,
  Stars,
  StarButton,
  Starred,
  OwnerAvatar,
  Info,
  Title,
  Author,
} from './styles';

export default class User extends Component {
  static navigationOptions = ({ navigation }) => ({
    title: navigation.getParam('user').name,
  });

  static propTypes = {
    navigation: PropTypes.shape({
      getParam: PropTypes.func,
    }).isRequired,
  };

  state = {
    stars: [],
    loading: false,
    page: 1,
    refreshing: false,
  };

  async componentDidMount() {
    this.setState({ loading: true });

    const { navigation } = this.props;
    const user = navigation.getParam('user');

    const response = await api.get(`/users/${user.login}/starred`);

    this.setState({ stars: response.data, loading: false });
  }

  loadMore = async () => {
    const { stars, page } = this.state;
    const pageNumber = page + 1;

    const { navigation } = this.props;
    const user = navigation.getParam('user');

    const response = await api.get(
      `/users/${user.login}/starred?page=${pageNumber}`
    );

    this.setState({
      stars: [...stars, ...response.data],
      page: pageNumber,
    });
  };

  refreshList = async () => {
    const pageNumber = 1;

    const { navigation } = this.props;
    const user = navigation.getParam('user');

    const response = await api.get(
      `/users/${user.login}/starred?page=${pageNumber}`
    );

    this.setState({
      stars: response.data,
      page: pageNumber,
    });
  };

  handleNavigate = repository => {
    const { navigation } = this.props;

    navigation.navigate('WebRepository', { repository });
  };

  render() {
    const { navigation } = this.props;
    const { stars, loading, refreshing } = this.state;

    const user = navigation.getParam('user');

    return (
      <Container>
        {loading ? (
          <ActivityIndicator />
        ) : (
          <>
            <Header>
              <Avatar source={{ uri: user.avatar }} />
              <Name>{user.name}</Name>
              <Bio>{user.bio}</Bio>
            </Header>

            <Stars
              onEndReachedThreshold={0.2}
              onEndReached={this.loadMore}
              onRefresh={this.refreshList}
              refreshing={refreshing}
              data={stars}
              keyExtractor={star => String(star.id)}
              renderItem={({ item }) => (
                <StarButton onPress={() => this.handleNavigate(item)}>
                  <Starred>
                    <OwnerAvatar source={{ uri: item.owner.avatar_url }} />
                    <Info>
                      <Title>{item.name}</Title>
                      <Author>{item.owner.login}</Author>
                    </Info>
                  </Starred>
                </StarButton>
              )}
            />
          </>
        )}
      </Container>
    );
  }
}
