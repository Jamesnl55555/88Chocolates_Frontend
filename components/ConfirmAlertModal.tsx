import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
type Props = { onConfirm: () => void, onCancel: () => void};
const ConfirmAlertModal = ({ onConfirm, onCancel}: Props) => {
    return (
        <View style={styles.container}>
            <Text style={styles.headerText}>Confirm Delete</Text>
            <Text style={styles.message}>are you sure you want to delete the selected transactions?</Text>
            <View style={{flexDirection: 'row', justifyContent: 'space-between', width: '100%'}}>
                <TouchableOpacity onPress={onConfirm} style={styles.Confbutton}>
                <Text style={{color: '#fff'}}>Delete</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={onCancel} style={styles.Canbutton}>
                    <Text style={{color: '#fff'}}>Cancel</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
};


export default ConfirmAlertModal;

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
    Confbutton: {
        backgroundColor: '#9d0909',
        padding: 15,
        alignItems: 'center',
        width: '50%',
        borderRadius: 30,
    },
    Canbutton: {
        backgroundColor: '#666866',
        padding: 15,
        alignItems: 'center',
        width: '50%',
        borderRadius: 30,
    },
})