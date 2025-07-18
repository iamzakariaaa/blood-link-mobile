"use client"

import { View, Text, StyleSheet } from "react-native"

interface TabBarBadgeProps {
  count: number
  color?: string
}

export default function TabBarBadge({ count, color = "#ef4444" }: TabBarBadgeProps) {
  if (count === 0) return null

  return (
    <View style={[styles.badge, { backgroundColor: color }]}>
      <Text style={styles.badgeText}>{count > 99 ? "99+" : count.toString()}</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  badge: {
    position: "absolute",
    top: -6,
    right: -6,
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "white",
  },
  badgeText: {
    color: "white",
    fontSize: 12,
    fontWeight: "bold",
  },
})
