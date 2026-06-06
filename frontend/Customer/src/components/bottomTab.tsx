import { View, Text, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";

const TAB_ROUTES = ["home", "services/index", "history/index", "profile/index"];
const ROUTE_LABELS: Record<string, string> = {
  home: "Beranda",
  "services/index": "Servis",
  services: "Servis",
  "history/index": "Riwayat",
  history: "Riwayat",
  "profile/index": "Profil",
  profile: "Profil",
};

// Map non-tab routes to the tab that should appear active
const PARENT_TAB: Record<string, string> = {
  "kendaraan/index": "profile/index",
  "kendaraan/create": "profile/index",
  "kendaraan/[kendaraan]": "profile/index",
  "booking/index": "services/index",
  "booking/[id]": "services/index",
  "services/[id]": "services/index",
  "schedule/index": "home",
};

export default function BottomTab({ state, descriptors, navigation }: any) {
  const currentRouteName = state.routes[state.index]?.name ?? "";
  const activeTabRoute = PARENT_TAB[currentRouteName] ?? currentRouteName;

  return (
    <View
      style={{
        flexDirection: "row",
        height: 70,
        backgroundColor: "#fff",
        borderTopWidth: 1,
        borderTopColor: "#eee",
        justifyContent: "space-around",
        alignItems: "center",
      }}
    >
      {state.routes
        .filter((route: any) => TAB_ROUTES.includes(route.name))
        .filter(
          (route: any, idx: number, arr: any[]) =>
            arr.findIndex(
              (r) => ROUTE_LABELS[r.name] === ROUTE_LABELS[route.name]
            ) === idx
        )
        .map((route: any) => {
          const { options } = descriptors[route.key];
          const isFocused = route.name === activeTabRoute;
          const label = options.title ?? ROUTE_LABELS[route.name] ?? route.name;

          let iconName: any = "home-outline";
          if (route.name === "home")
            iconName = isFocused ? "home" : "home-outline";
          if (route.name === "services" || route.name === "services/index")
            iconName = isFocused ? "build" : "build-outline";
          if (route.name === "history" || route.name === "history/index")
            iconName = isFocused ? "time" : "time-outline";
          if (route.name === "profile" || route.name === "profile/index")
            iconName = isFocused ? "person" : "person-outline";

          const onPress = () => {
            const event = navigation.emit({
              type: "tabPress",
              target: route.key,
            });
            const isOnMainRoute = currentRouteName === route.name;
            if (!isOnMainRoute && !event.defaultPrevented) {
              navigation.navigate(route.name);
            }
          };

          return (
            <TouchableOpacity
              key={route.key}
              onPress={onPress}
              style={{ alignItems: "center" }}
            >
              <Ionicons
                name={iconName}
                size={24}
                color={isFocused ? "#3B7BF6" : "#999"}
              />
              <Text
                style={{
                  fontSize: 12,
                  color: isFocused ? "#3B7BF6" : "#999",
                  marginTop: 2,
                }}
              >
                {label}
              </Text>
            </TouchableOpacity>
          );
        })}
    </View>
  );
}
