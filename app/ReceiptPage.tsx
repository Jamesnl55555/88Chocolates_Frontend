import { Text, View } from "react-native";

export default function ReceiptPage() {
    return (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <Text style={{ fontSize: 24, fontWeight: 'bold' }}>Receipt Page</Text>
            <Text style={{ marginTop: 10 }}>This is where users can manage their Receipts.</Text>
        </View>
    );
} 
