import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
type Props = {message: string, headertext: string, onConfirm: () => void};
const AlertModal = ({ message, headertext, onConfirm}: Props) => {
    return (
        <View style={styles.container}>
            <Text>{headertext}</Text>
            <Text style={styles.message}>{message}</Text>
            <TouchableOpacity onPress={onConfirm} style={styles.button}>
                <Text>Confirm</Text>
            </TouchableOpacity>
        </View>
    );
};


export default AlertModal;

const styles = StyleSheet.create({
    container:{
        position: 'absolute',
        backgroundColor: '#fff',
        padding: 20,
        borderRadius: 45,
        justifyContent: 'center',
        alignItems: 'center',
    },
    message: {
        fontSize: 18,
        marginBottom: 20,
    },
    button: {
        backgroundColor: 'blue',
        padding: 10,
        borderRadius: 5,
    },
})