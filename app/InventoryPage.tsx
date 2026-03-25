import { router } from "expo-router";
import { Text, TouchableOpacity, View } from "react-native";
export default function InventoryPage() {
    
    return (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <Text style={{ fontSize: 24, fontWeight: 'bold' }}>Inventory Page</Text>
            <Text style={{ marginTop: 10 }}>This is where users can manage their Inventory</Text>
            <TouchableOpacity style={{ marginTop: 20 }} onPress={() => router.push('/AddProductsPage')}>
                <Text>Add Product</Text>
            </TouchableOpacity>
        </View>
    );
} 
