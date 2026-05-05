import { View, Text, TouchableOpacity } from 'react-native'
import { Ionicons } from '@expo/vector-icons'

export default function BottomTab({ state, descriptors, navigation }: any) {
  console.log("Custom Tab Kepanggil");

  return (
    <View
      style={{
        flexDirection: 'row',
        height: 70,
        backgroundColor: '#fff',
        borderTopWidth: 1,
        borderTopColor: '#eee',
        justifyContent: 'space-around',
        alignItems: 'center',
      }}
    >
      {state.routes.map((route: any, index: number) => {
        const { options } = descriptors[route.key]
        const isFocused = state.index === index

        let iconName: any = 'home-outline'

        if (route.name === 'home')
          iconName = isFocused ? 'home' : 'home-outline'

        if (route.name === 'history/index')
          iconName = isFocused ? 'time' : 'time-outline'

        if (route.name === 'services/index')
          iconName = isFocused ? 'build' : 'build-outline'

        if (route.name === 'profile/index')
          iconName = isFocused ? 'person' : 'person-outline'

        const onPress = () => {
          const event = navigation.emit({
            type: 'tabPress',
            target: route.key,
          })

          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(route.name)
          }
        }

        return (
          <TouchableOpacity
            key={index}
            onPress={onPress}
            style={{ alignItems: 'center' }}
          >
            <Ionicons
              name={iconName}
              size={24}
              color={isFocused ? '#3B7BF6' : '#999'}
            />

            <Text
              style={{
                fontSize: 12,
                color: isFocused ? '#3B7BF6' : '#999',
                marginTop: 2,
              }}
            >
              {options.title}
            </Text>

            {isFocused && (
              <View
                style={{
                  width: 6,
                  height: 6,
                  borderRadius: 3,
                  backgroundColor: '#3B7BF6',
                  marginTop: 4,
                }}
              />
            )}
          </TouchableOpacity>
        )
      })}
    </View>
  )
}