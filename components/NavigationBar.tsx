import { usePathname, useRouter } from "expo-router";
import { Pressable, StyleSheet, View } from "react-native";
import Svg, { Path } from 'react-native-svg';

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
            <Pressable onPress={HomePress} style={isHome ? { backgroundColor: '#411C0E', borderRadius: 50, padding: 9 } : { borderRadius: 50, padding: 9 }}>
                <Svg width={35} height={35} viewBox="0 0 40 40" fill="none">
                    <Path d="M15 36.6663V19.9997H25V36.6663M5 14.9997L20 3.33301L35 14.9997V33.333C35 34.2171 34.6488 35.0649 34.0237 35.69C33.3986 36.3152 32.5507 36.6663 31.6667 36.6663H8.33333C7.44928 36.6663 6.60143 36.3152 5.97631 35.69C5.35119 35.0649 5 34.2171 5 33.333V14.9997Z" 
                        stroke={isHome ? '#ffffff' : '#411C0E'} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                </Svg>
            </Pressable>
            <Pressable onPress={TransactionPress} style={isTransaction ? { backgroundColor: '#411C0E', borderRadius: 50, padding: 9 } : { borderRadius: 50, padding: 9 }}>
                <Svg width={35} height={35} viewBox="0 0 40 40" fill="none">
                    <Path d="M36.6663 20.0003H26.6663L23.333 25.0003H16.6663L13.333 20.0003H3.33301M36.6663 20.0003V30.0003C36.6663 30.8844 36.3152 31.7322 35.69 32.3573C35.0649 32.9825 34.2171 33.3337 33.333 33.3337H6.66634C5.78229 33.3337 4.93444 32.9825 4.30932 32.3573C3.6842 31.7322 3.33301 30.8844 3.33301 30.0003V20.0003M36.6663 20.0003L30.9163 8.51699C30.6404 7.96164 30.215 7.49428 29.6879 7.16746C29.1609 6.84064 28.5531 6.66732 27.933 6.66699H12.0663C11.4462 6.66732 10.8384 6.84064 10.3114 7.16746C9.78438 7.49428 9.35897 7.96164 9.08301 8.51699L3.33301 20.0003" 
                        stroke={isTransaction ? '#ffffff' : '#411C0E'} strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />
                </Svg>
            </Pressable>
            <Pressable onPress={PlusPress} style={isAddProduct ? { backgroundColor: '#411C0E', borderRadius: 50, padding: 9 } : { borderRadius: 50, padding: 9 }}>
                <Svg width={35} height={35} viewBox="0 0 24 24" fill="none">
                    <Path d="M12 5V19M5 12H19" stroke={isAddProduct ? '#ffffff' : '#411C0E'} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                </Svg>
            </Pressable>
            <Pressable onPress={TransactionRecordPress} style={isTransactionRecord ? { backgroundColor: '#411C0E', borderRadius: 50, padding: 9 } : { borderRadius: 50, padding: 9 }}>
                <Svg width={35} height={35} viewBox="0 0 40 40" fill="none">
                    <Path d="M23.3337 3.33301H10.0003C9.11627 3.33301 8.26842 3.6842 7.6433 4.30932C7.01818 4.93444 6.66699 5.78229 6.66699 6.66634V33.333C6.66699 34.2171 7.01818 35.0649 7.6433 35.69C8.26842 36.3152 9.11627 36.6663 10.0003 36.6663H30.0003C30.8844 36.6663 31.7322 36.3152 32.3573 35.69C32.9825 35.0649 33.3337 34.2171 33.3337 33.333V13.333M23.3337 3.33301L33.3337 13.333M23.3337 3.33301L23.3337 13.333H33.3337M26.667 21.6663H13.3337M26.667 28.333H13.3337M16.667 14.9997H13.3337" 
                        stroke={isTransactionRecord ? '#ffffff' : '#411C0E'} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                </Svg>
            </Pressable>
            <Pressable onPress={InventoryPress} style={isInventory ? { backgroundColor: '#411C0E', borderRadius: 50, padding: 9 } : { borderRadius: 50, padding: 9 }}>
                <Svg width={35} height={35} viewBox="0 0 48 48" fill="none">
                    <Path d="M33 18.7998L15 8.4198M6.54 13.9198L24 24.0198L41.46 13.9198M24 44.1598V23.9998M42 31.9998V15.9998C41.9993 15.2984 41.8141 14.6094 41.4631 14.0021C41.112 13.3948 40.6075 12.8905 40 12.5398L26 4.5398C25.3919 4.18873 24.7021 4.00391 24 4.00391C23.2979 4.00391 22.6081 4.18873 22 4.5398L8 12.5398C7.39253 12.8905 6.88796 13.3948 6.53692 14.0021C6.18589 14.6094 6.00072 15.2984 6 15.9998V31.9998C6.00072 32.7013 6.18589 33.3902 6.53692 33.9975C6.88796 34.6048 7.39253 35.1091 8 35.4598L22 43.4598C22.6081 43.8109 23.2979 43.9957 24 43.9957C24.7021 43.9957 25.3919 43.8109 26 43.4598L40 35.4598C40.6075 35.1091 41.112 34.6048 41.4631 33.9975C41.8141 33.3902 41.9993 32.7013 42 31.9998Z" 
                        stroke={isInventory ? '#ffffff' : '#411C0E'} strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />
                </Svg>
            </Pressable>
        </View>
    );
}

const styles = StyleSheet.create({
    navigationBar: {
        position: 'absolute',
        bottom: 40,
        width: '90%',
        flexDirection: 'row',
        alignSelf: 'center',
        justifyContent: 'space-around',
        alignItems: 'center',
        height: 65,
        borderTopWidth: 2,
        borderColor: '#0f0e0e',
        borderWidth: 2,
        borderRadius: 50,
    },
});
