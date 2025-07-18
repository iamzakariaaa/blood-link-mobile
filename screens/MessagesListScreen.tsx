"use client"

import { useState, useEffect } from "react"
import { View, Text, FlatList, TouchableOpacity, StyleSheet, SafeAreaView, TextInput } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { supabase } from "../lib/supabase"

interface Conversation {
  id: string
  participant_name: string
  participant_id: string
  last_message: string
  last_message_time: string
  unread_count: number
  participant_avatar?: string
}

export default function MessagesListScreen({ navigation }: any) {
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [loading, setLoading] = useState(true)
  const [currentUserId, setCurrentUserId] = useState("")

  useEffect(() => {
    getCurrentUser()
    fetchConversations()
  }, [])

  const getCurrentUser = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (user) {
      setCurrentUserId(user.id)
    }
  }

  const fetchConversations = async () => {
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return

  const { data: messages, error } = await supabase
    .from("messages")
    .select("*")
    .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)
    .order("created_at", { ascending: false })

  if (error) {
    console.error("Error fetching messages:", error)
    setLoading(false)
    return
  }

  // Get all unique participant IDs (excluding current user)
  const participantIds = new Set<string>()
  messages?.forEach((msg) => {
    if (msg.sender_id !== user.id) participantIds.add(msg.sender_id)
    if (msg.receiver_id !== user.id) participantIds.add(msg.receiver_id)
  })

  // Fetch profiles for these participant IDs
  const { data: profiles } = await supabase
    .from("profiles")
    .select("id, full_name") // adjust fields as needed
    .in("id", Array.from(participantIds))

  // Map profiles by id for easy lookup
  const profileMap = profiles?.reduce((acc, profile) => {
    acc[profile.id] = profile
    return acc
  }, {} as Record<string, { full_name: string; avatar_url?: string }>) || {}

  // Group messages by participant and build conversations
  const conversationMap = new Map<string, Conversation>()

  messages?.forEach((message) => {
    const isFromCurrentUser = message.sender_id === user.id
    const partnerId = isFromCurrentUser ? message.receiver_id : message.sender_id
    const partnerProfile = profileMap[partnerId]

    if (!conversationMap.has(partnerId)) {
      conversationMap.set(partnerId, {
        id: partnerId,
        participant_id: partnerId,
        participant_name: partnerProfile?.full_name || "Unknown User",
        participant_avatar: partnerProfile?.avatar_url,
        last_message: message.message,
        last_message_time: message.created_at,
        unread_count: 0, // Implement your unread count logic if needed
      })
    }
  })

  setConversations(Array.from(conversationMap.values()))
  setLoading(false)
}


  const openChat = (participantId: string, participantName: string) => {
    navigation.navigate("Chat", { recipientId: participantId, recipientName: participantName })
  }

  const filteredConversations = conversations.filter((conv) =>
    conv.participant_name.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const renderConversation = ({ item }: { item: Conversation }) => (
    <TouchableOpacity
      style={styles.conversationItem}
      onPress={() => openChat(item.participant_id, item.participant_name)}
    >
      <View style={styles.avatarContainer}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{item.participant_name.charAt(0).toUpperCase()}</Text>
        </View>
        {item.unread_count > 0 && (
          <View style={styles.unreadBadge}>
            <Text style={styles.unreadText}>{item.unread_count}</Text>
          </View>
        )}
      </View>

      <View style={styles.conversationContent}>
        <View style={styles.conversationHeader}>
          <Text style={styles.participantName}>{item.participant_name}</Text>
          <Text style={styles.messageTime}>
            {new Date(item.last_message_time).toLocaleDateString() === new Date().toLocaleDateString()
              ? new Date(item.last_message_time).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
              : new Date(item.last_message_time).toLocaleDateString()}
          </Text>
        </View>
        <Text style={styles.lastMessage} numberOfLines={2}>
          {item.last_message}
        </Text>
      </View>

      <Ionicons name="chevron-forward" size={20} color="#ccc" />
    </TouchableOpacity>
  )

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Messages</Text>
        <TouchableOpacity style={styles.newMessageButton}>
          <Ionicons name="create-outline" size={24} color="#dc2626" />
        </TouchableOpacity>
      </View>

      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Ionicons name="search" size={20} color="#666" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search conversations..."
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading conversations...</Text>
        </View>
      ) : filteredConversations.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="chatbubbles-outline" size={64} color="#ccc" />
          <Text style={styles.emptyTitle}>No Messages Yet</Text>
          <Text style={styles.emptySubtitle}>
            Start a conversation by responding to blood requests or reaching out to donors.
          </Text>
        </View>
      ) : (
        <FlatList
          data={filteredConversations}
          renderItem={renderConversation}
          keyExtractor={(item) => item.id}
          style={styles.conversationsList}
          showsVerticalScrollIndicator={false}
        />
      )}
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    backgroundColor: "white",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#dc2626",
  },
  newMessageButton: {
    padding: 8,
  },
  searchContainer: {
    backgroundColor: "white",
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f3f4f6",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: "#333",
  },
  conversationsList: {
    flex: 1,
  },
  conversationItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "white",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#f3f4f6",
  },
  avatarContainer: {
    position: "relative",
    marginRight: 16,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#dc2626",
    justifyContent: "center",
    alignItems: "center",
  },
  avatarText: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
  },
  unreadBadge: {
    position: "absolute",
    top: -2,
    right: -2,
    backgroundColor: "#ef4444",
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  unreadText: {
    color: "white",
    fontSize: 12,
    fontWeight: "bold",
  },
  conversationContent: {
    flex: 1,
  },
  conversationHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  participantName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
  },
  messageTime: {
    fontSize: 12,
    color: "#666",
  },
  lastMessage: {
    fontSize: 14,
    color: "#666",
    lineHeight: 18,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    fontSize: 16,
    color: "#666",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#333",
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
    lineHeight: 20,
  },
})
