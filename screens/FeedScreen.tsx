import { useState, useEffect } from "react"
import { View, Text, FlatList, TouchableOpacity, StyleSheet, SafeAreaView, Alert } from "react-native"
import { supabase } from "../lib/supabase"
import { Ionicons } from "@expo/vector-icons"
import NavigationHeader from "../components/NavigationHeader"

const bloodTypes = ["All", "A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"]

interface BloodRequest {
  id: string
  blood_type: string
  location: string
  message: string
  urgency: string
  is_emergency?: boolean
  created_at: string
  profiles: {
    id:string
    full_name: string
    city: string
  }
  responses: any[]
}

export default function FeedScreen({ navigation }: any) {
  const [requests, setRequests] = useState<BloodRequest[]>([])
  const [filteredRequests, setFilteredRequests] = useState<BloodRequest[]>([])
  const [bloodTypeFilter, setBloodTypeFilter] = useState("All")
  const [userProfile, setUserProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchUserProfile()
    fetchRequests()
  }, [])

  useEffect(() => {
    filterRequests()
  }, [requests, bloodTypeFilter])

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
        profiles:user_id (id,full_name, city),
        responses:blood_request_responses (*)
      `)
      .eq("status", "active")
      .order("is_emergency", { ascending: false })
      .order("created_at", { ascending: false })

    if (error) {
      Alert.alert("Error", error.message)
    } else {
      setRequests(data || [])
    }
    setLoading(false)
  }

  const filterRequests = () => {
    let filtered = requests
    if (bloodTypeFilter !== "All") {
      filtered = requests.filter((req) => req.blood_type === bloodTypeFilter)
    }
    setFilteredRequests(filtered)
  }

  const respondToRequest = async (requestId: string) => {
    if (!userProfile || userProfile.role !== "donor") {
      Alert.alert("Error", "Only donors can respond to requests")
      return
    }

    const { error } = await supabase.from("blood_request_responses").insert({
      request_id: requestId,
      donor_id: userProfile.id,
      message: "I can donate!",
    })

    if (error) {
      Alert.alert("Error", error.message)
    } else {
      Alert.alert("Success", "Your response has been sent!")
      fetchRequests()
    }
  }

  const openChat = (recipientId: string, recipientName: string) => {
    navigation.navigate("Chat", { recipientId, recipientName })
  }

  const renderRequest = ({ item }: { item: BloodRequest }) => (
    <View style={[styles.requestCard, item.is_emergency && styles.emergencyCard]}>
      {item.is_emergency && (
        <View style={styles.emergencyBanner}>
          <Ionicons name="warning" size={16} color="#dc2626" />
          <Text style={styles.emergencyText}>EMERGENCY REQUEST</Text>
        </View>
      )}

      <View style={styles.requestHeader}>
        <View>
          <Text style={styles.requestName}>{item.profiles?.full_name}</Text>
          <Text style={styles.requestLocation}>{item.profiles?.city}</Text>
        </View>
        <View style={styles.bloodTypeBadge}>
          <Text style={styles.bloodTypeText}>{item.blood_type}</Text>
        </View>
      </View>

      <Text style={styles.requestMessage}>{item.message}</Text>
      <Text style={styles.requestLocation}>📍 {item.location}</Text>

      <View style={styles.requestFooter}>
        <Text style={styles.requestTime}>{new Date(item.created_at).toLocaleDateString()}</Text>
        <View style={styles.actionButtons}>
          {userProfile?.role === "donor" && (
            <>
              <TouchableOpacity
                style={styles.chatButton}
                onPress={() => openChat(item.profiles?.id, item.profiles?.full_name)}
              >
                <Ionicons name="chatbubble-outline" size={16} color="#666" />
              </TouchableOpacity>
              <TouchableOpacity style={styles.donateButton} onPress={() => respondToRequest(item.id)}>
                <Text style={styles.donateButtonText}>I Can Donate</Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      </View>

      {item.responses?.length > 0 && (
        <Text style={styles.responseCount}>{item.responses.length} donor(s) responded</Text>
      )}
    </View>
  )

  return (
    <SafeAreaView style={styles.container}>
      <NavigationHeader
        title="BloodLink"
        subtitle="Find and help blood donors"
        rightComponent={
          <View style={styles.headerActions}>
            {userProfile?.role === "recipient" && (
              <TouchableOpacity style={styles.emergencyButton} onPress={() => navigation.navigate("EmergencyRequest")}>
                <Ionicons name="flash" size={20} color="white" />
              </TouchableOpacity>
            )}
            {userProfile?.role === "recipient" && (
              <TouchableOpacity style={styles.addButton} onPress={() => navigation.navigate("CreateRequest")}>
                <Ionicons name="add" size={24} color="white" />
              </TouchableOpacity>
            )}
          </View>
        }
      />

      <View style={styles.filterContainer}>
        <Text style={styles.filterLabel}>Filter by blood type:</Text>
        <View style={styles.bloodTypeGrid}>
          {bloodTypes.map((type) => {
            const isSelected = bloodTypeFilter === type;
            return (
              <TouchableOpacity
                key={type}
                style={[styles.bloodTypeButton, isSelected ? styles.bloodTypeButtonSelected : styles.bloodTypeButtonUnselected]}
                onPress={() => setBloodTypeFilter(type)}
                activeOpacity={0.7}
              >
                <Text style={[styles.bloodTypeButtonText, isSelected ? styles.bloodTypeButtonTextSelected : styles.bloodTypeButtonTextUnselected]}>
                  {type}
                </Text>
              </TouchableOpacity>
            )
          })}
        </View>
</View>


      <FlatList
        data={filteredRequests}
        renderItem={renderRequest}
        keyExtractor={(item) => item.id}
        refreshing={loading}
        onRefresh={fetchRequests}
        contentContainerStyle={styles.listContainer}
      />
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  headerActions: {
    flexDirection: "row",
    gap: 8,
  },
  emergencyButton: {
    backgroundColor: "#ef4444",
    borderRadius: 20,
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  addButton: {
    backgroundColor: "#dc2626",
    borderRadius: 20,
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  filterContainer: {
    backgroundColor: "white",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  filterLabel: {
    fontSize: 14,
    color: "#666",
    marginBottom: 8,
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
  },
  picker: {
    height: 40,
  },
  listContainer: {
    padding: 16,
  },
  requestCard: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  emergencyCard: {
    borderWidth: 2,
    borderColor: "#dc2626",
  },
  emergencyBanner: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fef2f2",
    padding: 8,
    borderRadius: 6,
    marginBottom: 12,
    gap: 6,
  },
  emergencyText: {
    color: "#dc2626",
    fontSize: 12,
    fontWeight: "bold",
  },
  requestHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  requestName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
  },
  requestLocation: {
    fontSize: 14,
    color: "#666",
    marginTop: 2,
  },
  bloodTypeBadge: {
    backgroundColor: "#dc2626",
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  bloodTypeText: {
    color: "white",
    fontSize: 14,
    fontWeight: "600",
  },
  requestMessage: {
    fontSize: 14,
    color: "#333",
    marginBottom: 8,
    lineHeight: 20,
  },
  requestFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 12,
  },
  requestTime: {
    fontSize: 12,
    color: "#999",
  },
  actionButtons: {
    flexDirection: "row",
    gap: 8,
    alignItems: "center",
  },
  chatButton: {
    padding: 8,
  },
  donateButton: {
    backgroundColor: "#dc2626",
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  donateButtonText: {
    color: "white",
    fontSize: 14,
    fontWeight: "600",
  },
  responseCount: {
    fontSize: 12,
    color: "#dc2626",
    marginTop: 8,
    fontWeight: "500",
  },
  bloodTypeGrid: {
  flexDirection: "row",
  flexWrap: "wrap",
  gap: 8,
  justifyContent: "flex-start",
},

bloodTypeButton: {
  borderRadius: 16,
  paddingVertical: 8,
  paddingHorizontal: 12,
  minWidth: 48,
  alignItems: "center",
  justifyContent: "center",
},

bloodTypeButtonSelected: {
  backgroundColor: "#dc2626", // Strong red
},

bloodTypeButtonUnselected: {
  backgroundColor: "#ffbebeff", // Soft red (lighter)
},

bloodTypeButtonText: {
  fontSize: 14,
  fontWeight: "600",
},

bloodTypeButtonTextSelected: {
  color: "white",
},

bloodTypeButtonTextUnselected: {
  color: "#7f1d1d", // Darker red text
},

})
