import { useState } from "react"
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, ScrollView } from "react-native"
import { Picker } from "@react-native-picker/picker"
import { Ionicons } from "@expo/vector-icons"

const bloodTypes = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"]

const compatibilityData = {
  "A+": { canDonateTo: ["A+", "AB+"], canReceiveFrom: ["A+", "A-", "O+", "O-"] },
  "A-": { canDonateTo: ["A+", "A-", "AB+", "AB-"], canReceiveFrom: ["A-", "O-"] },
  "B+": { canDonateTo: ["B+", "AB+"], canReceiveFrom: ["B+", "B-", "O+", "O-"] },
  "B-": { canDonateTo: ["B+", "B-", "AB+", "AB-"], canReceiveFrom: ["B-", "O-"] },
  "AB+": { canDonateTo: ["AB+"], canReceiveFrom: ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"] },
  "AB-": { canDonateTo: ["AB+", "AB-"], canReceiveFrom: ["A-", "B-", "AB-", "O-"] },
  "O+": { canDonateTo: ["A+", "B+", "AB+", "O+"], canReceiveFrom: ["O+", "O-"] },
  "O-": { canDonateTo: ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"], canReceiveFrom: ["O-"] },
}

export default function BloodCompatibilityScreen({ navigation }: any) {
  const [selectedBloodType, setSelectedBloodType] = useState("A+")
  const [mode, setMode] = useState<"donate" | "receive">("donate")

  const getCompatibilityInfo = () => {
    const data = compatibilityData[selectedBloodType as keyof typeof compatibilityData]
    return mode === "donate" ? data.canDonateTo : data.canReceiveFrom
  }

  const getSpecialInfo = (bloodType: string) => {
    switch (bloodType) {
      case "O-":
        return "Universal Donor - Can donate to all blood types"
      case "AB+":
        return "Universal Recipient - Can receive from all blood types"
      case "O+":
        return "Most common blood type"
      case "AB-":
        return "Rarest blood type"
      default:
        return null
    }
  }

  const BloodTypeCard = ({ type, isCompatible }: { type: string; isCompatible: boolean }) => (
    <View style={[styles.bloodTypeCard, isCompatible ? styles.compatibleCard : styles.incompatibleCard]}>
      <Text style={[styles.bloodTypeText, isCompatible ? styles.compatibleText : styles.incompatibleText]}>{type}</Text>
      <Ionicons
        name={isCompatible ? "checkmark-circle" : "close-circle"}
        size={20}
        color={isCompatible ? "#059669" : "#ef4444"}
      />
    </View>
  )

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#dc2626" />
        </TouchableOpacity>
        <Text style={styles.title}>Blood Compatibility</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.selectorCard}>
          <Text style={styles.selectorLabel}>Select Blood Type</Text>
          <View style={styles.pickerContainer}>
            <Picker selectedValue={selectedBloodType} onValueChange={setSelectedBloodType} style={styles.picker}>
              {bloodTypes.map((type) => (
                <Picker.Item key={type} label={type} value={type} />
              ))}
            </Picker>
          </View>

          <View style={styles.modeSelector}>
            <TouchableOpacity
              style={[styles.modeButton, mode === "donate" && styles.activeModeButton]}
              onPress={() => setMode("donate")}
            >
              <Text style={[styles.modeButtonText, mode === "donate" && styles.activeModeButtonText]}>
                Can Donate To
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.modeButton, mode === "receive" && styles.activeModeButton]}
              onPress={() => setMode("receive")}
            >
              <Text style={[styles.modeButtonText, mode === "receive" && styles.activeModeButtonText]}>
                Can Receive From
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.resultCard}>
          <Text style={styles.resultTitle}>
            {selectedBloodType} {mode === "donate" ? "can donate to:" : "can receive from:"}
          </Text>

          <View style={styles.bloodTypesGrid}>
            {bloodTypes.map((type) => (
              <BloodTypeCard key={type} type={type} isCompatible={getCompatibilityInfo().includes(type)} />
            ))}
          </View>

          {getSpecialInfo(selectedBloodType) && (
            <View style={styles.specialInfoCard}>
              <Ionicons name="information-circle" size={20} color="#3b82f6" />
              <Text style={styles.specialInfoText}>{getSpecialInfo(selectedBloodType)}</Text>
            </View>
          )}
        </View>

        <View style={styles.educationCard}>
          <Text style={styles.educationTitle}>Did You Know?</Text>
          <View style={styles.factsList}>
            <View style={styles.factItem}>
              <Text style={styles.factText}>• One donation can save up to 3 lives</Text>
            </View>
            <View style={styles.factItem}>
              <Text style={styles.factText}>• You can donate every 56 days</Text>
            </View>
            <View style={styles.factItem}>
              <Text style={styles.factText}>• Only 3% of eligible people donate blood</Text>
            </View>
            <View style={styles.factItem}>
              <Text style={styles.factText}>• Blood cannot be manufactured artificially</Text>
            </View>
          </View>
        </View>

        <View style={styles.emergencyCard}>
          <Ionicons name="warning" size={24} color="#dc2626" />
          <Text style={styles.emergencyTitle}>Emergency Compatibility</Text>
          <Text style={styles.emergencyText}>
            In life-threatening emergencies, O- blood can be given to anyone, and AB+ patients can receive any blood
            type.
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
  selectorCard: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
  },
  selectorLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 12,
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    marginBottom: 16,
  },
  picker: {
    height: 50,
  },
  modeSelector: {
    flexDirection: "row",
    backgroundColor: "#f3f4f6",
    borderRadius: 8,
    padding: 4,
  },
  modeButton: {
    flex: 1,
    paddingVertical: 8,
    alignItems: "center",
    borderRadius: 6,
  },
  activeModeButton: {
    backgroundColor: "#dc2626",
  },
  modeButtonText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#666",
  },
  activeModeButtonText: {
    color: "white",
  },
  resultCard: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
  },
  resultTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 16,
    textAlign: "center",
  },
  bloodTypesGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    justifyContent: "center",
  },
  bloodTypeCard: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 8,
    minWidth: 70,
    justifyContent: "center",
  },
  compatibleCard: {
    backgroundColor: "#f0fdf4",
    borderWidth: 1,
    borderColor: "#059669",
  },
  incompatibleCard: {
    backgroundColor: "#fef2f2",
    borderWidth: 1,
    borderColor: "#ef4444",
  },
  bloodTypeText: {
    fontSize: 14,
    fontWeight: "600",
  },
  compatibleText: {
    color: "#059669",
  },
  incompatibleText: {
    color: "#ef4444",
  },
  specialInfoCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#eff6ff",
    padding: 12,
    borderRadius: 8,
    marginTop: 16,
    gap: 8,
  },
  specialInfoText: {
    flex: 1,
    fontSize: 14,
    color: "#1e40af",
    fontWeight: "500",
  },
  educationCard: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
  },
  educationTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 12,
  },
  factsList: {
    gap: 8,
  },
  factItem: {
    paddingVertical: 4,
  },
  factText: {
    fontSize: 14,
    color: "#666",
    lineHeight: 20,
  },
  emergencyCard: {
    backgroundColor: "#fef2f2",
    borderRadius: 12,
    padding: 20,
    alignItems: "center",
    marginBottom: 20,
  },
  emergencyTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#dc2626",
    marginTop: 8,
    marginBottom: 8,
  },
  emergencyText: {
    fontSize: 14,
    color: "#991b1b",
    textAlign: "center",
    lineHeight: 20,
  },
})
