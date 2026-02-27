import { Text, View } from "react-native";

export default function MakeTransactionPage() {
    return (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <Text style={{ fontSize: 24, fontWeight: 'bold' }}>Make Transaction Page</Text>
            <Text style={{ marginTop: 10 }}>This is where users can create new transactions.</Text>
        </View>
    );
} 
