import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
type Props = { onConfirm: () => void, onCancel: () => void, headertext: string, message: string, productName?: string };
const ConfirmAlertModal = ({ onConfirm, onCancel, headertext, message, productName }: Props) => {
    return (
        <View style={styles.backdrop}>
            <View style={styles.container}>
                <Text style={styles.headerText}>{headertext}</Text>
{productName ? (
    <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center',  }}>
        <Text style={styles.message}>Delete </Text>
        <Text style={[styles.message, { fontWeight: 'bold' }]}>{productName}</Text><Text style={styles.message}>?</Text>
        <Text style={styles.message}> This action cannot be undone.</Text>
    </View>
) : (
  <Text style={styles.message}>{message}</Text>
)}
                
            <View style={{flexDirection: 'row', justifyContent: 'space-evenly', width: '100%'}}>
                <TouchableOpacity onPress={onCancel} style={styles.Canbutton}>
                    <Text style={{color: '#fff', fontWeight: 800}}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={onConfirm} style={styles.Confbutton}>
                <Text style={{color: '#fff', fontWeight: 800}}>Delete</Text>
                </TouchableOpacity>
            </View>
        </View>
        </View>
    );
};


export default ConfirmAlertModal;

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
        top: -40,
    },
    message: {
        fontSize: 15,
        textAlign: 'center',
        color: '#333',
        marginVertical: 1,
        flexWrap: 'wrap',
    },
    headerText:{
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 10,
        marginTop: 20,
        textAlign: 'center',
        width: '60%',
        color: '#443514'
    },
    Confbutton: {
        backgroundColor: '#B00B0BCC',
        padding: 15,
        alignItems: 'center',
        width: '45%',
        borderRadius: 30,
        marginBottom: 8,
        marginTop: 25,
    },
    Canbutton: {
        backgroundColor: '#565656CC',
        padding: 15,
        alignItems: 'center',
        width: '45%',
        borderRadius: 30,
        marginBottom: 8,
        marginTop: 25,
    },
})