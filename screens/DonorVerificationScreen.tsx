import { useState } from "react"
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, ScrollView, Alert } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import * as ImagePicker from "expo-image-picker"
import { supabase } from "../lib/supabase"

type DocumentType = "medicalCertificate" | "idProof" | "bloodTestReport"

export default function DonorVerificationScreen({ navigation }: any) {
  const [documents, setDocuments] = useState<Record<DocumentType, any | null>>({
    medicalCertificate: null,
    idProof: null,
    bloodTestReport: null,
  })

  const [loading, setLoading] = useState(false)

  const pickDocument = async (type: DocumentType) => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    })

    if (!result.canceled) {
      setDocuments((prev) => ({
        ...prev,
        [type]: result.assets[0],
      }))
    }
  }

  const submitVerification = async () => {
    if (!documents.medicalCertificate || !documents.idProof) {
      Alert.alert("Error", "Please upload required documents")
      return
    }

    setLoading(true)

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) return

      const { error } = await supabase.from("donor_verifications").insert({
        user_id: user.id,
        status: "pending",
        submitted_at: new Date().toISOString(),
        documents_uploaded: true,
      })

      if (error) throw error

      Alert.alert(
        "Verification Submitted!",
        "Your documents have been submitted for review. You'll be notified within 24-48 hours.",
        [{ text: "OK", onPress: () => navigation.goBack() }],
      )
    } catch (error: any) {
      Alert.alert("Error", error.message)
    } finally {
      setLoading(false)
    }
  }

  const DocumentUpload = ({
    title,
    description,
    type,
    required = false,
  }: {
    title: string
    description: string
    type: DocumentType
    required?: boolean
  }) => (
    <View style={styles.documentCard}>
      <View style={styles.documentHeader}>
        <Text style={styles.documentTitle}>{title}</Text>
        {required && <Text style={styles.requiredBadge}>Required</Text>}
      </View>
      <Text style={styles.documentDescription}>{description}</Text>

      <TouchableOpacity
        style={[styles.uploadButton, documents[type] && styles.uploadedButton]}
        onPress={() => pickDocument(type)}
      >
        <Ionicons
          name={documents[type] ? "checkmark-circle" : "cloud-upload"}
          size={20}
          color={documents[type] ? "#059669" : "#dc2626"}
        />
        <Text style={[styles.uploadText, documents[type] && styles.uploadedText]}>
          {documents[type] ? "Uploaded" : "Upload Document"}
        </Text>
      </TouchableOpacity>
    </View>
  )

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#dc2626" />
        </TouchableOpacity>
        <Text style={styles.title}>Donor Verification</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.infoCard}>
          <Ionicons name="shield-checkmark" size={32} color="#059669" />
          <Text style={styles.infoTitle}>Become a Verified Donor</Text>
          <Text style={styles.infoText}>
            Verification helps recipients trust your donations and gives you priority in the donor network.
          </Text>
        </View>

        <DocumentUpload
          title="Medical Certificate"
          description="Recent health checkup report from a licensed doctor"
          type="medicalCertificate"
          required
        />

        <DocumentUpload
          title="Government ID"
          description="Valid government-issued photo identification"
          type="idProof"
          required
        />

        <DocumentUpload
          title="Blood Test Report"
          description="Recent blood test report showing blood type and health status"
          type="bloodTestReport"
        />

        <View style={styles.benefitsCard}>
          <Text style={styles.benefitsTitle}>Verification Benefits</Text>
          <View style={styles.benefitsList}>
            <View style={styles.benefitItem}>
              <Ionicons name="star" size={16} color="#dc2626" />
              <Text style={styles.benefitText}>Verified donor badge</Text>
            </View>
            <View style={styles.benefitItem}>
              <Ionicons name="flash" size={16} color="#dc2626" />
              <Text style={styles.benefitText}>Priority in emergency requests</Text>
            </View>
            <View style={styles.benefitItem}>
              <Ionicons name="trophy" size={16} color="#dc2626" />
              <Text style={styles.benefitText}>Access to donor rewards program</Text>
            </View>
            <View style={styles.benefitItem}>
              <Ionicons name="people" size={16} color="#dc2626" />
              <Text style={styles.benefitText}>Higher trust from recipients</Text>
            </View>
          </View>
        </View>

        <TouchableOpacity
          style={[styles.submitButton, loading && styles.disabledButton]}
          onPress={submitVerification}
          disabled={loading}
        >
          <Text style={styles.submitButtonText}>Submit for Verification</Text>
        </TouchableOpacity>
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
  infoCard: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 20,
    alignItems: "center",
    marginBottom: 20,
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginTop: 12,
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
    lineHeight: 20,
  },
  documentCard: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  documentHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  documentTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
  },
  requiredBadge: {
    backgroundColor: "#dc2626",
    color: "white",
    fontSize: 12,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  documentDescription: {
    fontSize: 14,
    color: "#666",
    marginBottom: 12,
    lineHeight: 18,
  },
  uploadButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "#dc2626",
    borderStyle: "dashed",
    borderRadius: 8,
    padding: 12,
    gap: 8,
  },
  uploadedButton: {
    borderColor: "#059669",
    backgroundColor: "#f0fdf4",
  },
  uploadText: {
    color: "#dc2626",
    fontSize: 14,
    fontWeight: "500",
  },
  uploadedText: {
    color: "#059669",
  },
  benefitsCard: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
  },
  benefitsTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 16,
  },
  benefitsList: {
    gap: 12,
  },
  benefitItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  benefitText: {
    fontSize: 14,
    color: "#666",
  },
  submitButton: {
    backgroundColor: "#dc2626",
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
    marginBottom: 20,
  },
  disabledButton: {
    opacity: 0.6,
  },
  submitButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
})
