import { useState, useEffect } from "react"
import { View, Text, FlatList, TouchableOpacity, StyleSheet, SafeAreaView, Alert } from "react-native"
import { supabase } from "../lib/supabase"
import NavigationHeader from "../components/NavigationHeader"

interface HistoryItem {
  id: string
  blood_type: string
  location: string
  message: string
  status: string
  created_at: string
  type: "request" | "response"
}

export default function HistoryScreen() {
  const [history, setHistory] = useState<HistoryItem[]>([])
  const [userProfile, setUserProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchUserProfile()
  }, [])

  useEffect(() => {
    if (userProfile) {
      fetchHistory()
    }
  }, [userProfile])

  const fetchUserProfile = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (user) {
      const { data } = await supabase.from("profiles").select("*").eq("id", user.id).single()
      setUserProfile(data)
    }
  }

  const fetchHistory = async () => {
    if (!userProfile) return

    let historyData: HistoryItem[] = []

    if (userProfile.role === "recipient") {
      // Fetch user's blood requests
      const { data: requests } = await supabase
        .from("blood_requests")
        .select("*")
        .eq("user_id", userProfile.id)
        .order("created_at", { ascending: false })

      if (requests) {
        historyData = requests.map((req) => ({
          ...req,
          type: "request" as const,
        }))
      }
    } else {
      // Fetch user's donation responses
      const { data: responses } = await supabase
        .from("blood_request_responses")
        .select(`
          *,
          blood_requests (blood_type, location, message, status)
        `)
        .eq("donor_id", userProfile.id)
        .order("created_at", { ascending: false })

      if (responses) {
        historyData = responses.map((resp) => ({
          id: resp.id,
          blood_type: resp.blood_requests?.blood_type || "",
          location: resp.blood_requests?.location || "",
          message: resp.message || "",
          status: resp.blood_requests?.status || "",
          created_at: resp.created_at,
          type: "response" as const,
        }))
      }
    }

    setHistory(historyData)
    setLoading(false)
  }

  const updateRequestStatus = async (requestId: string, status: string) => {
    const { error } = await supabase.from("blood_requests").update({ status }).eq("id", requestId)

    if (error) {
      Alert.alert("Error", error.message)
    } else {
      Alert.alert("Success", `Request marked as ${status}`)
      fetchHistory()
    }
  }

  const renderHistoryItem = ({ item }: { item: HistoryItem }) => (
    <View style={styles.historyCard}>
      <View style={styles.historyHeader}>
        <View style={styles.bloodTypeBadge}>
          <Text style={styles.bloodTypeText}>{item.blood_type}</Text>
        </View>
        <Text style={styles.historyType}>{item.type === "request" ? "Request" : "Response"}</Text>
      </View>

      <Text style={styles.historyLocation}>📍 {item.location}</Text>
      <Text style={styles.historyMessage}>{item.message}</Text>

      <View style={styles.historyFooter}>
        <Text style={styles.historyDate}>{new Date(item.created_at).toLocaleDateString()}</Text>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
          <Text style={styles.statusText}>{item.status}</Text>
        </View>
      </View>

      {item.type === "request" && item.status === "active" && (
        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: "#00796B" }]}
            onPress={() => updateRequestStatus(item.id, "fulfilled")}
          >
            <Text style={styles.actionButtonText}>Mark Fulfilled</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: "#DC143C" }]}
            onPress={() => updateRequestStatus(item.id, "cancelled")}
          >
            <Text style={styles.actionButtonText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  )

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "#3b82f6"
      case "fulfilled":
        return "#22c55e"
      case "cancelled":
        return "#ef4444"
      default:
        return "#6b7280"
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <NavigationHeader
        title="My Requests"
        subtitle={userProfile?.role === "donor" ? "Your donation responses" : "Your blood requests"}
      />

      <FlatList
        data={history}
        renderItem={renderHistoryItem}
        keyExtractor={(item) => item.id}
        refreshing={loading}
        onRefresh={fetchHistory}
        contentContainerStyle={styles.listContainer}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No history yet</Text>
          </View>
        }
      />
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
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
  listContainer: {
    padding: 16,
  },
  historyCard: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  historyHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
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
  historyType: {
    fontSize: 14,
    color: "#666",
    fontWeight: "500",
  },
  historyLocation: {
    fontSize: 14,
    color: "#666",
    marginBottom: 8,
  },
  historyMessage: {
    fontSize: 14,
    color: "#333",
    marginBottom: 12,
    lineHeight: 20,
  },
  historyFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  historyDate: {
    fontSize: 12,
    color: "#999",
  },
  statusBadge: {
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  statusText: {
    color: "white",
    fontSize: 12,
    fontWeight: "500",
    textTransform: "capitalize",
  },
  actionButtons: {
    flexDirection: "row",
    gap: 8,
    marginTop: 12,
  },
  actionButton: {
    flex: 1,
    borderRadius: 8,
    paddingVertical: 8,
    alignItems: "center",
  },
  actionButtonText: {
    color: "white",
    fontSize: 14,
    fontWeight: "600",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingTop: 100,
  },
  emptyText: {
    fontSize: 16,
    color: "#666",
  },
})
