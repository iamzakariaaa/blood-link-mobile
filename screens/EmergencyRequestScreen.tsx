"use client"

import { useState, useEffect } from "react"
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, Alert, TextInput } from "react-native"
import { Picker } from "@react-native-picker/picker"
import { supabase } from "../lib/supabase"
import * as Location from "expo-location"
import { Ionicons } from "@expo/vector-icons"

const bloodTypes = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"]

export default function EmergencyRequestScreen({ navigation }: any) {
  const [bloodType, setBloodType] = useState("A+")
  const [hospital, setHospital] = useState("")
  const [contactNumber, setContactNumber] = useState("")
  const [location, setLocation] = useState("")
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    getCurrentLocation()
  }, [])

  const getCurrentLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync()
      if (status === "granted") {
        const location = await Location.getCurrentPositionAsync({})
        const address = await Location.reverseGeocodeAsync({
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
        })
        if (address[0]) {
          setLocation(address[0].city || address[0].region || "Current Location")
        }
      }
    } catch (error) {
      console.log("Location error:", error)
    }
  }

  const sendEmergencyRequest = async () => {
    if (!hospital || !contactNumber) {
      Alert.alert("Error", "Please fill in all required fields")
      return
    }

    setLoading(true)

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) return

      // Create emergency request
      const { error: requestError } = await supabase.from("blood_requests").insert({
        user_id: user.id,
        blood_type: bloodType,
        location: hospital,
        message: `🚨 EMERGENCY REQUEST 🚨\n\nHospital: ${hospital}\nContact: ${contactNumber}\nLocation: ${location}\n\nThis is an urgent blood requirement. Please respond immediately if you can donate.`,
        urgency: "Critical",
        status: "active",
        is_emergency: true,
        created_at: new Date().toISOString(),
      })

      if (requestError) throw requestError

      // Send push notifications to nearby donors
      await sendEmergencyNotifications(bloodType, location)

      Alert.alert("Emergency Request Sent!", "Your emergency request has been broadcast to all nearby donors.", [
        {
          text: "OK",
          onPress: () => navigation.goBack(),
        },
      ])
    } catch (error: any) {
      Alert.alert("Error", error.message)
    } finally {
      setLoading(false)
    }
  }

  const sendEmergencyNotifications = async (bloodType: string, location: string) => {
    // In a real app, this would send push notifications to nearby donors
    // For now, we'll just log it
    console.log(`Emergency notification sent for ${bloodType} in ${location}`)
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="close" size={24} color="#dc2626" />
        </TouchableOpacity>
        <Text style={styles.title}>Emergency Request</Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={styles.emergencyBanner}>
        <Ionicons name="warning" size={32} color="#dc2626" />
        <Text style={styles.emergencyText}>This will send an urgent alert to all nearby donors</Text>
      </View>

      <View style={styles.form}>
        <Text style={styles.label}>Blood Type Needed *</Text>
        <View style={styles.pickerContainer}>
          <Picker selectedValue={bloodType} onValueChange={setBloodType} style={styles.picker}>
            {bloodTypes.map((type) => (
              <Picker.Item key={type} label={type} value={type} />
            ))}
          </Picker>
        </View>

        <Text style={styles.label}>Hospital Name *</Text>
        <TextInput style={styles.input} value={hospital} onChangeText={setHospital} placeholder="Enter hospital name" />

        <Text style={styles.label}>Emergency Contact Number *</Text>
        <TextInput
          style={styles.input}
          value={contactNumber}
          onChangeText={setContactNumber}
          placeholder="Enter contact number"
          keyboardType="phone-pad"
        />

        <Text style={styles.label}>Location</Text>
        <TextInput style={styles.input} value={location} onChangeText={setLocation} placeholder="Current location" />

        <TouchableOpacity
          style={[styles.emergencyButton, loading && styles.disabledButton]}
          onPress={sendEmergencyRequest}
          disabled={loading}
        >
          <Ionicons name="flash" size={20} color="white" />
          <Text style={styles.emergencyButtonText}>Send Emergency Request</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.disclaimer}>
        <Text style={styles.disclaimerText}>
          ⚠️ Only use this for genuine medical emergencies. False alarms may result in account suspension.
        </Text>
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#dc2626",
  },
  emergencyBanner: {
    backgroundColor: "#fef2f2",
    padding: 20,
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#fecaca",
  },
  emergencyText: {
    color: "#dc2626",
    fontSize: 14,
    textAlign: "center",
    marginTop: 8,
    fontWeight: "500",
  },
  form: {
    flex: 1,
    padding: 20,
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
  emergencyButton: {
    backgroundColor: "#dc2626",
    borderRadius: 12,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginTop: 20,
  },
  disabledButton: {
    opacity: 0.6,
  },
  emergencyButtonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
  },
  disclaimer: {
    backgroundColor: "#fef3c7",
    padding: 16,
    margin: 20,
    borderRadius: 8,
  },
  disclaimerText: {
    color: "#92400e",
    fontSize: 12,
    textAlign: "center",
    lineHeight: 16,
  },
})
