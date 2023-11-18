import PropTypes from "prop-types";
import { Image, StyleSheet, TouchableOpacity } from "react-native";
import Grid from "./Grid";
import React from "react";
import * as Permission from "expo-permissions";
import * as MediaLibrary from "expo-media-library";

const keyExtractor = ({ uri }) => uri;
export default class ImageGrid extends React.Component {
  loading = null;
  cursor = null;

  static propTypes = {
    onPressImage: PropTypes.func,
  };

  static defaultProps = {
    onPressImage: () => {},
  };

  state = {
    images: [],
  };

  renderItem = ({ item: { uri }, size, marginTop, marginLeft }) => {
    const { onPressImage } = this.props;

    const style = {
      width: size,
      height: size,
      marginLeft,
      marginTop,
    };

    return (
      <TouchableOpacity
        activeOpacity={0.75}
        onPress={() => onPressImage(uri)}
        style={style}
        key={uri}
      >
        <Image source={{ uri }} style={style} />
      </TouchableOpacity>
    );
  };

  getImages = async (after) => {
    if (this.loading) return;

    this.loading = true;

    const { status } = await Permission.askAsync(Permission.MEDIA_LIBRARY);

    if (status !== "granted") {
      console.log("Media Library permission denied");
      return;
    }

    const results = await MediaLibrary.getAssetsAsync({
      first: 20,
      mediaType: "photo",
      after,
    });

    const { assets, hasNextPage, endCursor } = results;

    const loadedImages = assets.map((asset) => ({
      uri: asset.uri,
    }));

    this.setState(
      {
        images: this.state.images.concat(loadedImages),
      },
      () => {
        this.loading = false;
        this.cursor = hasNextPage ? endCursor : null;
      },
    );
  };

  getNextImages = () => {
    if (!this.cursor) return;
    this.getImages(this.cursor);
  };

  componentDidMount() {
    this.getImages();
  }

  render() {
    const { images } = this.state;
    return (
      <Grid
        renderItem={this.renderItem}
        data={images}
        keyExtractor={keyExtractor}
        onEndReached={this.getNextImages}
      />
    );
  }
}

const styles = StyleSheet.create({
  image: {
    flex: 1,
  },
});
