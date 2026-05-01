import { StyleSheet, Text, View } from 'react-native'
import React from 'react'

export default function bottomTab() {
  return (
    <View style={styles.container}>
      <Text>navbar</Text>
    </View>
  )
}

const styles = StyleSheet.create({
    container : {
        height: "screen",
        backgroundColor: "red",
        width: 50
    }
})