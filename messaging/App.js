import React from "react";
import {
  Alert,
  BackHandler,
  Image,
  StyleSheet,
  TouchableHighlight,
  View,
} from "react-native";

import Status from "./components/Status";
import {
  createImageMessage,
  createLocationMessage,
  createTextMessage,
} from "./utils/MessageUtils";
import MessageList from "./components/MessageList";
import Toolbar from "./components/Toolbar";

import Geolocation from "@react-native-community/geolocation";
import ImageGrid from "./components/ImageGrid";
import { INPUT_METHOD } from "./components/MessagingContainer";

export default class App extends React.Component {
  state = {
    messages: [
      createImageMessage("https://unsplash.it/300/300"),
      createTextMessage("World"),
      createTextMessage("Hello"),
      createLocationMessage({ latitude: 37.78825, longitude: -122.4324 }),
    ],
    fullScreenImageId: null,
    isInputFocused: false,
    inputMethod: INPUT_METHOD.NONE,
  };

  handlePressToolbarCamera = () => {
    this.setState({
      isInputFocused: false,
      inputMethod: INPUT_METHOD.CUSTOM,
    });
  };

  handlePressToolbarLocation = () => {
    const { messages } = this.state;

    Geolocation.getCurrentPosition((position) => {
      const {
        coords: { latitude, longitude },
      } = position;

      this.setState({
        messages: [createLocationMessage({ latitude, longitude }), ...messages],
      });
    });
  };

  handleChangeFocus = (isFocused) => {
    this.setState({ isInputFocused: isFocused });
  };

  handleSubmit = (text) => {
    const { messages } = this.state;

    this.setState({
      messages: [createTextMessage(text), ...messages],
    });
  };

  handleChangeInputMethod = (inputMethod) => {
    this.setState({ inputMethod });
  };

  componentDidMount() {
    this.subscription = BackHandler.addEventListener(
      "hardwareBackPress",
      () => {
        const { fullScreenImageId } = this.state;

        if (fullScreenImageId) {
          this.dismissFullScreenImage();
          return true;
        }

        return false;
      },
    );
  }

  componentWillUnmount() {
    this.subscription.remove();
  }

  renderFullScreenImage = () => {
    const { messages, fullScreenImageId } = this.state;

    if (!fullScreenImageId) return null;

    const image = messages.find(
      (messages) => messages.id === fullScreenImageId,
    );

    if (!image) return null;
    const { uri } = image;

    return (
      <TouchableHighlight
        style={styles.fullScreenOverlay}
        onPress={this.dismissFullScreenImage}
      >
        <Image style={styles.fullScreenImage} source={{ uri }} />
      </TouchableHighlight>
    );
  };

  dismissFullScreenImage = () => {
    this.setState({
      fullScreenImageId: null,
    });
  };

  handlePressMessage = ({ id, type }) => {
    switch (type) {
      case "text":
        Alert.alert(
          "Delete message?",
          "Are you sure you want to permanently delete this message?",
          [
            {
              text: "Cancel",
              style: "cancel",
            },
            {
              text: "Delete",
              style: "destructive",
              onPress: () => {
                const { messages } = this.state;
                this.setState({
                  messages: messages.filter((messages) => messages.id !== id),
                });
              },
            },
          ],
        );
        break;
      case "image":
        this.setState({
          fullScreenImageId: id,
          isInputFocused: false,
        });
        break;
      default:
        break;
    }
  };

  renderMessageList() {
    const { messages } = this.state;

    return (
      <View style={styles.content}>
        <MessageList
          messages={messages}
          onPressMessage={this.handlePressMessage}
        />
      </View>
    );
  }

  renderInputMethodEditor() {
    return (
      <View style={styles.inputMethodEditor}>
        <ImageGrid onPressImage={this.handlePressImage} />
      </View>
    );
  }

  renderToolbar() {
    const { isInputFocused } = this.state;
    return (
      <View style={styles.toolbar}>
        <Toolbar
          isFocused={isInputFocused}
          onSubmit={this.handleSubmit}
          onChangeFocus={this.handleChangeFocus}
          onPressCamera={this.handlePressToolbarCamera}
          onPressLocation={this.handlePressToolbarLocation}
        />
      </View>
    );
  }

  handlePressImage = (uri) => {
    const { messages } = this.state;

    this.setState({
      messages: [createImageMessage(uri), ...messages],
    });
  };

  render() {
    const { inputMethod } = this.state;
    return (
      <View style={styles.container}>
        <Status />
        {this.renderMessageList()}
        {this.renderToolbar()}
        {this.renderInputMethodEditor()}
        {this.renderFullScreenImage()}
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white",
  },
  content: {
    flex: 1,
    backgroundColor: "white",
  },
  inputMethodEditor: {
    flex: 1,
    backgroundColor: "white",
  },
  toolbar: {
    borderTopWidth: 1,
    borderTopColor: "rgba(0,0,0,0.04)",
    backgroundColor: "white",
  },
  fullScreenOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "black",
    zIndex: 2,
  },
  fullScreenImage: {
    flex: 1,
    resizeMode: "contain",
  },
});
