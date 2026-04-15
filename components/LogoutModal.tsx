import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

type Props = {
    onConfirm: () => void;
    onCancel: () => void;
    isLoading?: boolean
}
export default function LogoutModal({onConfirm, onCancel, isLoading}: Props) {
    return (
        <View style={styles.backdrop}>
            <View style={styles.container}>
                <Text style={{fontSize: 20, fontWeight: 'bold', marginVertical: 8, color: '#5c3406'}}>Confirm Logout</Text>
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
        </View>
    );
}

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
    container: {
        backgroundColor: '#fff',
        width: '90%',
        padding: 20,
        borderRadius: 45,
        justifyContent: 'center',
        alignItems: 'center',
        top: -30,
    },
    message: {
        fontSize: 16,
        marginBottom: 25,
        color: '#411C0E'
    },
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 15,
        width: '97%',
    },
    confirmbutton: {
        width: '40%',
        alignItems: 'center',
        backgroundColor: '#B00B0BCC',
        padding: 10,
        borderRadius: 45,
    },
    cancelbutton: {
        width: '40%',
        alignItems: 'center',
        backgroundColor: '#565656CC',
        padding: 10,
        borderRadius: 45,
    },
    text: {
        color: '#fff',
        fontWeight: 'bold',
    },
});