
import { useState, useEffect } from "react"
import { StyleSheet, SafeAreaView, Alert, TouchableOpacity } from "react-native"
import MapView, { Marker } from "react-native-maps"
import * as Location from "expo-location"
import { supabase } from "../lib/supabase"
import NavigationHeader from "../components/NavigationHeader"
import { Ionicons } from "@expo/vector-icons"
import { useNavigation } from "@react-navigation/native"

interface BloodRequest {
  id: string
  blood_type: string
  location: string
  message: string
  latitude?: number
  longitude?: number
  profiles: {
    full_name: string
    city: string
  }
}

export default function MapScreen() {
  const [location, setLocation] = useState<any>(null)
  const [requests, setRequests] = useState<BloodRequest[]>([])
  const [userProfile, setUserProfile] = useState<any>(null)
  const navigation = useNavigation()

  useEffect(() => {
    getCurrentLocation()
    fetchUserProfile()
    fetchRequests()
  }, [])

  const getCurrentLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync()
      if (status !== "granted") {
        Alert.alert("Permission denied", "Location permission is required")
        return
      }

      const location = await Location.getCurrentPositionAsync({})
      setLocation(location.coords)
    } catch (error) {
      Alert.alert("Error", "Could not get location")
    }
  }

  const fetchUserProfile = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (user) {
      const { data } = await supabase.from("profiles").select("*").eq("id", user.id).single()
      setUserProfile(data)
    }
  }

  const fetchRequests = async () => {
    const { data, error } = await supabase
      .from("blood_requests")
      .select(`
        *,
        profiles:user_id (full_name, city)
      `)
      .eq("status", "active")

    if (error) {
      Alert.alert("Error", error.message)
    } else {
      // In a real app, you'd geocode the location strings to get coordinates
      // For demo purposes, we'll use random coordinates around the user's location
      const requestsWithCoords = (data || []).map((req, index) => ({
        ...req,
        latitude: location ? location.latitude + (Math.random() - 0.5) * 0.1 : 37.78825 + (Math.random() - 0.5) * 0.1,
        longitude: location
          ? location.longitude + (Math.random() - 0.5) * 0.1
          : -122.4324 + (Math.random() - 0.5) * 0.1,
      }))
      setRequests(requestsWithCoords)
    }
  }

  const initialRegion = {
    latitude: location?.latitude || 37.78825,
    longitude: location?.longitude || -122.4324,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  }

  return (
    <SafeAreaView style={styles.container}>
      <NavigationHeader
        title="Nearby Requests"
        subtitle={userProfile?.role === "donor" ? "Find blood requests near you" : "View all requests on map"}
        rightComponent={
          <TouchableOpacity onPress={() => navigation.navigate("BloodCompatibility")}>
            <Ionicons name="information-circle-outline" size={24} color="#dc2626" />
          </TouchableOpacity>
        }
      />

      <MapView style={styles.map} initialRegion={initialRegion} showsUserLocation={true} showsMyLocationButton={true}>
        {requests.map((request) => (
          <Marker
            key={request.id}
            coordinate={{
              latitude: request.latitude!,
              longitude: request.longitude!,
            }}
            title={`${request.blood_type} needed`}
            description={`${request.profiles?.full_name} - ${request.location}`}
            pinColor="#dc2626"
          />
        ))}
      </MapView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  header: {
    padding: 20,
    backgroundColor: "white",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#dc2626",
  },
  subtitle: {
    fontSize: 14,
    color: "#666",
    marginTop: 4,
  },
  map: {
    flex: 1,
  },
})
