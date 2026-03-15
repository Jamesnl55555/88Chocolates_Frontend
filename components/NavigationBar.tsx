import { IconBriefcase2, IconFileDescription, IconHome, IconPlus, IconUser } from "@tabler/icons-react-native";
import { usePathname, useRouter } from "expo-router";
import { Pressable, StyleSheet, View } from "react-native";

type Props = {
    routeName?: string;
}

export default function NavigationBar({ routeName }: Props) {
    const pathname = usePathname();
    const isHome = pathname === '/HomePage';
    const isProfile = pathname === '/ProfilePage';
    const isInventory = pathname === '/InventoryPage';
    const isPlus = pathname === '/MakeTransactionPage';
    const isReceipt = pathname === '/ReceiptPage';

    const router = useRouter();
    const ProfilePress = () => {
        router.push('/ProfilePage');
    }
    const HomePress = () => {
        router.push('/HomePage');
    }
    const InventoryPress = () => {
        router.push('/InventoryPage');
    }
    const PlusPress = () => {
        router.push('/MakeTransactionPage');
    }
    const ReceiptPress = () => {
        router.push('/ReceiptPage');
    }
    return (
        <View style={styles.navigationBar}>
            <Pressable onPress={HomePress} style={isHome? { backgroundColor: '#411C0E', borderRadius: 50, padding: 10 } : {borderRadius: 50, padding: 10}} >
                <IconHome size={24} color={isHome ? '#ffffff' : '#411C0E'} />
            </Pressable>
            <Pressable onPress={InventoryPress} style={isInventory? { backgroundColor: '#411C0E', borderRadius: 50, padding: 10 } : {borderRadius: 50, padding: 10}}>
                <IconBriefcase2 size={24} color={isInventory ? '#ffffff' : '#411C0E'} />
            </Pressable>
            <Pressable onPress={PlusPress} style={isPlus? { backgroundColor: '#411C0E', borderRadius: 50, padding: 10 } : {borderRadius: 50, padding: 10}}>
                <IconPlus size={24} color={isPlus ? '#ffffff' : '#411C0E'}/>
            </Pressable>
            <Pressable onPress={ReceiptPress} style={isReceipt? { backgroundColor: '#411C0E', borderRadius: 50, padding: 10 } : {borderRadius: 50, padding: 10}} >
                <IconFileDescription size={24} color={isReceipt ? '#ffffff' : '#411C0E'}/>
            </Pressable>
            <Pressable onPress={ProfilePress} style={isProfile? { backgroundColor: '#411C0E', borderRadius: 50, padding: 10 } : {borderRadius: 50, padding: 10}}>
                <IconUser size={24} color={isProfile ? '#ffffff' : '#411C0E'}/>
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
