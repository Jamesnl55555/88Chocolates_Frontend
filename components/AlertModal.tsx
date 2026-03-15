import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
type Props = {message: string, headertext: string, onConfirm: () => void};
const AlertModal = ({ message, headertext, onConfirm}: Props) => {
    return (
        <View style={styles.container}>
            <Text style={styles.headerText}>{headertext}</Text>
            <Text style={styles.message}>{message}</Text>
            <TouchableOpacity onPress={onConfirm} style={styles.button}>
                <Text style={{color: '#fff'}}>Confirm</Text>
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
        fontSize: 15,
        marginBottom: 20,
    },
    headerText:{
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 20,
        textAlign: 'center',
        width: '60%',
        color: '#443514'
    },
    button: {
        backgroundColor: '#07f543',
        padding: 15,
        alignItems: 'center',
        width: '50%',
        borderRadius: 30,
    },
})