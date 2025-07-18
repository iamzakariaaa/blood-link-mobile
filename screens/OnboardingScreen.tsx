import { useState, useRef } from "react"
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, Dimensions } from "react-native"
import { FlatList } from "react-native-gesture-handler"
import AsyncStorage from "@react-native-async-storage/async-storage"

const { width } = Dimensions.get("window")

const onboardingData = [
  {
    id: "1",
    title: "Save Lives",
    subtitle: "Connect with people who need your help",
    description: "Your blood donation can save up to 3 lives. Join our community of heroes.",
    icon: "❤️",
    color: "#dc2626",
  },
  {
    id: "2",
    title: "Find Donors",
    subtitle: "Get help when you need it most",
    description: "Quickly find compatible donors in your area during medical emergencies.",
    icon: "🔍",
    color: "#059669",
  },
  {
    id: "3",
    title: "Stay Connected",
    subtitle: "Real-time notifications and updates",
    description: "Get instant alerts for urgent requests and stay updated on your impact.",
    icon: "🔔",
    color: "#7c3aed",
  },
]

export default function OnboardingScreen({ navigation }: any) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const flatListRef = useRef<FlatList>(null)

  const completeOnboarding = async () => {
  await AsyncStorage.setItem("hasSeenOnboarding", "true");
  navigation.replace("Auth");
 };


  const nextSlide = () => {
    if (currentIndex < onboardingData.length - 1) {
      const nextIndex = currentIndex + 1
      flatListRef.current?.scrollToIndex({ index: nextIndex })
      setCurrentIndex(nextIndex)
    } else {
      completeOnboarding()
    }
  }

  const renderOnboardingItem = ({ item }: { item: any }) => (
    <View style={[styles.slide, { backgroundColor: item.color }]}>
      <View style={styles.content}>
        <Text style={styles.icon}>{item.icon}</Text>
        <Text style={styles.title}>{item.title}</Text>
        <Text style={styles.subtitle}>{item.subtitle}</Text>
        <Text style={styles.description}>{item.description}</Text>
      </View>
    </View>
  )

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        ref={flatListRef}
        data={onboardingData}
        renderItem={renderOnboardingItem}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        keyExtractor={(item) => item.id}
        onMomentumScrollEnd={(event) => {
          const index = Math.round(event.nativeEvent.contentOffset.x / width)
          setCurrentIndex(index)
        }}
      />

      <View style={styles.footer}>
        <View style={styles.pagination}>
          {onboardingData.map((_, index) => (
            <View key={index} style={[styles.dot, index === currentIndex && styles.activeDot]} />
          ))}
        </View>

        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.skipButton} onPress={completeOnboarding}>
            <Text style={styles.skipText}>Skip</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.nextButton} onPress={nextSlide}>
            <Text style={styles.nextText}>{currentIndex === onboardingData.length - 1 ? "Get Started" : "Next"}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  slide: {
    width,
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  content: {
    alignItems: "center",
    paddingHorizontal: 40,
  },
  icon: {
    fontSize: 80,
    marginBottom: 30,
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    color: "white",
    textAlign: "center",
    marginBottom: 16,
  },
  subtitle: {
    fontSize: 18,
    color: "rgba(255,255,255,0.9)",
    textAlign: "center",
    marginBottom: 16,
  },
  description: {
    fontSize: 16,
    color: "rgba(255,255,255,0.8)",
    textAlign: "center",
    lineHeight: 24,
  },
  footer: {
    position: "absolute",
    bottom: 50,
    left: 0,
    right: 0,
    paddingHorizontal: 20,
  },
  pagination: {
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: 30,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "rgba(255,255,255,0.3)",
    marginHorizontal: 4,
  },
  activeDot: {
    backgroundColor: "white",
    width: 20,
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  skipButton: {
    padding: 16,
  },
  skipText: {
    color: "rgba(255,255,255,0.7)",
    fontSize: 16,
  },
  nextButton: {
    backgroundColor: "rgba(255,255,255,0.2)",
    borderRadius: 25,
    paddingHorizontal: 30,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.3)",
  },
  nextText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
})
