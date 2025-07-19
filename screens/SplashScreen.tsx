import { useState, useEffect, useRef } from "react"
import { View, Text, StyleSheet, Animated, Dimensions, Image, TouchableOpacity } from "react-native"

const { width, height } = Dimensions.get("window")

interface SplashScreenProps {
  onFinish: () => void
}

export default function SplashScreen({ onFinish }: SplashScreenProps) {
  const [progress, setProgress] = useState(0)
  const [loadingText, setLoadingText] = useState("Initializing...")
  const [isLoadingComplete, setIsLoadingComplete] = useState(false)

  const fadeAnim = useRef(new Animated.Value(0)).current
  const scaleAnim = useRef(new Animated.Value(0.8)).current
  const progressAnim = useRef(new Animated.Value(0)).current
  const buttonFadeAnim = useRef(new Animated.Value(0)).current

  const loadingSteps = [
    { text: "Initializing BloodLink...", duration: 1200 },
    { text: "Connecting to servers...", duration: 1000 },
    { text: "Loading your profile...", duration: 1200 },
    { text: "Checking for updates...", duration: 1000 },
    { text: "Preparing blood requests...", duration: 1200 },
    { text: "Almost ready...", duration: 1000 },
    { text: "Welcome to BloodLink!", duration: 400 },
  ]

  useEffect(() => {
    // Start entrance animations
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }),
    ]).start()

    const totalStepsDuration = loadingSteps.reduce((sum, step) => sum + step.duration, 0)
    let cumulativeStepDuration = 0
    let currentStepIndex = 0
    const startTime = Date.now()

    const updateLoading = () => {
      const now = Date.now()
      const elapsedSinceStart = now - startTime

      // Update progress based on total duration of all steps
      const currentOverallProgress = (elapsedSinceStart / totalStepsDuration) * 100
      setProgress(Math.min(currentOverallProgress, 100))
      Animated.timing(progressAnim, {
        toValue: currentOverallProgress / 100,
        duration: 50,
        useNativeDriver: false,
      }).start()

      // Update loading text based on steps
      if (currentStepIndex < loadingSteps.length) {
        const currentStep = loadingSteps[currentStepIndex]
        setLoadingText(currentStep.text)

        // Move to next step after its duration
        if (elapsedSinceStart >= cumulativeStepDuration + currentStep.duration) {
          cumulativeStepDuration += currentStep.duration
          currentStepIndex++
        }
      } else {
        // If all steps are done, keep the last loading text
        setLoadingText(loadingSteps[loadingSteps.length - 1].text)
      }

      // Show button when progress reaches 100%
      if (elapsedSinceStart >= totalStepsDuration && !isLoadingComplete) {
        setIsLoadingComplete(true)
        clearInterval(interval)

        // Animate button appearance
        Animated.timing(buttonFadeAnim, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }).start()
      }
    }

    const interval = setInterval(updateLoading, 50)

    return () => {
      clearInterval(interval)
    }
  }, [isLoadingComplete])

  const handleGetStarted = () => {
    // Animate button and screen fade out
    Animated.parallel([
      Animated.timing(buttonFadeAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }),
    ]).start(() => {
      onFinish()
    })
  }

  return (
    <View style={styles.container}>
      <Animated.View
        style={[
          styles.content,
          {
            opacity: fadeAnim,
            transform: [{ scale: scaleAnim }],
          },
        ]}
      >
        {/* Logo Section */}
        <View style={styles.logoContainer}>
          <Image source={require("../assets/logo-icon.png")} style={styles.logo} />
          <Text style={styles.title}> BloodLink </Text>
        </View>

        {/* Loading Section */}
        <View style={styles.loadingContainer}>
          {!isLoadingComplete && (
            <>
              <Text style={styles.loadingText}>{loadingText}</Text>

              {/* Progress Bar */}
              <View style={styles.progressBarContainer}>
                <View style={styles.progressBarBackground}>
                  <Animated.View
                    style={[
                      styles.progressBarFill,
                      {
                        width: progressAnim.interpolate({
                          inputRange: [0, 1],
                          outputRange: ["0%", "100%"],
                        }),
                      },
                    ]}
                  />
                </View>
                <Text style={styles.progressText}>{Math.round(progress)}%</Text>
              </View>

              {/* Loading Dots */}
              <View style={styles.dotsContainer}>
                <LoadingDot delay={0} />
                <LoadingDot delay={200} />
                <LoadingDot delay={400} />
              </View>
            </>
          )} 
          {isLoadingComplete && (
            <Animated.View style={[styles.buttonContainer, { opacity: buttonFadeAnim }]}>
              <Text style={styles.tagline}>Connecting Lives, Saving Hearts</Text>
              <TouchableOpacity style={styles.getStartedButton} onPress={handleGetStarted}>
                <Text style={styles.getStartedButtonText}>Let's Get Started</Text>
              </TouchableOpacity>
            </Animated.View>
          )}
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>Powered by iamzakariaaa</Text>
          <Text style={styles.versionText}>v1.0.0</Text>
        </View>
      </Animated.View>
    </View>
  )
}

function LoadingDot({ delay }: { delay: number }) {
  const dotAnim = useRef(new Animated.Value(0.3)).current

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(dotAnim, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.timing(dotAnim, {
          toValue: 0.3,
          duration: 600,
          useNativeDriver: true,
        }),
      ]),
    )

    const timeout = setTimeout(() => {
      animation.start()
    }, delay)

    return () => {
      clearTimeout(timeout)
      animation.stop()
    }
  }, [delay])

  return (
    <Animated.View
      style={[
        styles.dot,
        {
          opacity: dotAnim,
        },
      ]}
    />
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "white",
  },
  content: {
    flex: 1,
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 80,
    paddingHorizontal: 40,
  },
  logoContainer: {
    alignItems: "center",
    marginTop: 60,
  },
  logo: {
    width: 200,
    height: 200,
    resizeMode: "contain",
    marginBottom:0
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    textAlign: "center",
    color: "#dc2626",
    marginBottom: 8,
  },
  tagline: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    fontStyle: "italic",
    marginVertical:20
  },
  loadingContainer: {
    alignItems: "center",
    width: "100%",
    minHeight: 120, 
  },
  loadingText: {
    fontSize: 16,
    color: "#333",
    textAlign: "center",
    marginBottom: 30,
    minHeight: 20,
  },
  progressBarContainer: {
    width: "100%",
    alignItems: "center",
    marginBottom: 20,
  },
  progressBarBackground: {
    width: "80%",
    height: 6,
    backgroundColor: "#e0e0e0",
    borderRadius: 3,
    overflow: "hidden",
    marginBottom: 8,
  },
  progressBarFill: {
    height: "100%",
    backgroundColor: "#dc2626",
    borderRadius: 3,
  },
  progressText: {
    fontSize: 14,
    color: "#333",
    fontWeight: "600",
  },
  dotsContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
    marginTop: 20,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#dc2626",
  },
  buttonContainer: {
    alignItems: "center",
    justifyContent: "center",
  },
  welcomeText: {
    fontSize: 18,
    color: "#333",
    textAlign: "center",
    marginBottom: 30,
    fontWeight: "600",
  },
  getStartedButton: {
    backgroundColor: "#dc2626",
    borderRadius: 25,
    paddingHorizontal: 40,
    paddingVertical: 15
  },
  getStartedButtonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
    textAlign: "center",
  },
  footer: {
    alignItems: "center",
    marginBottom: 20,
  },
  footerText: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
    marginBottom: 4,
  },
  versionText: {
    fontSize: 12,
    color: "#999",
    textAlign: "center",
  },
})
