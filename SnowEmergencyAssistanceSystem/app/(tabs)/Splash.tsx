import { Image, StyleSheet, Text, View } from "react-native";

export default function SplashScreen() {
  return (
    <View style={styles.container}>
      <Image source={require("../../assets/images/snow.png")} style={styles.icon} />
      <Text style={styles.title}>Snow Guard</Text>
      <Text style={styles.loading}>Loading...</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
  icon: {
    width: 90,
    height: 90,
    marginBottom: 20,
  },
  title: {
    fontSize: 26,
    fontWeight: "600",
    color: "#444",
    marginTop: 10,
  },
  loading: {
    fontSize: 18,
    color: "#666",
    marginTop: 20,
  },
});
