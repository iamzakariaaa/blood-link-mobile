"use client"

import { useState, useEffect } from "react"
import { View, Text, StyleSheet, SafeAreaView, ScrollView, Switch, TouchableOpacity } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import AsyncStorage from "@react-native-async-storage/async-storage"

interface NotificationSetting {
  id: string
  title: string
  description: string
  enabled: boolean
  category: "requests" | "responses" | "general"
}

export default function NotificationSettingsScreen({ navigation }: any) {
  const [settings, setSettings] = useState<NotificationSetting[]>([
    {
      id: "emergency_requests",
      title: "Emergency Requests",
      description: "Get notified about critical blood requests in your area",
      enabled: true,
      category: "requests",
    },
    {
      id: "nearby_requests",
      title: "Nearby Requests",
      description: "Blood requests within 10km of your location",
      enabled: true,
      category: "requests",
    },
    {
      id: "matching_blood_type",
      title: "Matching Blood Type",
      description: "Requests specifically for your blood type",
      enabled: true,
      category: "requests",
    },
    {
      id: "donation_responses",
      title: "Donation Responses",
      description: "When someone responds to your blood request",
      enabled: true,
      category: "responses",
    },
    {
      id: "request_updates",
      title: "Request Updates",
      description: "Status changes on requests you responded to",
      enabled: true,
      category: "responses",
    },
    {
      id: "chat_messages",
      title: "Chat Messages",
      description: "New messages from donors or recipients",
      enabled: true,
      category: "responses",
    },
    {
      id: "donation_reminders",
      title: "Donation Reminders",
      description: "Reminders when you're eligible to donate again",
      enabled: false,
      category: "general",
    },
    {
      id: "app_updates",
      title: "App Updates",
      description: "New features and important announcements",
      enabled: false,
      category: "general",
    },
  ])

  const [quietHours, setQuietHours] = useState({
    enabled: false,
    start: "22:00",
    end: "08:00",
  })

  useEffect(() => {
    loadSettings()
  }, [])

  const loadSettings = async () => {
    try {
      const savedSettings = await AsyncStorage.getItem("notificationSettings")
      const savedQuietHours = await AsyncStorage.getItem("quietHours")

      if (savedSettings) {
        setSettings(JSON.parse(savedSettings))
      }
      if (savedQuietHours) {
        setQuietHours(JSON.parse(savedQuietHours))
      }
    } catch (error) {
      console.log("Error loading settings:", error)
    }
  }

  const saveSettings = async (newSettings: NotificationSetting[]) => {
    try {
      await AsyncStorage.setItem("notificationSettings", JSON.stringify(newSettings))
      setSettings(newSettings)
    } catch (error) {
      console.log("Error saving settings:", error)
    }
  }

  const toggleSetting = (id: string) => {
    const newSettings = settings.map((setting) =>
      setting.id === id ? { ...setting, enabled: !setting.enabled } : setting,
    )
    saveSettings(newSettings)
  }

  const toggleQuietHours = async () => {
    const newQuietHours = { ...quietHours, enabled: !quietHours.enabled }
    setQuietHours(newQuietHours)
    try {
      await AsyncStorage.setItem("quietHours", JSON.stringify(newQuietHours))
    } catch (error) {
      console.log("Error saving quiet hours:", error)
    }
  }

  const renderSettingItem = (setting: NotificationSetting) => (
    <View key={setting.id} style={styles.settingItem}>
      <View style={styles.settingContent}>
        <Text style={styles.settingTitle}>{setting.title}</Text>
        <Text style={styles.settingDescription}>{setting.description}</Text>
      </View>
      <Switch
        value={setting.enabled}
        onValueChange={() => toggleSetting(setting.id)}
        trackColor={{ false: "#ccc", true: "#dc2626" }}
        thumbColor={setting.enabled ? "#fff" : "#f4f3f4"}
      />
    </View>
  )

  const renderCategory = (category: "requests" | "responses" | "general", title: string) => {
    const categorySettings = settings.filter((setting) => setting.category === category)

    return (
      <View style={styles.categorySection}>
        <Text style={styles.categoryTitle}>{title}</Text>
        {categorySettings.map(renderSettingItem)}
      </View>
    )
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#dc2626" />
        </TouchableOpacity>
        <Text style={styles.title}>Notification Settings</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.quietHoursCard}>
          <View style={styles.quietHoursHeader}>
            <View>
              <Text style={styles.quietHoursTitle}>Quiet Hours</Text>
              <Text style={styles.quietHoursDescription}>Pause non-emergency notifications during these hours</Text>
            </View>
            <Switch
              value={quietHours.enabled}
              onValueChange={toggleQuietHours}
              trackColor={{ false: "#ccc", true: "#dc2626" }}
              thumbColor={quietHours.enabled ? "#fff" : "#f4f3f4"}
            />
          </View>
          {quietHours.enabled && (
            <View style={styles.timeRange}>
              <Text style={styles.timeText}>
                {quietHours.start} - {quietHours.end}
              </Text>
            </View>
          )}
        </View>

        {renderCategory("requests", "Blood Requests")}
        {renderCategory("responses", "Responses & Messages")}
        {renderCategory("general", "General")}

        <View style={styles.infoCard}>
          <Ionicons name="information-circle" size={20} color="#3b82f6" />
          <Text style={styles.infoText}>
            Emergency requests will always notify you regardless of these settings to ensure life-saving donations are
            not missed.
          </Text>
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
  content: {
    flex: 1,
    padding: 16,
  },
  quietHoursCard: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
  },
  quietHoursHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  quietHoursTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
  },
  quietHoursDescription: {
    fontSize: 14,
    color: "#666",
    marginTop: 4,
  },
  timeRange: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#eee",
  },
  timeText: {
    fontSize: 14,
    color: "#dc2626",
    fontWeight: "500",
  },
  categorySection: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
  },
  categoryTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 16,
  },
  settingItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f3f4f6",
  },
  settingContent: {
    flex: 1,
    marginRight: 16,
  },
  settingTitle: {
    fontSize: 14,
    fontWeight: "500",
    color: "#333",
    marginBottom: 4,
  },
  settingDescription: {
    fontSize: 12,
    color: "#666",
    lineHeight: 16,
  },
  infoCard: {
    flexDirection: "row",
    backgroundColor: "#eff6ff",
    padding: 16,
    borderRadius: 8,
    marginBottom: 20,
    gap: 12,
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    color: "#1e40af",
    lineHeight: 18,
  },
})
