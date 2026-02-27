import { IconBriefcase2, IconFileDescription, IconHome, IconPlus, IconUser } from "@tabler/icons-react-native";
import { useRouter } from "expo-router";
import { Pressable, StyleSheet, View } from "react-native";


export default function NavigationBar() {
    const router = useRouter();
    const ProfilePress = () => {
        router.push('/ProfilePage');
    }
    return (
        <View style={styles.navigationBar}>
            <Pressable>
                <IconHome size={24} />
            </Pressable>
            <Pressable>
                <IconBriefcase2 size={24} />
            </Pressable>
            <Pressable>
                <IconPlus size={24} />
            </Pressable>
            <Pressable>
                <IconFileDescription size={24} />
            </Pressable>
            <Pressable onPress={ProfilePress}>
                <IconUser size={24} />
            </Pressable>
        </View>
    );
}

const styles = StyleSheet.create({
    navigationBar: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'center',
        height: 60,
        backgroundColor: '#fff',
        borderTopWidth: 1,
        borderTopColor: '#e0e0e0',
    },
});
