import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

type Props = {
    onConfirm: () => void;
    onCancel: () => void;
    isLoading?: boolean
}
export default function LogoutModal({onConfirm, onCancel, isLoading}: Props) {
    return (
        <View style={styles.container}>
            <Text style={{fontSize: 20, fontWeight: 'bold', marginBottom: 10, color: '#5c3406'}}>Confirm Logout</Text>
            <Text style={styles.message}>Are you sure you want to logout?</Text>
            <View style={styles.buttonContainer}>
                <TouchableOpacity style={styles.confirmbutton} onPress={onConfirm}>
                    <Text style={styles.text}>{isLoading ? "Logging out..." : "Logout"}</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.cancelbutton} onPress={onCancel}>
                    <Text style={styles.text}>Cancel</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#fff',
        padding: 20,
        borderRadius: 45,
    },
    message: {
        fontSize: 16,
        marginBottom: 20,
    },
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 10,
        width: '100%',
    },
    confirmbutton: {
        width: '40%',
        alignItems: 'center',
        backgroundColor: 'red',
        padding: 10,
        borderRadius: 45,
    },
    cancelbutton: {
        width: '40%',
        alignItems: 'center',
        backgroundColor: 'grey',
        padding: 10,
        borderRadius: 45,
    },
    text: {
        color: '#fff',
        fontWeight: 'bold',
    },
});