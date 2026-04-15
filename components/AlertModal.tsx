import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

type Props = {message: string, headertext: string, onConfirm: () => void};
const AlertModal = ({ message, headertext, onConfirm}: Props) => {
    return (
        <View style={styles.backdrop}>
            <View style={styles.container}>
                <Text style={styles.headerText}>{headertext}</Text>
                <Text style={styles.message}>{message}</Text>
                
                <TouchableOpacity onPress={onConfirm} style={styles.button}>
                    <Text style={styles.buttonText}>Confirm</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
};


export default AlertModal;

const styles = StyleSheet.create({
    backdrop: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#411C0E80',
    },
    container:{
        backgroundColor: '#fff',
        width: '90%',
        paddingVertical: 15,
        paddingHorizontal: 15,
        borderRadius: 45,
        justifyContent: 'center',
        alignItems: 'center',
        top: -30,
    },
    message: {
        fontSize: 15,
        marginBottom: 25,
        textAlign: 'center',
        color: '#333',
    },
    headerText:{
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 15,
        marginTop: 20,
        textAlign: 'center',
        color: '#443514'
    },
    button: {
        backgroundColor: '#2FA262CC',
        paddingVertical: 12,
        alignItems: 'center',
        paddingHorizontal: 50,
        borderRadius: 30,
        marginBottom: 3,
    },
    buttonText: {
        color: '#fff',
        fontWeight: 700,
        fontSize: 16,
    },
})