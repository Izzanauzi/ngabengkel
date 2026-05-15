import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
// @ts-ignore
import Ionicons from 'react-native-vector-icons/Ionicons';

export default function BottomTab({ state, descriptors, navigation }: any) {
  return (
    <View style={styles.container}>
      {state.routes.map((route: any, index: number) => {
        const { options } = descriptors[route.key];
        const label = options.title !== undefined ? options.title : route.name;

        const isFocused = state.index === index;

        const onPress = () => {
          const event = navigation.emit({
            type: 'tabPress',
            target: route.key,
            canPreventDefault: true,
          });

          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(route.name);
          }
        };

        // Logika penentuan ikon berdasarkan Title/Label
        let iconName = '';
        let activeIconName = '';

        if (label === 'Beranda') {
          iconName = 'home-outline'; activeIconName = 'home';
        } else if (label === 'Servis') {
          iconName = 'construct-outline'; activeIconName = 'construct';
        } else if (label === 'Histori') {
          iconName = 'time-outline'; activeIconName = 'time';
        } else if (label === 'Profil') {
          iconName = 'person-outline'; activeIconName = 'person';
        }

        return (
          <TouchableOpacity
            key={route.key}
            style={styles.navItem}
            onPress={onPress}
            activeOpacity={0.7}
          >
            <Ionicons
              name={isFocused ? activeIconName : iconName}
              size={24}
              color={isFocused ? '#0066cc' : '#667085'}
            />
            <Text style={[styles.navText, isFocused && styles.activeText]}>
              {label}
            </Text>
            {isFocused && <View style={styles.activeDot} />}
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    height: 72,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 8,
    paddingBottom: 8,
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  navItem: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    height: '100%',
  },
  navText: {
    fontSize: 12,
    color: '#667085',
    marginTop: 4,
    fontWeight: '500',
  },
  activeText: {
    color: '#0066cc',
    fontWeight: '700',
  },
  activeDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#0066cc',
    marginTop: 4,
  },
});