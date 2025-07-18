"use client"

import { useState } from "react"
import { View, Text, TextInput, TouchableOpacity, Alert, StyleSheet, SafeAreaView, ScrollView, KeyboardAvoidingView, Platform } from "react-native"
import { Picker } from "@react-native-picker/picker"
import { supabase } from "../lib/supabase"
import * as Location from "expo-location"
import { useSafeAreaInsets } from "react-native-safe-area-context"

const bloodTypes = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"]

export default function ProfileSetupScreen() {
  const [fullName, setFullName] = useState("")
  const [phone, setPhone] = useState("")
  const [bloodType, setBloodType] = useState("A+")
  const [city, setCity] = useState("")
  const [role, setRole] = useState("donor")
  const [lastDonation, setLastDonation] = useState("")
  const [loading, setLoading] = useState(false)
  const insets = useSafeAreaInsets()
  const getCurrentLocation = async () => {
  try {
    const { status } = await Location.requestForegroundPermissionsAsync()
    console.log("Permission status:", status);
    if (status !== "granted") {
      Alert.alert("Permission denied", "Location permission is required")
      return
    }

    const location = await Location.getCurrentPositionAsync({})
    console.log("Got location:", location)
    const address = await Location.reverseGeocodeAsync({
      latitude: location.coords.latitude,
      longitude: location.coords.longitude,
    })
    console.log("Reverse geocode address:", address)

    if (address[0]) {
      setCity(address[0].city || address[0].region || "Unknown")
    }
  } catch (error) {
    console.error("Location error:", error)
    Alert.alert("Error", "Could not get location")
  }
}


  const saveProfile = async () => {
    if (!fullName || !phone || !city) {
      Alert.alert("Error", "Please fill in all required fields")
      return
    }

    setLoading(true)
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) return

    const { error } = await supabase.from("profiles").insert({
      id: user.id,
      full_name: fullName,
      phone,
      blood_type: bloodType,
      city,
      role,
      last_donation: role === "donor" ? lastDonation : null,
      available_to_donate: role === "donor",
      created_at: new Date().toISOString(),
    })

    if (error) {
      Alert.alert("Error", error.message)
    }
    setLoading(false)
  }

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
      <ScrollView style={styles.content}>
        <Text style={styles.title}>Complete Your Profile</Text>

        <View style={styles.form}>
          <Text style={styles.label}>Full Name *</Text>
          <TextInput
            style={styles.input}
            value={fullName}
            onChangeText={setFullName}
            placeholder="Enter your full name"
          />

          <Text style={styles.label}>Phone Number *</Text>
          <TextInput
            style={styles.input}
            value={phone}
            onChangeText={setPhone}
            placeholder="Enter your phone number"
            keyboardType="phone-pad"
          />

          <Text style={styles.label}>Blood Type *</Text>
          <View style={styles.pickerContainer}>
            <Picker selectedValue={bloodType} onValueChange={setBloodType} style={styles.picker}>
              {bloodTypes.map((type) => (
                <Picker.Item key={type} label={type} value={type} />
              ))}
            </Picker>
          </View>

          <Text style={styles.label}>City *</Text>
          <View style={styles.locationRow}>
            <TextInput
              style={[styles.input, { flex: 1 }]}
              value={city}
              onChangeText={setCity}
              placeholder="Enter your city"
            />
            <TouchableOpacity style={styles.locationButton} onPress={getCurrentLocation}>
              <Text style={styles.locationButtonText}>📍</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.label}>Role *</Text>
          <View style={styles.roleContainer}>
            <TouchableOpacity
              style={[styles.roleButton, role === "donor" && styles.roleButtonActive]}
              onPress={() => setRole("donor")}
            >
              <Text style={[styles.roleButtonText, role === "donor" && styles.roleButtonTextActive]}>Donor</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.roleButton, role === "recipient" && styles.roleButtonActive]}
              onPress={() => setRole("recipient")}
            >
              <Text style={[styles.roleButtonText, role === "recipient" && styles.roleButtonTextActive]}>
                Recipient
              </Text>
            </TouchableOpacity>
          </View>

          {role === "donor" && (
            <>
              <Text style={styles.label}>Last Donation Date</Text>
              <TextInput
                style={styles.input}
                value={lastDonation}
                onChangeText={setLastDonation}
                placeholder="YYYY-MM-DD (optional)"
              />
            </>
          )}

          <TouchableOpacity style={[styles.button, { marginBottom: insets.bottom + 10 }]}  onPress={saveProfile} disabled={loading}>
            <Text style={styles.buttonText}>Complete Setup</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
      </KeyboardAvoidingView>
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
  title: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 30,
    color: "#dc2626",
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
  pickerContainer: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
  },
  picker: {
    height: 50,
  },
  locationRow: {
    flexDirection: "row",
    gap: 10,
  },
  locationButton: {
    backgroundColor: "#dc2626",
    borderRadius: 8,
    padding: 16,
    justifyContent: "center",
    alignItems: "center",
  },
  locationButtonText: {
    fontSize: 18,
  },
  roleContainer: {
    flexDirection: "row",
    gap: 10,
  },
  roleButton: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 16,
    alignItems: "center",
  },
  roleButtonActive: {
    backgroundColor: "#dc2626",
    borderColor: "#dc2626",
  },
  roleButtonText: {
    fontSize: 16,
    color: "#666",
  },
  roleButtonTextActive: {
    color: "white",
    fontWeight: "600",
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
