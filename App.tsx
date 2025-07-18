
import "react-native-url-polyfill/auto"
import { useState, useEffect } from "react"
import { NavigationContainer } from "@react-navigation/native"
import { createStackNavigator } from "@react-navigation/stack"
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs"
import { StatusBar } from "expo-status-bar"
import AsyncStorage from "@react-native-async-storage/async-storage"
import type { Session } from "@supabase/supabase-js"
import { supabase } from "./lib/supabase"
import SplashScreen from "./screens/SplashScreen"
import OnboardingScreen from "./screens/OnboardingScreen"
import AuthScreen from "./screens/AuthScreen"
import ProfileSetupScreen from "./screens/ProfileSetupScreen"
import FeedScreen from "./screens/FeedScreen"
import MapScreen from "./screens/MapScreen"
import ProfileScreen from "./screens/ProfileScreen"
import HistoryScreen from "./screens/HistoryScreen"
import CreateRequestScreen from "./screens/CreateRequestScreen"
import EmergencyRequestScreen from "./screens/EmergencyRequestScreen"
import ChatScreen from "./screens/ChatScreen"
import DonorVerificationScreen from "./screens/DonorVerificationScreen"
import RewardsScreen from "./screens/RewardsScreen"
import BloodCompatibilityScreen from "./screens/BloodCompatibilityScreen"
import NotificationSettingsScreen from "./screens/NotificationSettingsScreen"
import { Ionicons } from "@expo/vector-icons"
import { registerForPushNotificationsAsync } from "./lib/notifications"
import MessagesListScreen from "./screens/MessagesListScreen"

const Stack = createStackNavigator()
const Tab = createBottomTabNavigator()

const HomeStack = createStackNavigator()
const ExploreStack = createStackNavigator()
const RequestsStack = createStackNavigator()
const MessagesStack = createStackNavigator()
const ProfileStack = createStackNavigator()

function HomeStackScreen() {
  return (
    <HomeStack.Navigator screenOptions={{ headerShown: false }}>
      <HomeStack.Screen name="HomeMain" component={FeedScreen} />
      <HomeStack.Screen name="EmergencyRequest" component={EmergencyRequestScreen} />
      <HomeStack.Screen name="CreateRequest" component={CreateRequestScreen} />
    </HomeStack.Navigator>
  )
}

function ExploreStackScreen() {
  return (
    <ExploreStack.Navigator screenOptions={{ headerShown: false }}>
      <ExploreStack.Screen name="ExploreMain" component={MapScreen} />
      <ExploreStack.Screen name="BloodCompatibility" component={BloodCompatibilityScreen} />
    </ExploreStack.Navigator>
  )
}

function RequestsStackScreen() {
  return (
    <RequestsStack.Navigator screenOptions={{ headerShown: false }}>
      <RequestsStack.Screen name="RequestsMain" component={HistoryScreen} />
    </RequestsStack.Navigator>
  )
}

function MessagesStackScreen() {
  return (
    <MessagesStack.Navigator screenOptions={{ headerShown: false }}>
      <MessagesStack.Screen name="MessagesMain" component={MessagesListScreen} />
      <MessagesStack.Screen name="Chat" component={ChatScreen} />
    </MessagesStack.Navigator>
  )
}

function ProfileStackScreen() {
  return (
    <ProfileStack.Navigator screenOptions={{ headerShown: false }}>
      <ProfileStack.Screen name="ProfileMain" component={ProfileScreen} />
      <ProfileStack.Screen name="DonorVerification" component={DonorVerificationScreen} />
      <ProfileStack.Screen name="Rewards" component={RewardsScreen} />
      <ProfileStack.Screen name="NotificationSettings" component={NotificationSettingsScreen} />
    </ProfileStack.Navigator>
  )
}

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: keyof typeof Ionicons.glyphMap

          switch (route.name) {
            case "Home":
              iconName = focused ? "home" : "home-outline"
              break
            case "Explore":
              iconName = focused ? "search" : "search-outline"
              break
            case "Requests":
              iconName = focused ? "heart" : "heart-outline"
              break
            case "Messages":
              iconName = focused ? "chatbubble" : "chatbubble-outline"
              break
            case "Profile":
              iconName = focused ? "person" : "person-outline"
              break
            default:
              iconName = "help-outline"
          }

          return <Ionicons name={iconName} size={size} color={color} />
        },
        tabBarActiveTintColor: "#dc2626",
        tabBarInactiveTintColor: "#9ca3af",
        tabBarStyle: {
          backgroundColor: "white",
          borderTopWidth: 1,
          borderTopColor: "#f3f4f6",
          paddingBottom: 8,
          paddingTop: 8,
          height: 88,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: "500",
        },
        headerShown: false,
      })}
    >
      <Tab.Screen name="Home" component={HomeStackScreen} />
      <Tab.Screen name="Explore" component={ExploreStackScreen} />
      <Tab.Screen name="Requests" component={RequestsStackScreen} />
      <Tab.Screen name="Messages" component={MessagesStackScreen} />
      <Tab.Screen name="Profile" component={ProfileStackScreen} />
    </Tab.Navigator>
  )
}

export default function App() {
  const [session, setSession] = useState<Session | null>(null)
  const [hasProfile, setHasProfile] = useState(false)
  const [hasSeenOnboarding, setHasSeenOnboarding] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    initializeApp()
  }, [])

  const initializeApp = async () => {
    try {
      // Check onboarding status
      await checkOnboarding()

      // Get current session
      const {
        data: { session },
      } = await supabase.auth.getSession()
      setSession(session)

      if (session) {
        await checkProfile(session.user.id)
        registerForPushNotificationsAsync()
      }

      // Set up auth state listener
      supabase.auth.onAuthStateChange((_event, session) => {
        setSession(session)
        if (session) {
          checkProfile(session.user.id)
          registerForPushNotificationsAsync()
        }
      })
    } catch (error) {
      console.error("Error initializing app:", error)
      // Only set loading to false if there's an error
      setIsLoading(false)
    }
  }

  const checkOnboarding = async () => {
    try {
      const value = await AsyncStorage.getItem("hasSeenOnboarding")
      setHasSeenOnboarding(value === "true")
    } catch (error) {
      console.log("Error checking onboarding:", error)
    }
  }

  const checkProfile = async (userId: string) => {
    try {
      const { data } = await supabase.from("profiles").select("*").eq("id", userId).single()
      setHasProfile(!!data)
    } catch (error) {
      console.log("Error checking profile:", error)
    }
  }

  const handleSplashFinish = () => {
    setIsLoading(false)
  }

  if (isLoading) {
    return <SplashScreen onFinish={handleSplashFinish} />
  }

  return (
    <NavigationContainer>
      <StatusBar style="light" />
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!hasSeenOnboarding ? (
          <Stack.Screen name="Onboarding" component={OnboardingScreen} />
        ) : !session ? (
          <Stack.Screen name="Auth" component={AuthScreen} />
        ) : !hasProfile ? (
          <Stack.Screen name="ProfileSetup" component={ProfileSetupScreen} />
        ) : (
          <>
            <Stack.Screen name="Main" component={MainTabs} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  )
}
