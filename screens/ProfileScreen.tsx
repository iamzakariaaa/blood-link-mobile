"use client"

import { useState, useEffect } from "react"
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, Alert, Switch, ScrollView } from "react-native"
import { supabase } from "../lib/supabase"
import { Ionicons } from "@expo/vector-icons"
import NavigationHeader from "../components/NavigationHeader"

export default function ProfileScreen({ navigation }: any) {
  const [profile, setProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchProfile()
  }, [])

  const fetchProfile = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (user) {
      const { data } = await supabase.from("profiles").select("*").eq("id", user.id).single()
      setProfile(data)
    }
    setLoading(false)
  }

  const toggleAvailability = async () => {
    if (!profile) return

    const newStatus = !profile.available_to_donate
    const { error } = await supabase.from("profiles").update({ available_to_donate: newStatus }).eq("id", profile.id)

    if (error) {
      Alert.alert("Error", error.message)
    } else {
      setProfile({ ...profile, available_to_donate: newStatus })
    }
  }

  const signOut = async () => {
    const { error } = await supabase.auth.signOut()
    if (error) Alert.alert("Error", error.message)
  }

  const menuItems = [
    {
      title: "Donor Verification",
      subtitle: "Get verified as a trusted donor",
      icon: "shield-checkmark",
      onPress: () => navigation.navigate("DonorVerification"),
      showBadge: profile?.role === "donor" && !profile?.is_verified,
    },
    {
      title: "Rewards & Achievements",
      subtitle: "View your points and achievements",
      icon: "trophy",
      onPress: () => navigation.navigate("Rewards"),
    },
    {
      title: "Blood Compatibility",
      subtitle: "Learn about blood type compatibility",
      icon: "medical",
      onPress: () => navigation.navigate("BloodCompatibility"),
    },
    {
      title: "Notification Settings",
      subtitle: "Manage your notification preferences",
      icon: "notifications",
      onPress: () => navigation.navigate("NotificationSettings"),
    },
  ]

  if (loading || !profile) {
    return (
      <SafeAreaView style={styles.container}>
        <Text>Loading...</Text>
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        <NavigationHeader title="Profile" subtitle="Manage your account and preferences" />

        <View style={styles.content}>
          <View style={styles.profileCard}>
            <View style={styles.avatarContainer}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>{profile.full_name?.charAt(0)?.toUpperCase()}</Text>
              </View>
              {profile.is_verified && (
                <View style={styles.verifiedBadge}>
                  <Ionicons name="checkmark-circle" size={20} color="#059669" />
                </View>
              )}
            </View>

            <Text style={styles.name}>{profile.full_name}</Text>
            <Text style={styles.email}>{profile.email}</Text>

            <View style={styles.infoGrid}>
              <View style={styles.infoItem}>
                <Text style={styles.infoLabel}>Blood Type</Text>
                <View style={styles.bloodTypeBadge}>
                  <Text style={styles.bloodTypeText}>{profile.blood_type}</Text>
                </View>
              </View>

              <View style={styles.infoItem}>
                <Text style={styles.infoLabel}>Role</Text>
                <Text style={styles.infoValue}>{profile.role}</Text>
              </View>

              <View style={styles.infoItem}>
                <Text style={styles.infoLabel}>City</Text>
                <Text style={styles.infoValue}>{profile.city}</Text>
              </View>

              <View style={styles.infoItem}>
                <Text style={styles.infoLabel}>Phone</Text>
                <Text style={styles.infoValue}>{profile.phone}</Text>
              </View>

              {profile.role === "donor" && profile.last_donation && (
                <View style={styles.infoItem}>
                  <Text style={styles.infoLabel}>Last Donation</Text>
                  <Text style={styles.infoValue}>{new Date(profile.last_donation).toLocaleDateString()}</Text>
                </View>
              )}
            </View>

            {profile.role === "donor" && (
              <View style={styles.availabilityContainer}>
                <Text style={styles.availabilityLabel}>Available to Donate</Text>
                <Switch
                  value={profile.available_to_donate}
                  onValueChange={toggleAvailability}
                  trackColor={{ false: "#ccc", true: "#dc2626" }}
                  thumbColor={profile.available_to_donate ? "#fff" : "#f4f3f4"}
                />
              </View>
            )}
          </View>

          <View style={styles.menuSection}>
            {menuItems.map((item, index) => (
              <TouchableOpacity key={index} style={styles.menuItem} onPress={item.onPress}>
                <View style={styles.menuIcon}>
                  <Ionicons name={item.icon as any} size={24} color="#dc2626" />
                </View>
                <View style={styles.menuContent}>
                  <Text style={styles.menuTitle}>{item.title}</Text>
                  <Text style={styles.menuSubtitle}>{item.subtitle}</Text>
                </View>
                <View style={styles.menuAction}>
                  {item.showBadge && <View style={styles.notificationDot} />}
                  <Ionicons name="chevron-forward" size={20} color="#ccc" />
                </View>
              </TouchableOpacity>
            ))}
          </View>

          <TouchableOpacity style={styles.signOutButton} onPress={signOut}>
            <Ionicons name="log-out-outline" size={20} color="white" />
            <Text style={styles.signOutButtonText}>Sign Out</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
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
  content: {
    flex: 1,
    padding: 20,
  },
  profileCard: {
    backgroundColor: "white",
    borderRadius: 16,
    padding: 24,
    alignItems: "center",
    marginBottom: 20,
  },
  avatarContainer: {
    position: "relative",
    marginBottom: 16,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#dc2626",
    justifyContent: "center",
    alignItems: "center",
  },
  avatarText: {
    fontSize: 32,
    fontWeight: "bold",
    color: "white",
  },
  verifiedBadge: {
    position: "absolute",
    bottom: 0,
    right: 0,
    backgroundColor: "white",
    borderRadius: 12,
    padding: 2,
  },
  name: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 4,
  },
  email: {
    fontSize: 16,
    color: "#666",
    marginBottom: 24,
  },
  infoGrid: {
    width: "100%",
    gap: 16,
  },
  infoItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 8,
  },
  infoLabel: {
    fontSize: 16,
    color: "#666",
  },
  infoValue: {
    fontSize: 16,
    color: "#333",
    fontWeight: "500",
  },
  bloodTypeBadge: {
    backgroundColor: "#dc2626",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  bloodTypeText: {
    color: "white",
    fontSize: 14,
    fontWeight: "600",
  },
  availabilityContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    width: "100%",
    marginTop: 24,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: "#eee",
  },
  availabilityLabel: {
    fontSize: 16,
    color: "#333",
    fontWeight: "500",
  },
  menuSection: {
    backgroundColor: "white",
    borderRadius: 12,
    marginBottom: 20,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#f3f4f6",
  },
  menuIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#fef2f2",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  menuContent: {
    flex: 1,
  },
  menuTitle: {
    fontSize: 16,
    fontWeight: "500",
    color: "#333",
    marginBottom: 4,
  },
  menuSubtitle: {
    fontSize: 14,
    color: "#666",
  },
  menuAction: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  notificationDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#dc2626",
  },
  signOutButton: {
    backgroundColor: "#dc2626",
    borderRadius: 12,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  signOutButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
})
