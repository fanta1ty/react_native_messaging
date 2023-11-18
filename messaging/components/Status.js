import Constants from "expo-constants";
import React from "react";
import {Platform, StyleSheet, Text, View, StatusBar, TextComponent} from "react-native";
import NetInfo from "@react-native-community/netinfo";

const subscription = NetInfo.addEventListener((status) => {
  console.log("Network status changed: ", status);
  console.log("Connection type:", status.type);
});

export default class Status extends React.Component {
  state = {
    info: "none",
  };

  async componentDidMount() {
    this.subscription = NetInfo.addEventListener(this.handleChange);
    const info = await NetInfo.fetch();
    console.log("Info:", info);
    this.setState({
      info: info.state,
    });
  }

  componentWillUnmount() {
    this.subscription();
  }

  handleChange = (info) => {
    this.setState({
      info: info.state,
    });
    StatusBar.setBarStyle(
      info.state === "none" ? "light-content" : "dark-content"
    );
  };

  render() {
    const { info } = this.state;
    const isConnected = info !== "none";
    const backgroundColor = isConnected ? "white" : "red";
    const messageContainer = (
      <View style={styles.messageContainer} pointerEvents={"none"}>
        {!isConnected && (
          <View style={styles.bubble}>
            <Text style={styles.text}>No network connection</Text>

          </View>
        )}
      </View>
    );

    if (Platform.OS === "ios") {
      return (
        <View style={[styles.status, { backgroundColor }]}>
          {messageContainer}
        </View>
      );
    }
    return messageContainer;
  }
}

const statusHeight = Platform.OS === "ios" ? Constants.statusBarHeight : 0;
const styles = StyleSheet.create({
  messageContainer: {
    zIndex: 1,
    position: "absolute",
    top: statusHeight + 20,
    right: 0,
    left: 0,
    height: 80,
    alignItems: "center",
  },
  bubble: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: "red",
  },
  text: {
    color: "white",
  },
  status: {
    zIndex: 1,
    height: statusHeight,
  },
});
