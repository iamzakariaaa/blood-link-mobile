import App from "../App"
import { View, StyleSheet } from "react-native"

export default function Page() {
  return (
    <View style={styles.container}>
      <App />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
})
