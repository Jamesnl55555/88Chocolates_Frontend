import { IconBrandDropbox, IconBriefcase2, IconFileDescription, IconHome, IconPlus } from "@tabler/icons-react-native";
import { usePathname, useRouter } from "expo-router";
import { Pressable, StyleSheet, View } from "react-native";

type Props = {
    routeName?: string;
}

export default function NavigationBar({ routeName }: Props) {
    const pathname = usePathname();
    const isHome = pathname === '/HomePage';
    const isTransaction = pathname === '/MakeTransactionPage';
    const isInventory = pathname === '/InventoryPage';
    const isTransactionRecord = pathname === '/TransactionRecordPage';
     const isAddProduct = pathname === '/AddProductsPage';

    const router = useRouter();
    const InventoryPress = () => {
        router.push('/InventoryPage');
    }
    const HomePress = () => {
        router.push('/HomePage');
    }
    const TransactionPress = () => {
        router.push('/MakeTransactionPage');
    }
    const PlusPress = () => {
        router.push('/AddProductsPage');
    }
    const TransactionRecordPress = () => {
        router.push('/TransactionRecordPage');
    }
    return (
        <View style={styles.navigationBar}>
            <Pressable onPress={HomePress} style={isHome? { backgroundColor: '#411C0E', borderRadius: 50, padding: 10 } : {borderRadius: 50, padding: 10}} >
                <IconHome size={24} color={isHome ? '#ffffff' : '#411C0E'} />
            </Pressable>
            <Pressable onPress={TransactionPress} style={isTransaction? { backgroundColor: '#411C0E', borderRadius: 50, padding: 10 } : {borderRadius: 50, padding: 10}}>
                <IconBriefcase2 size={24} color={isTransaction ? '#ffffff' : '#411C0E'} />
            </Pressable>
            <Pressable onPress={PlusPress} style={isAddProduct? { backgroundColor: '#411C0E', borderRadius: 50, padding: 10 } : {borderRadius: 50, padding: 10}}>
                <IconPlus size={24} color={isAddProduct ? '#ffffff' : '#411C0E'}/>
            </Pressable>
            <Pressable onPress={TransactionRecordPress} style={isTransactionRecord? { backgroundColor: '#411C0E', borderRadius: 50, padding: 10 } : {borderRadius: 50, padding: 10}} >
                <IconFileDescription size={24} color={isTransactionRecord ? '#ffffff' : '#411C0E'}/>
            </Pressable>
            <Pressable onPress={InventoryPress} style={isInventory? { backgroundColor: '#411C0E', borderRadius: 50, padding: 10 } : {borderRadius: 50, padding: 10}}>
                <IconBrandDropbox size={24} color={isInventory ? '#ffffff' : '#411C0E'}/>
            </Pressable>
        </View>
    );
}

const styles = StyleSheet.create({
    navigationBar: {
        position: 'absolute',
        bottom: 40,
        width: '80%',
        flexDirection: 'row',
        alignSelf: 'center',
        justifyContent: 'space-around',
        alignItems: 'center',
        height: 60,
        borderTopWidth: 1,
        borderColor: '#0f0e0e',
        borderWidth: 1,
        borderRadius: 30
    },
});
