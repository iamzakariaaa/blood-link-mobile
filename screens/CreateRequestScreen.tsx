import { useState } from "react"
import { View, Text, TextInput, TouchableOpacity, Alert, StyleSheet, SafeAreaView, ScrollView } from "react-native"
import { Picker } from "@react-native-picker/picker"
import { supabase } from "../lib/supabase"

const bloodTypes = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"]
const urgencyLevels = ["Low", "Medium", "High", "Critical"]

export default function CreateRequestScreen({ navigation }: any) {
  const [bloodType, setBloodType] = useState("A+")
  const [location, setLocation] = useState("")
  const [message, setMessage] = useState("")
  const [urgency, setUrgency] = useState("Medium")
  const [loading, setLoading] = useState(false)

  const createRequest = async () => {
    if (!location || !message) {
      Alert.alert("Error", "Please fill in all required fields")
      return
    }

    setLoading(true)
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) return

    const { error } = await supabase.from("blood_requests").insert({
      user_id: user.id,
      blood_type: bloodType,
      location,
      message,
      urgency,
      status: "active",
      created_at: new Date().toISOString(),
    })

    if (error) {
      Alert.alert("Error", error.message)
    } else {
      Alert.alert("Success", "Your blood request has been posted!")
      navigation.goBack()
    }
    setLoading(false)
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.content}>
        <View style={styles.form}>
          <Text style={styles.label}>Blood Type Needed *</Text>
          <View style={styles.pickerContainer}>
            <Picker selectedValue={bloodType} onValueChange={setBloodType} style={styles.picker}>
              {bloodTypes.map((type) => (
                <Picker.Item key={type} label={type} value={type} />
              ))}
            </Picker>
          </View>

          <Text style={styles.label}>Hospital/Location *</Text>
          <TextInput
            style={styles.input}
            value={location}
            onChangeText={setLocation}
            placeholder="Enter hospital name or location"
            multiline
          />

          <Text style={styles.label}>Message/Details *</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={message}
            onChangeText={setMessage}
            placeholder="Describe your situation, urgency, contact details..."
            multiline
            numberOfLines={4}
          />

          <Text style={styles.label}>Urgency Level</Text>
          <View style={styles.pickerContainer}>
            <Picker selectedValue={urgency} onValueChange={setUrgency} style={styles.picker}>
              {urgencyLevels.map((level) => (
                <Picker.Item key={level} label={level} value={level} />
              ))}
            </Picker>
          </View>

          <TouchableOpacity style={styles.button} onPress={createRequest} disabled={loading}>
            <Text style={styles.buttonText}>Post Request</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  content: {
    flex: 1,
    padding: 20,
  },
  form: {
    gap: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 16,
    fontSize: 16,
  },
  textArea: {
    height: 100,
    textAlignVertical: "top",
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
  },
  picker: {
    height: 50,
  },
  button: {
    backgroundColor: "#dc2626",
    borderRadius: 8,
    padding: 16,
    alignItems: "center",
    marginTop: 20,
  },
  buttonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
})
