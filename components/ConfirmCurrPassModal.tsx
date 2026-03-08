import { useState } from "react";
import {
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
type Props = {
    onSubmit: (password: string) => void;
    onCancel?: () => void;
    isLoading: boolean;
}

export default function ConfirmCurrPassModal( { onSubmit, onCancel, isLoading }: Props ) {
    const [password, setPassword] = useState("");
    return (
        <View style={styles.container}>
            <View>
                <Text>Current Password:</Text>
                <Text>Please enter your previous password from your account</Text>
            </View>
            <View>
                <TextInput placeholder="Password" secureTextEntry={true} onChangeText={setPassword}/>
            </View>
            <View>
                <TouchableOpacity onPress={() => onSubmit(password)} disabled={isLoading}>
                    <Text>{isLoading ? "Confirming..." : "Continue"}</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={onCancel}>
                    <Text>Cancel</Text>
                </TouchableOpacity>
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    container:{
        position: 'absolute',
        backgroundColor: '#fff',
        padding: 20,
        borderRadius: 45,
        justifyContent: 'center',
        alignItems: 'center',
    }
});