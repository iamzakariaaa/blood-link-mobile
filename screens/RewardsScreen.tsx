"use client"

import { useState, useEffect } from "react"
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, FlatList } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { supabase } from "../lib/supabase"

interface Achievement {
  id: string
  title: string
  description: string
  icon: string
  points: number
  unlocked: boolean
  progress?: number
  maxProgress?: number
}

interface Reward {
  id: string
  title: string
  description: string
  points_required: number
  category: string
  available: boolean
}

export default function RewardsScreen({ navigation }: any) {
  const [userPoints, setUserPoints] = useState(0)
  const [achievements, setAchievements] = useState<Achievement[]>([])
  const [rewards, setRewards] = useState<Reward[]>([])
  const [activeTab, setActiveTab] = useState<"achievements" | "rewards">("achievements")

  useEffect(() => {
    fetchUserData()
    fetchAchievements()
    fetchRewards()
  }, [])

  const fetchUserData = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (user) {
      const { data } = await supabase.from("profiles").select("reward_points").eq("id", user.id).single()

      setUserPoints(data?.reward_points || 0)
    }
  }

  const fetchAchievements = async () => {
    // Mock achievements data
    setAchievements([
      {
        id: "1",
        title: "First Donation",
        description: "Complete your first blood donation",
        icon: "🩸",
        points: 100,
        unlocked: true,
      },
      {
        id: "2",
        title: "Life Saver",
        description: "Help 5 people with your donations",
        icon: "🦸",
        points: 500,
        unlocked: true,
        progress: 3,
        maxProgress: 5,
      },
      {
        id: "3",
        title: "Hero of the Month",
        description: "Be the most active donor this month",
        icon: "🏆",
        points: 1000,
        unlocked: false,
        progress: 2,
        maxProgress: 10,
      },
      {
        id: "4",
        title: "Emergency Responder",
        description: "Respond to 3 emergency requests",
        icon: "🚨",
        points: 750,
        unlocked: false,
        progress: 1,
        maxProgress: 3,
      },
    ])
  }

  const fetchRewards = async () => {
    // Mock rewards data
    setRewards([
      {
        id: "1",
        title: "Free Health Checkup",
        description: "Complete health screening at partner clinics",
        points_required: 500,
        category: "Health",
        available: true,
      },
      {
        id: "2",
        title: "BloodLink T-Shirt",
        description: "Exclusive BloodLink branded merchandise",
        points_required: 300,
        category: "Merchandise",
        available: true,
      },
      {
        id: "3",
        title: "Priority Support",
        description: "24/7 priority customer support access",
        points_required: 1000,
        category: "Service",
        available: false,
      },
      {
        id: "4",
        title: "Donation Certificate",
        description: "Official certificate of appreciation",
        points_required: 200,
        category: "Recognition",
        available: true,
      },
    ])
  }

  const renderAchievement = ({ item }: { item: Achievement }) => (
    <View style={[styles.achievementCard, !item.unlocked && styles.lockedCard]}>
      <View style={styles.achievementIcon}>
        <Text style={styles.iconText}>{item.icon}</Text>
      </View>
      <View style={styles.achievementContent}>
        <Text style={[styles.achievementTitle, !item.unlocked && styles.lockedText]}>{item.title}</Text>
        <Text style={[styles.achievementDescription, !item.unlocked && styles.lockedText]}>{item.description}</Text>
        {item.progress !== undefined && (
          <View style={styles.progressContainer}>
            <View style={styles.progressBar}>
              <View style={[styles.progressFill, { width: `${(item.progress! / item.maxProgress!) * 100}%` }]} />
            </View>
            <Text style={styles.progressText}>
              {item.progress}/{item.maxProgress}
            </Text>
          </View>
        )}
      </View>
      <View style={styles.pointsBadge}>
        <Text style={styles.pointsText}>{item.points}pts</Text>
      </View>
    </View>
  )

  const renderReward = ({ item }: { item: Reward }) => (
    <View style={[styles.rewardCard, !item.available && styles.unavailableCard]}>
      <View style={styles.rewardContent}>
        <Text style={styles.rewardTitle}>{item.title}</Text>
        <Text style={styles.rewardDescription}>{item.description}</Text>
        <Text style={styles.rewardCategory}>{item.category}</Text>
      </View>
      <View style={styles.rewardAction}>
        <Text style={styles.rewardPoints}>{item.points_required} pts</Text>
        <TouchableOpacity
          style={[styles.redeemButton, (!item.available || userPoints < item.points_required) && styles.disabledButton]}
          disabled={!item.available || userPoints < item.points_required}
        >
          <Text style={styles.redeemButtonText}>{userPoints >= item.points_required ? "Redeem" : "Need More"}</Text>
        </TouchableOpacity>
      </View>
    </View>
  )

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#dc2626" />
        </TouchableOpacity>
        <Text style={styles.title}>Rewards</Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={styles.pointsCard}>
        <View style={styles.pointsContent}>
          <Text style={styles.pointsLabel}>Your Points</Text>
          <Text style={styles.pointsValue}>{userPoints}</Text>
        </View>
        <Ionicons name="star" size={32} color="#fbbf24" />
      </View>

      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === "achievements" && styles.activeTab]}
          onPress={() => setActiveTab("achievements")}
        >
          <Text style={[styles.tabText, activeTab === "achievements" && styles.activeTabText]}>Achievements</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === "rewards" && styles.activeTab]}
          onPress={() => setActiveTab("rewards")}
        >
          <Text style={[styles.tabText, activeTab === "rewards" && styles.activeTabText]}>Rewards</Text>
        </TouchableOpacity>
      </View>

      {activeTab === "achievements" ? (
        <FlatList
          data={achievements}
          renderItem={renderAchievement}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
        />
      ) : (
        <FlatList
          data={rewards}
          renderItem={renderReward}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContainer}
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
    fontSize: 20,
    fontWeight: "bold",
    color: "#dc2626",
  },
  pointsCard: {
    backgroundColor: "white",
    margin: 16,
    padding: 20,
    borderRadius: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  pointsContent: {
    flex: 1,
  },
  pointsLabel: {
    fontSize: 14,
    color: "#666",
    marginBottom: 4,
  },
  pointsValue: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#dc2626",
  },
  tabContainer: {
    flexDirection: "row",
    backgroundColor: "white",
    marginHorizontal: 16,
    borderRadius: 8,
    padding: 4,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: "center",
    borderRadius: 6,
  },
  activeTab: {
    backgroundColor: "#dc2626",
  },
  tabText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#666",
  },
  activeTabText: {
    color: "white",
  },
  listContainer: {
    padding: 16,
  },
  achievementCard: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: "row",
    alignItems: "center",
  },
  lockedCard: {
    opacity: 0.6,
  },
  achievementIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#fef2f2",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  iconText: {
    fontSize: 24,
  },
  achievementContent: {
    flex: 1,
  },
  achievementTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 4,
  },
  achievementDescription: {
    fontSize: 14,
    color: "#666",
    marginBottom: 8,
  },
  lockedText: {
    color: "#999",
  },
  progressContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  progressBar: {
    flex: 1,
    height: 6,
    backgroundColor: "#f3f4f6",
    borderRadius: 3,
  },
  progressFill: {
    height: "100%",
    backgroundColor: "#dc2626",
    borderRadius: 3,
  },
  progressText: {
    fontSize: 12,
    color: "#666",
  },
  pointsBadge: {
    backgroundColor: "#dc2626",
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  pointsText: {
    color: "white",
    fontSize: 12,
    fontWeight: "600",
  },
  rewardCard: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: "row",
    alignItems: "center",
  },
  unavailableCard: {
    opacity: 0.6,
  },
  rewardContent: {
    flex: 1,
  },
  rewardTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 4,
  },
  rewardDescription: {
    fontSize: 14,
    color: "#666",
    marginBottom: 4,
  },
  rewardCategory: {
    fontSize: 12,
    color: "#dc2626",
    fontWeight: "500",
  },
  rewardAction: {
    alignItems: "flex-end",
  },
  rewardPoints: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
    marginBottom: 8,
  },
  redeemButton: {
    backgroundColor: "#dc2626",
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  disabledButton: {
    backgroundColor: "#ccc",
  },
  redeemButtonText: {
    color: "white",
    fontSize: 12,
    fontWeight: "600",
  },
})
